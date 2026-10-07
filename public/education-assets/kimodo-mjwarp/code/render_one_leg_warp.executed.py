#!/usr/bin/env python3
"""Render real GPU rollout; CPU MjData is a read-only graphics snapshot."""
import argparse
import json
import math
import sys
from pathlib import Path
import imageio.v2 as imageio
import mujoco
import mujoco_warp as mw
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import torch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'src'))
from microban_rl.one_leg import load_policy, sha256
from microban_rl.one_leg_warp import OneLegWarpEnv

p=argparse.ArgumentParser()
p.add_argument('--checkpoint',required=True);p.add_argument('--reference',required=True)
p.add_argument('--evaluation',required=True);p.add_argument('--output',required=True)
a=p.parse_args();expected=json.loads(Path(a.evaluation).read_text())
actor,reference,saved=load_policy(a.checkpoint,a.reference);actor=actor.to('cuda:0')
env=OneLegWarpEnv(reference,n=expected['n'],seed=expected['seed'],perturb=expected['perturb'],
                  horizon=expected['horizon_s'],push_magnitude=expected['push_magnitude_N'],
                  push_mode=expected['push_mode'],push_jitter=expected['push_jitter_s'])
assert env.template.pushes[0]==expected['rows'][0]['pushes']
output=Path(a.output);output.mkdir(parents=True,exist_ok=True)
initial_qpos=env.qpos[0].cpu().tolist();initial_qvel=env.qvel[0].cpu().tolist()
snapshot=mujoco.MjData(env.model);renderer=mujoco.Renderer(env.model,width=800,height=608)
camera=mujoco.MjvCamera();camera.lookat[:]=[0,-.01,.155]
camera.distance=.70;camera.azimuth=135;camera.elevation=-12
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
obs=env.observe();trace=[];snapshots={};first_failure=None;torque_peak=0.
external_z=external_torque=nontrunk_force=generalized_force=0.
evaldiff=[];count=round(expected['horizon_s']/env.dt)
video=output/'one_leg.mp4';writer=imageio.get_writer(video,fps=50,codec='libx264',quality=8)
try:
    for tick in range(count):
        with torch.no_grad():actions=actor(obs)
        obs,reward,done,info=env.step(actions,auto_reset=False)
        # The renderer copies integrated GPU state. No mj_step/mj_forward or
        # synthesized pose is applied to this graphics-only CPU snapshot.
        mw.get_data_into(snapshot,env.model,env.data,world_id=0)
        _,h,tilt,com,support,*_=env.metrics()
        if done[0] and tick<count-1 and first_failure is None:first_failure=(tick+1)*env.dt
        renderer.update_scene(snapshot,camera=camera)
        frame=Image.fromarray(renderer.render().copy());draw=ImageDraw.Draw(frame)
        draw.rectangle((0,0,800,78),fill=(18,24,32))
        draw.text((12,6),'Actual MuJoCo-Warp GPU | text-reference PPO | motor dynamics',fill='white',font=font)
        draw.text((12,29),'Native PPO460 + GPU PPO120 | random 1N / 100ms x3 | seed74201',fill='white',font=font)
        force=env.xfrc_applied[0,1,:3].cpu().numpy()
        status='LEFT single support' if support[0] else 'bilateral / transition'
        draw.text((12,52),f't={(tick+1)*env.dt:.2f}s | {status} | forceXY=({force[0]:+.2f},{force[1]:+.2f})N',fill=(255,215,105),font=font)
        arr=np.asarray(frame);writer.append_data(arr)
        if tick in [0,225,450,675,count-1]:snapshots[tick]=arr.copy()
        qpos=env.qpos[0].cpu().tolist()
        trace.append({'time_s':(tick+1)*env.dt,'qpos':qpos,'qvel':env.qvel[0].cpu().tolist(),
                      'action':actions[0].cpu().tolist(),'right_clearance_m':float(h[0]),
                      'trunk_tilt_deg':math.degrees(float(tilt[0])),'single_support':bool(support[0]),
                      'ground_loads_left_right_other_N':env.support_loads[0].cpu().tolist(),
                      'trunk_force_world_N':force.tolist(),'done':bool(done[0])})
        torque_peak=max(torque_peak,float(env.torque_peak.max()))
        external_z=max(external_z,float(env.xfrc_applied[:,:,2].abs().max()))
        external_torque=max(external_torque,float(env.xfrc_applied[:,:,3:].abs().max()))
        nontrunk_force=max(nontrunk_force,float(torch.cat((env.xfrc_applied[:,:1,:3],env.xfrc_applied[:,2:,:3]),1).abs().max()))
        generalized_force=max(generalized_force,float(env.qfrc_applied.abs().max()))
        if tick%25==0:evaldiff.append(float(np.max(np.abs(np.asarray(qpos)-expected['trace_seed0'][tick//25]['qpos']))))
        if (tick+1)%150==0:print(f'GPU physics+CPU graphics {tick+1}/{count}',flush=True)
finally:
    writer.close();renderer.close();env.close()
for tick,arr in snapshots.items():Image.fromarray(arr).save(output/f'frame_{tick:04d}.png')
sheet=Image.new('RGB',(1600,608*3),(24,24,24))
for index,arr in enumerate(snapshots.values()):sheet.paste(Image.fromarray(arr),((index%2)*800,(index//2)*608))
sheet.save(output/'contact_sheet.jpg')
metadata={'backend':'actual MuJoCo-Warp GPU integration, native MuJoCo OSMesa rendering only',
          'checkpoint':str(Path(a.checkpoint).resolve()),'checkpoint_sha256':sha256(a.checkpoint),
          'reference':str(reference),'reference_sha256':sha256(reference),'evaluation':a.evaluation,
          'evaluation_sha256':sha256(a.evaluation),'seed':expected['seed'],'n_physics_envs':expected['n'],
          'rendered_env':0,'duration_s':expected['horizon_s'],'fps':50,'frames':count,
          'video':str(video),'video_sha256':sha256(video),'initial_qpos':initial_qpos,'initial_qvel':initial_qvel,
          'pushes':env.template.pushes[0],'first_failure_time_s':first_failure,
          'GPU_eval_qpos_samples_max_abs_difference':max(evaldiff),'qpos_samples_compared':len(evaldiff),
          'root_writes_after_reset':0,'physics_substeps_per_environment':count*10,
          'peak_motor_torque_all_2ms_substeps_all_envs_Nm':torque_peak,
          'peak_vertical_external_force_N':external_z,'peak_external_torque_Nm':external_torque,
          'peak_nontrunk_external_force_N':nontrunk_force,'peak_qfrc_applied':generalized_force,
          'renderer_source_sha256':sha256(__file__),'contract':env.contract,'trace':trace}
(output/'video.json').write_text(json.dumps(metadata,indent=2)+'\n')
(output/'renderer.executed.py').write_text(Path(__file__).read_text())
print(json.dumps({k:v for k,v in metadata.items() if k not in ('trace','contract','initial_qpos','initial_qvel','pushes')}))
