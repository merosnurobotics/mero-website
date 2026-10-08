"""Compare three control components under matched Native MuJoCo initial states."""
import argparse, hashlib, importlib.util, json
from pathlib import Path
import numpy as np
import torch

parser=argparse.ArgumentParser();parser.add_argument('--checkpoint',required=True);parser.add_argument('--reference',required=True);parser.add_argument('--output',required=True);parser.add_argument('--n',type=int,default=8);args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
source=root/'private/education-assets/kimodo-mjwarp/code/one_leg_native.py'
spec=importlib.util.spec_from_file_location('archived_native',source);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
saved=torch.load(args.checkpoint,map_location='cpu',weights_only=False)
actor=module.ActorCritic();actor.load_state_dict(saved['model']);actor.eval();torch.set_num_threads(1)
output=[];initial_hash=None
for condition in ['reference','balance','learned']:
    env=module.OneLegEnv(args.reference,n=args.n,seed=75501,workers=4,horizon=18,perturb=.006,transition=True,push_magnitude=0.)
    obs=env.observe();digest=hashlib.sha256(np.array([d.qpos.copy() for d in env.data]).tobytes()).hexdigest()
    if initial_hash is None:initial_hash=digest
    assert initial_hash==digest
    alive=np.ones(args.n,bool);fell=np.zeros(args.n,bool);longest=np.zeros(args.n);current=np.zeros(args.n);torque=np.zeros(args.n);errors=[[] for _ in range(args.n)];changes=[[] for _ in range(args.n)];previous=np.zeros((args.n,19))
    for tick in range(900):
        with torch.no_grad():
            x=torch.from_numpy(obs)
            actions=np.zeros((args.n,19),np.float32) if condition=='reference' else (actor.balance(x) if condition=='balance' else actor(x)).numpy()
        obs,_,done,_=env.step(actions,auto_reset=False)
        for i,d in enumerate(env.data):
            if not alive[i]:continue
            _,_,tilt,_,success,_,_,forbidden=env.metrics(i)
            current[i]=current[i]+env.dt if success else 0.;longest[i]=max(longest[i],current[i])
            q,_=env.reference_now(i);errors[i].append(float(np.mean((d.qpos[7:]-q)**2)));changes[i].append(float(np.mean((actions[i]-previous[i])**2)))
            torque[i]=max(torque[i],float(np.max(np.abs(d.actuator_force))))
            fell[i]|=bool(d.qpos[2]<.115 or tilt>np.radians(40) or forbidden>0)
            if done[i]:alive[i]=False
        previous=actions.copy()
    rows=[{'episode':i,'passed':bool(not fell[i] and longest[i]>=10),'fell':bool(fell[i]),'longest_single_support_s':float(longest[i]),'joint_error_rms_rad':float(np.sqrt(np.mean(errors[i]))),'action_change_rms_rad':float(np.sqrt(np.mean(changes[i]))),'max_torque_nm':float(torque[i])} for i in range(args.n)]
    result={'condition':condition,'passed':sum(row['passed'] for row in rows),'n':args.n,'mean_joint_error_rms_rad':float(np.mean([r['joint_error_rms_rad'] for r in rows])),'mean_action_change_rms_rad':float(np.mean([r['action_change_rms_rad'] for r in rows])),'max_torque_nm':float(max(r['max_torque_nm'] for r in rows)),'rows':rows};output.append(result);print(json.dumps({k:v for k,v in result.items() if k!='rows'}),flush=True);env.close()
manifest={'backend':'Native MuJoCo CPU','seed':75501,'n':args.n,'horizon_s':18,'perturb_std':.006,'external_force_n':0,'transition':True,'scope':'Matched initial states; one trained checkpoint; no retraining, dynamics randomization or hardware','checkpoint_sha256':hashlib.sha256(Path(args.checkpoint).read_bytes()).hexdigest(),'reference_sha256':hashlib.sha256(Path(args.reference).read_bytes()).hexdigest(),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'evaluation_script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'initial_qpos_sha256':initial_hash,'results':output}
Path(args.output).write_text(json.dumps(manifest,indent=2)+'\n')
