"""Imitation-reward PPO for native MuJoCo Microban one-leg balance.

The floating root is only assigned at reset. All subsequent motion comes from
the upstream XML position actuators (kp=.277, force limit=.77 Nm). The actor
emits bounded target corrections around an adapted reference and an equilibrium
feedforward target. There is no root assistance or mocap weld; configured
disturbance tests apply explicitly logged horizontal trunk forces.
"""
from __future__ import annotations
import concurrent.futures
import hashlib
import json
import math
import time
from pathlib import Path

import mujoco
import numpy as np
import torch
from torch import nn

ROOT=Path(__file__).resolve().parents[2]
MODEL=ROOT/'vendor/mjlab_microban/src/mjlab_microban/robot/microban/scene.xml'

def sha256(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()

class OneLegEnv:
    dt=.02
    def __init__(self, reference, n=64, seed=0, workers=8, horizon=12, perturb=.006, transition=False, model_path=None,push_magnitude=0.,push_seed=None,push_mode='cardinal',push_jitter=.3):
        self.reference=Path(reference)
        info=json.loads(self.reference.read_text())
        self.model_path=Path(model_path or info.get('model_path',MODEL))
        self.model=mujoco.MjModel.from_xml_path(str(self.model_path))
        self.model.opt.timestep=.002
        self.model.opt.iterations=50
        self.qref=np.array(info['qpos'],np.float64)
        self.target=np.array(info['target'],np.float64)
        self.names=[self.model.actuator(i).name for i in range(self.model.nu)]
        self.n=n;self.seed=seed;self.rng=np.random.default_rng(seed)
        self.data=[mujoco.MjData(self.model) for _ in range(n)]
        self.pool=concurrent.futures.ThreadPoolExecutor(max_workers=workers)
        self.horizon=horizon;self.perturb=perturb;self.transition=transition
        self.push_magnitude=float(push_magnitude)
        self.push_mode=push_mode;self.push_jitter=push_jitter
        self.pushrng=np.random.default_rng(seed+991 if push_seed is None else push_seed)
        self.pushes=[[] for _ in range(n)]
        self.metric_cache=[None for _ in range(n)]
        self.support_loads=np.zeros((n,3))
        self.age=np.zeros(n,np.int64);self.prev=np.zeros((n,19),np.float32)
        self.episode_reward=np.zeros(n);self.episode_success=np.zeros(n)
        self.left=self.model.site('left_foot').id;self.right=self.model.site('right_foot').id
        self.floor=self.model.geom('floor').id
        self.lgeoms=np.array([i for i in range(self.model.ngeom) if self.model.geom(i).name.startswith('left_foot_collision')])
        self.rgeoms=np.array([i for i in range(self.model.ngeom) if self.model.geom(i).name.startswith('right_foot_collision')])
        self.footset=set(self.lgeoms)|set(self.rgeoms)
        self.lo=self.model.actuator_ctrlrange[:,0];self.hi=self.model.actuator_ctrlrange[:,1]
        self.obsdim=70
        if self.transition:self.prepare_transition_reference()
        self.reset()

    def prepare_transition_reference(self):
        """Offline FK reference and equilibrium feedforward for shifting/lifting."""
        d=mujoco.MjData(self.model);qs=[];targets=[]
        for tick in range(126):
            t=tick*self.dt
            shift=np.clip(t/1.5,0,1);lift=np.clip((t-1.)/1.5,0,1)
            shift=shift*shift*(3-2*shift);lift=lift*lift*(3-2*lift)
            q=self.qref[7:].copy()
            for i,name in enumerate(self.names):
                if any(w in name for w in ['hip','knee','ankle']):q[i]*=shift if name.startswith('left') else lift
            d.qpos[:]=self.qref;d.qpos[7:]=q;mujoco.mj_forward(self.model,d)
            d.qpos[2]-=d.site_xpos[self.left,2];mujoco.mj_forward(self.model,d)
            com=d.subtree_com[1];lp=d.site_xpos[self.left];rp=d.site_xpos[self.right]
            weight=float(np.clip((com[1]-rp[1])/(lp[1]-rp[1]),0,1))
            if lift>0:weight=1.
            qforce=d.qfrc_bias.copy()
            for site,share in [(self.left,weight),(self.right,1-weight)]:
                jp=np.zeros((3,self.model.nv));jr=np.zeros_like(jp)
                point=np.array([com[0],d.site_xpos[site,1],0.])
                mujoco.mj_jac(self.model,d,jp,jr,point,int(self.model.site_bodyid[site]))
                qforce-=jp.T@np.array([0,0,share*self.model.body_mass.sum()*9.81])
            targets.append(q+qforce[6:]/self.model.actuator_gainprm[:,0]);qs.append(q)
        self.transition_q=np.array(qs);self.transition_target=np.array(targets)

    def reset(self,ids=None, perturb=None):
        ids=range(self.n) if ids is None else ids
        p=self.perturb if perturb is None else perturb
        for k in ids:
            d=self.data[k];mujoco.mj_resetData(self.model,d)
            d.qpos[:]=self.qref
            d.qpos[7:]+=self.rng.normal(0,p,19)
            rot=np.r_[1.,self.rng.normal(0,p/2,3)];rot/=np.linalg.norm(rot)
            d.qpos[3:7]=rot
            d.qvel[:3]=self.rng.normal(0,p,3)
            d.qvel[3:6]=self.rng.normal(0,p*2,3)
            d.qvel[6:]=self.rng.normal(0,p,19)
            d.ctrl[:]=np.clip(self.target,self.lo,self.hi)
            if self.transition:
                # Bilateral home reset; reference follows a gradual shift/lift.
                d.qpos[7:]=self.qref[7:]
                for side in ['left','right']:
                    for name in ['hip_roll','hip_pitch','knee','ankle_roll','ankle_pitch']:
                        d.qpos[self.model.joint(f'{side}_{name}').qposadr[0]]=0.
                d.qpos[:3]=[0,0,.168]
                d.qpos[7:]+=self.rng.normal(0,p,19)
            mujoco.mj_forward(self.model,d)
            self.metric_cache[k]=None
            self.pushes[k]=[]
            for t in (4.,8.,12.):
                when=float(t+self.pushrng.uniform(-self.push_jitter,self.push_jitter));direction=int(self.pushrng.integers(4))
                angle=(0.,np.pi,np.pi/2,3*np.pi/2)[direction]
                if self.push_mode=='diagonal':angle+=np.pi/4
                elif self.push_mode=='random':angle=float(self.pushrng.uniform(0,2*np.pi))
                self.pushes[k].append({'time_s':when,'duration_s':.10,'direction':direction,'direction_world_xy':[float(np.cos(angle)),float(np.sin(angle))]})
            self.age[k]=0;self.prev[k]=0;self.episode_reward[k]=0;self.episode_success[k]=0
        return self.observe()

    def reference_now(self,k):
        if not self.transition:return self.qref[7:],self.target
        i=min(int(self.age[k]),125)
        return self.transition_q[i],self.transition_target[i]

    def metrics(self,k):
        d=self.data[k]
        if self.metric_cache[k] is not None and self.metric_cache[k][0]==d.time:return self.metric_cache[k][1]
        mat=d.xmat[1].reshape(3,3)
        gravity=mat.T@np.array([0.,0.,-1.])
        left_load=right_load=forbidden_load=0.
        force=np.zeros(6)
        for index,c in enumerate(d.contact):
            if self.floor not in c.geom:continue
            g=int(c.geom[1] if c.geom[0]==self.floor else c.geom[0])
            mujoco.mj_contactForce(self.model,d,index,force)
            load=abs(float(force[0]))
            if g in self.lgeoms:left_load+=load
            elif g in self.rgeoms:right_load+=load
            else:forbidden_load+=load
        self.support_loads[k]=[left_load,right_load,forbidden_load]
        left_contact=int(left_load>.3*self.model.body_mass.sum()*9.81)
        right_contact=int(right_load>.02)
        forbidden=int(forbidden_load>.02)
        def minimum_height(geoms):
            heights=[]
            for g in geoms:
                rotation=d.geom_xmat[g].reshape(3,3)
                heights.append(d.geom_xpos[g,2]-np.abs(rotation[2])@self.model.geom_size[g])
            return float(min(heights))
        clearance=minimum_height(self.rgeoms)
        tilt=math.acos(float(np.clip(mat[2,2],-1,1)))
        com_error=d.subtree_com[1,:2]-d.site_xpos[self.left,:2]
        success=clearance>.01 and left_contact>0 and right_contact==0 and forbidden==0 and tilt<math.radians(20) and d.qpos[2]>.135
        result=(gravity,clearance,tilt,com_error,bool(success),left_contact,right_contact,forbidden)
        self.metric_cache[k]=(d.time,result)
        return result

    def observe(self):
        obs=[]
        for k,d in enumerate(self.data):
            grav,h,tilt,com,success,lc,rc,fc=self.metrics(k)
            q,_=self.reference_now(k)
            # Floating root velocities are simulation-state inputs, explicitly
            # privileged. There is no claim of a hardware-ready observation set.
            mat=d.xmat[1].reshape(3,3)
            obs.append(np.r_[d.qpos[7:]-q,d.qvel[6:]*.1,grav,mat.T@d.qvel[3:6],mat.T@d.qvel[:3]*5,com*20,h*20,d.qpos[2]*5,self.prev[k]])
        return np.asarray(obs,np.float32)

    def _step_one(self,k,action):
        _,target=self.reference_now(k)
        d=self.data[k]
        d.xfrc_applied[:]=0.
        if self.push_magnitude:
            t=float(d.time)
            for push in self.pushes[k]:
                # Quantized to the .02s policy clock: each100ms push is5ticks.
                start=round(push['time_s']/self.dt)*self.dt
                if start-1e-8<=t<start+push['duration_s']-1e-8:
                    d.xfrc_applied[1,:2]=self.push_magnitude*np.array(push['direction_world_xy'])
        d.ctrl[:]=np.clip(target+action,self.lo,self.hi)
        mujoco.mj_step(self.model,d,nstep=10)

    def step(self,actions,auto_reset=True):
        list(self.pool.map(lambda k:self._step_one(k,actions[k]),range(self.n)))
        self.age+=1
        reward=np.empty(self.n,np.float32);done=np.zeros(self.n,bool);info=[]
        for k,d in enumerate(self.data):
            grav,h,tilt,com,success,lc,rc,fc=self.metrics(k)
            q,_=self.reference_now(k)
            qerr=np.mean((d.qpos[7:]-q)**2)
            speed=np.dot(d.qvel[:3],d.qvel[:3]);gyro=np.dot(d.qvel[3:6],d.qvel[3:6])
            reward[k]=1.2*np.exp(-qerr*20)+1.5*np.exp(-tilt**2*20)+np.exp(-np.dot(com,com)*1000)+1.*min(max(h,0)/.025,1)+2.*success-.2*gyro-.5*speed-.003*np.mean(actions[k]**2)-.008*np.mean((actions[k]-self.prev[k])**2)-1.5*bool(rc)-3*bool(fc)
            fell=d.qpos[2]<.115 or tilt>math.radians(40) or fc>0
            if fell:reward[k]-=10
            done[k]=fell or self.age[k]>=round(self.horizon/self.dt)
            self.episode_reward[k]+=reward[k]
            self.episode_success[k]+=success*self.dt
            if done[k]:info.append({'reward':float(self.episode_reward[k]),'single_support_s':float(self.episode_success[k]),'duration':float(self.age[k]*self.dt),'fall':bool(fell)})
        self.prev[:]=actions
        obs=self.observe()
        if auto_reset and done.any():
            self.reset(np.flatnonzero(done));obs=self.observe()
        return obs,reward,done,info

    def close(self):self.pool.shutdown()

class ActorCritic(nn.Module):
    def __init__(self,obsdim=70):
        super().__init__()
        self.balance=nn.Linear(obsdim,19)
        self.residual=nn.Sequential(nn.Linear(obsdim,64),nn.Tanh(),nn.Linear(64,64),nn.Tanh(),nn.Linear(64,19))
        self.critic=nn.Sequential(nn.Linear(obsdim,64),nn.Tanh(),nn.Linear(64,64),nn.Tanh(),nn.Linear(64,1))
        self.logstd=nn.Parameter(torch.full((19,),-3.))
        nn.init.zeros_(self.balance.weight);nn.init.zeros_(self.balance.bias)
        nn.init.zeros_(self.residual[-1].weight);nn.init.zeros_(self.residual[-1].bias)
        # Transparent physically derived stabilizing initialization, subsequently
        # optimized by PPO. The learned checkpoint contains every feedback weight.
        with torch.no_grad():
            self.balance.weight[17,38]=4.;self.balance.weight[17,42]=.8
            self.balance.weight[18,39]=-8.;self.balance.weight[18,41]=1.6
    def mean(self,x):return self.balance(x)+self.residual(x)*.15
    def value(self,x):return self.critic(x).squeeze(-1)
    def distribution(self,x):return torch.distributions.Normal(self.mean(x),torch.exp(self.logstd).clamp(.008,.3))
    def forward(self,x):return self.mean(x)

def save_checkpoint(path,policy,reference,iterations,transitions,config):
    torch.save({'model':policy.state_dict(),'reference_path':str(Path(reference).resolve()),'reference_sha256':sha256(reference),'iterations':iterations,'transitions':transitions,'config':config,'architecture':'linear_feedback_plus_64x64_residual_v1'},path)

def train(reference,output,iterations=200,n=64,seed=42,device='cpu',resume=None,transition=False,push_magnitude=0.):
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    torch.set_num_threads(4);torch.manual_seed(seed);np.random.seed(seed)
    env=OneLegEnv(reference,n=n,seed=seed,horizon=18 if push_magnitude else 15 if transition else 12,transition=transition,push_magnitude=push_magnitude)
    policy=ActorCritic(env.obsdim).to(device)
    if transition:
        with torch.no_grad():
            policy.balance.weight[8,38]=4.;policy.balance.weight[8,42]=.8
            policy.balance.weight[9,39]=-8.;policy.balance.weight[9,41]=1.6
            for i in range(19):policy.balance.weight[i,i]=-4.
    start=0
    if resume:
        saved=torch.load(resume,map_location=device,weights_only=False);policy.load_state_dict(saved['model']);start=saved['iterations']
    if push_magnitude:
        # Preserve the validated feedback controller while the residual learns
        # compensating pose corrections from actual disturbed rollouts.
        for parameter in policy.balance.parameters():parameter.requires_grad=False
        with torch.no_grad():policy.logstd.fill_(-3.7)
    optimizer=torch.optim.Adam(policy.parameters(),lr=1e-4)
    steps=32;gamma=.995;lam=.95
    config={'seed':seed,'n_env':n,'steps':steps,'device':device,'control_dt':env.dt,'physics_timestep':env.model.opt.timestep,'motor':'official XML .277 kp, .77 Nm cap, .041 joint damping, .013 frictionloss','root_dynamics':'free joint; reset-only assignments; external xfrc_applied disturbances only' if push_magnitude else 'free joint; reset-only assignments; no external forces','observation':'70 dimensions with privileged simulator root velocities and COM/foot heights','reward':'joint imitation + upright/COM/foot clearance/contact + action/velocity penalties','support_initialization':'bilateral standing; reference shifts/lifts into adapted Kimodo hold' if transition else 'retargeted single-leg reference reset; transition evaluated separately','transition':transition,'push_magnitude_N':push_magnitude,'frozen_initialized_balance_weights':bool(push_magnitude),'push_protocol':'three100ms horizontal forces applied at trunk COM, cardinal direction and±.3s timing randomized around4/8/12s; curriculum .2→target magnitude' if push_magnitude else None}
    config.update({'centering_height_feedback_coefficient':float(policy.balance.weight[18,49]),'resume_checkpoint':str(Path(resume).resolve()) if resume else None,'resume_checkpoint_sha256':sha256(resume) if resume else None,'additional_iterations':iterations})
    (output/'manifest.json').write_text(json.dumps({**config,'reference':str(Path(reference).resolve()),'reference_sha256':sha256(reference),'model':str(env.model_path),'model_sha256':sha256(env.model_path),'code_sha256':sha256(__file__)},indent=2))
    (output/'one_leg_training_source.py').write_text(Path(__file__).read_text())
    if not resume:save_checkpoint(output/'policy_initial.pt',policy,reference,0,0,config)
    obs=env.observe();records=[];begin=time.time()
    log=(output/'training.jsonl').open('a')
    for iteration in range(start,start+iterations):
        if push_magnitude:env.push_magnitude=push_magnitude*min(1.,.2+.8*(iteration-start)/max(iterations*.6,1))
        storage=[];episodes=[]
        for _ in range(steps):
            o=torch.as_tensor(obs,device=device)
            with torch.no_grad():
                dist=policy.distribution(o);a=dist.sample();lp=dist.log_prob(a).sum(-1);v=policy.value(o)
            nextobs,r,done,ep=env.step(a.cpu().numpy())
            storage.append((o,a,lp,v,torch.as_tensor(r*.1,device=device),torch.as_tensor(done,device=device)))
            episodes+=ep;obs=nextobs
        with torch.no_grad():last=policy.value(torch.as_tensor(obs,device=device))
        adv=[];carry=torch.zeros(n,device=device)
        for t in range(steps-1,-1,-1):
            o,a,lp,v,r,d=storage[t];nv=last if t==steps-1 else storage[t+1][3]
            delta=r+gamma*nv*(~d)-v;carry=delta+gamma*lam*(~d)*carry;adv.append(carry)
        advantage=torch.stack(adv[::-1]);returns=advantage+torch.stack([x[3] for x in storage])
        flatobs=torch.cat([x[0] for x in storage]);flata=torch.cat([x[1] for x in storage]);oldlp=torch.cat([x[2] for x in storage]);flatadv=advantage.flatten();flatret=returns.flatten()
        flatadv=(flatadv-flatadv.mean())/(flatadv.std()+1e-8)
        losses=[]
        for epoch in range(4):
            order=torch.randperm(n*steps,device=device)
            for ids in order.split(512):
                dist=policy.distribution(flatobs[ids]);lp=dist.log_prob(flata[ids]).sum(-1);ratio=(lp-oldlp[ids]).exp()
                actor=-torch.minimum(ratio*flatadv[ids],ratio.clamp(.8,1.2)*flatadv[ids]).mean()
                value=.5*(policy.value(flatobs[ids])-flatret[ids]).square().mean()
                entropy=dist.entropy().sum(-1).mean()
                loss=actor+.2*value-.0001*entropy
                optimizer.zero_grad();loss.backward();nn.utils.clip_grad_norm_(policy.parameters(),1.);optimizer.step();losses.append(float(loss))
        record={'iteration':iteration+1,'transitions':(iteration+1)*n*steps,'elapsed_s':time.time()-begin,'mean_step_reward':float(torch.stack([x[4] for x in storage]).mean()),'loss':float(np.mean(losses)),'episodes':episodes,'mean_std':float(policy.logstd.exp().mean())}
        log.write(json.dumps(record)+'\n');log.flush()
        if (iteration+1)%10==0:
            print(json.dumps({k:v for k,v in record.items() if k!='episodes'}),flush=True)
            save_checkpoint(output/f'policy_{iteration+1:04d}.pt',policy,reference,iteration+1,(iteration+1)*n*steps,config)
    save_checkpoint(output/'policy_final.pt',policy,reference,start+iterations,(start+iterations)*n*steps,config)
    log.close();env.close()
    return output/'policy_final.pt'

def load_policy(checkpoint,reference=None):
    saved=torch.load(checkpoint,map_location='cpu',weights_only=False)
    reference=Path(reference or saved['reference_path'])
    if sha256(reference)!=saved['reference_sha256']:raise ValueError('reference hash mismatch')
    actor=ActorCritic();actor.load_state_dict(saved['model']);actor.eval()
    return actor,reference,saved

def evaluate(checkpoint,output,n=64,seed=23000,perturb=.01,horizon=15,transition=False,reference=None,push_magnitude=0.,push_mode='cardinal',push_jitter=.3):
    torch.set_num_threads(1)
    actor,reference,saved=load_policy(checkpoint,reference)
    env=OneLegEnv(reference,n=n,seed=seed,horizon=horizon,perturb=perturb,transition=transition,push_magnitude=push_magnitude,push_mode=push_mode,push_jitter=push_jitter)
    obs=env.observe();alive=np.ones(n,bool);sustain=np.zeros(n);maxsustain=np.zeros(n);total=np.zeros(n);fall=np.zeros(n,bool);minheight=np.ones(n);maxangle=np.zeros(n)
    traces=[];recovery_run=np.zeros((n,3));recovery_time=np.full((n,3),np.nan);pushprotocol=[json.loads(json.dumps(x)) for x in env.pushes]
    for step in range(round(horizon/env.dt)):
        with torch.no_grad():a=actor(torch.from_numpy(obs)).numpy()
        obs,r,done,info=env.step(a,auto_reset=False)
        for k in range(n):
            if not alive[k]:continue
            grav,h,tilt,com,success,lc,rc,fc=env.metrics(k)
            sustain[k]=sustain[k]+env.dt if success else 0;maxsustain[k]=max(sustain[k],maxsustain[k]);total[k]+=success*env.dt
            if step*env.dt>3: minheight[k]=min(minheight[k],h)
            maxangle[k]=max(maxangle[k],math.degrees(tilt))
            for event,push in enumerate(env.pushes[k]):
                end=round(push['time_s']/env.dt)*env.dt+push['duration_s']
                now=env.data[k].time
                if end<=now<=end+3. and np.isnan(recovery_time[k,event]):
                    recovery_run[k,event]=recovery_run[k,event]+env.dt if success else 0.
                    if recovery_run[k,event]>=1.-1e-9:recovery_time[k,event]=now-end-1.
            if done[k]:alive[k]=False;fall[k]=step<round(horizon/env.dt)-1
        if step%25==0:
            d=env.data[0];traces.append({'time_s':float(d.time),'qpos':d.qpos.copy().tolist(),'qvel':d.qvel.copy().tolist(),'right_clearance_m':env.metrics(0)[1],'single_support':env.metrics(0)[4]})
    rows=[{'index':k,'sustained_single_support_s':float(maxsustain[k]),'total_single_support_s':float(total[k]),'minimum_right_clearance_after_3s_m':float(minheight[k]),'maximum_tilt_deg':float(maxangle[k]),'fall':bool(fall[k]),'post_push_recovery_delay_s':[None if np.isnan(x) else float(max(x,0)) for x in recovery_time[k]],'success':bool(maxsustain[k]>=10 and not fall[k] and (not push_magnitude or np.isfinite(recovery_time[k]).all())),'pushes':pushprotocol[k]} for k in range(n)]
    result={'task':'one_leg_stand','backend':'native MuJoCo','checkpoint':str(Path(checkpoint).resolve()),'checkpoint_sha256':sha256(checkpoint),'reference':str(reference),'seed':seed,'n':n,'perturb_std_joint_rad_and_root_rotation_rad':perturb,'horizon_s':horizon,'transition_from_bilateral':transition,'push_magnitude_N':push_magnitude,'push_direction_mode':push_mode,'push_jitter_s':push_jitter,'push_impulse_Ns_each':.1*push_magnitude,'criterion':'left foot normal ground load>30%mg, right and all other ground loads<.02N, other foot minimum box-collider clearance >1cm, root height>.135m, trunk tilt<20deg; sustained >=10sec and no fall; each push followed by1sec continuous single support within3sec','passed':sum(x['success'] for x in rows),'rows':rows,'trace_seed0':traces,'manifest':saved['config']}
    output=Path(output);output.mkdir(parents=True,exist_ok=True);(output/'evaluation.json').write_text(json.dumps(result,indent=2));env.close()
    return result

def render(checkpoint,output,seed=24000,horizon=15,perturb=.005,transition=False,reference=None,push_magnitude=0.):
    import imageio.v2 as imageio
    from PIL import Image,ImageDraw,ImageFont
    torch.set_num_threads(1)
    actor,reference,saved=load_policy(checkpoint,reference)
    env=OneLegEnv(reference,n=1,seed=seed,horizon=horizon,perturb=perturb,transition=transition,push_magnitude=push_magnitude)
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    renderer=mujoco.Renderer(env.model,height=720,width=960)
    camera=mujoco.MjvCamera();camera.lookat[:]=[.0,-.01,.15];camera.distance=.58;camera.azimuth=135;camera.elevation=-12
    obs=env.observe();frames={};trace=[]
    count=round(horizon/env.dt)
    chosen=[0,count//4,count//2,3*count//4,count-1]
    video=output/'one_leg.mp4'
    writer=imageio.get_writer(video,fps=50,codec='libx264',quality=8)
    font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
    for step in range(round(horizon/env.dt)):
        with torch.no_grad():a=actor(torch.from_numpy(obs)).numpy()
        obs,r,done,info=env.step(a,auto_reset=False)
        renderer.update_scene(env.data[0],camera=camera)
        frame=renderer.render().copy();im=Image.fromarray(frame);draw=ImageDraw.Draw(im)
        h=env.metrics(0)[1];force=env.data[0].xfrc_applied[1,:2]
        draw.rectangle((0,0,960,66),fill=(18,24,32))
        draw.text((16,8),f'Microban | Kimodo reference + learned PPO | MuJoCo | update {saved["iterations"]}',fill='white',font=font)
        recent=''
        if push_magnitude:
            for push in env.pushes[0]:
                start=round(push['time_s']/env.dt)*env.dt
                if start<=env.data[0].time<start+.7:
                    xy=push.get('direction_world_xy',((1,0),(-1,0),(0,1),(0,-1))[push['direction']])
                    recent=f'  Recent physical push ({xy[0]*push_magnitude:+.1f},{xy[1]*push_magnitude:+.1f}) N / 100ms'
        draw.text((16,34),f't={env.data[0].time:5.2f}s  right foot clearance={h*100:4.1f}cm'+recent,fill=(255,215,105) if recent else 'white',font=font)
        writer.append_data(np.asarray(im))
        if step in chosen:frames[step]=np.asarray(im)
        trace.append({'time_s':float(env.data[0].time),'qpos':env.data[0].qpos.copy().tolist(),'qvel':env.data[0].qvel.copy().tolist(),'action':a[0].tolist(),'right_clearance_m':h,'single_support':env.metrics(0)[4],'trunk_force_world_N':env.data[0].xfrc_applied[1,:3].tolist(),'ground_loads_left_right_other_N':env.support_loads[0].tolist()})
    writer.close()
    for index in chosen:Image.fromarray(frames[index]).save(output/f'frame_{index:04d}.png')
    sheet=Image.new('RGB',(960*3,720*2),(24,24,24))
    for k,index in enumerate(chosen):sheet.paste(Image.fromarray(frames[index]),((k%3)*960,(k//3)*720))
    sheet.save(output/'contact_sheet.jpg')
    metadata={'task':'one_leg_stand','backend':'native MuJoCo '+mujoco.__version__,'checkpoint':str(Path(checkpoint).resolve()),'checkpoint_sha256':sha256(checkpoint),'reference':str(reference),'seed':seed,'perturb':perturb,'transition_from_bilateral':transition,'push_magnitude_N':push_magnitude,'pushes':env.pushes[0],'duration_s':horizon,'fps':50,'frames':count,'video':str(video),'qpos_assignments':'reset only; rollout controlled by checkpoint actuator targets','manifest':saved['config'],'trace':trace}
    (output/'video.json').write_text(json.dumps(metadata,indent=2));renderer.close();env.close();return metadata
