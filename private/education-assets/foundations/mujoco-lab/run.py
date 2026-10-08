"""Complete torque-actuated pendulum example; optional desktop viewer."""
import argparse
import contextlib
import csv
from pathlib import Path
import time
import mujoco

parser=argparse.ArgumentParser()
parser.add_argument('--model',choices=['pendulum','inverted'],default='pendulum')
parser.add_argument('--controller',choices=['none','p','pd'],default='pd')
parser.add_argument('--viewer',action='store_true')
parser.add_argument('--output',default='results')
args=parser.parse_args()
model=mujoco.MjModel.from_xml_path(str(Path(__file__).with_name(args.model+'.xml')))
data=mujoco.MjData(model)
inverted=args.model=='inverted'
data.qpos[0]=.16 if inverted else .65
mujoco.mj_forward(model,data)
kp,kd=(12.,2.) if inverted else (3.,1.)
steps=3000 if inverted else 1500
if args.viewer:
    import mujoco.viewer
    window=mujoco.viewer.launch_passive(model,data)
else:
    window=contextlib.nullcontext(None)
rows=[]
with window as viewer:
    for _ in range(steps):
        if viewer is not None and not viewer.is_running(): break
        force=-kp*data.qpos[0] if args.controller!='none' else 0.
        if args.controller=='pd': force-=kd*data.qvel[0]
        data.ctrl[0]=max(-2.,min(2.,force))
        data.qfrc_applied[0]=.9 if inverted and 2<=data.time<2.15 else 0.
        mujoco.mj_step(model,data)
        rows.append((data.time,data.qpos[0],data.qvel[0],data.ctrl[0]))
        if viewer is not None:
            viewer.sync();time.sleep(model.opt.timestep)
out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
file=out/f'{args.model}-{args.controller}.csv'
with file.open('w') as stream:
    writer=csv.writer(stream);writer.writerow(['time_s','angle_rad','angular_velocity_rad_s','torque_nm']);writer.writerows(rows)
print(f'{args.model} / {args.controller}: time={data.time:.2f}s angle={data.qpos[0]:.8f}rad; CSV={file}')
