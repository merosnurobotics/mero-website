"""Retarget a genuine generated Kimodo G1 reference to a feasible Microban hold.

This uses the actual public-service sentence-conditioned G1 hold interval,
not the older sparse-pose checkpoint reference. It extracts a median pose then
projects the stance
leg onto level-sole/COM balance constraints. It explicitly records that this is
a static pose adaptation, rather than full temporal motion retargeting.
"""
from pathlib import Path
import sys
import argparse
import json
import hashlib
import numpy as np
import mujoco
from scipy.optimize import least_squares
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'))

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',type=Path,required=True)
    parser.add_argument('--request',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--lift-scale',type=float,default=2.4)
    parser.add_argument('--stance-knee',type=float,default=.3)
    parser.add_argument('--arm-abduction',type=float,default=.25)
    parser.add_argument('--lift-abduction',type=float,default=.18)
    args=parser.parse_args()
    if (args.output/'reference.json').exists():raise FileExistsError(args.output/'reference.json')
    modelpath=ROOT/'assets/one_leg/scene.xml'
    if not modelpath.is_file():raise FileNotFoundError(modelpath)
    source=args.source.resolve()
    request=json.loads(args.request.read_text())
    metadata=json.loads((ROOT/'data/kimodo_text_oneleg/csv_columns.json').read_text())
    cols=metadata['qpos_columns'];csv=np.loadtxt(source,delimiter=',')
    # Every frame is generated from text; there are no authored pose keyframes.
    frames=list(range(60,151))  # 2–5s generated single-support interval, no pose constraints
    median=np.median(csv[frames],axis=0)
    m=mujoco.MjModel.from_xml_path(str(modelpath));d=mujoco.MjData(m)
    d.qpos[2]=.168;d.qpos[3]=1
    names=[m.actuator(i).name for i in range(m.nu)]
    initial={}
    for name in names:
        col=f'{name}_joint'
        value=float(median[cols.index(col)]) if col in cols else 0.
        # G1 elbow bend axis is reversed relative to Microban's arm chain.
        if name.endswith('elbow'):value=-value
        d.qpos[m.joint(name).qposadr[0]]=value;initial[name]=value
    # The G1 hip yaw uses a different serial-chain axis placement, and its
    # lifted foot intersects the Microban stance shin under direct angle copy.
    # Explicit small-robot adaptation: amplify generated lifted-leg flexion,
    # reduce stance knee bend, and abduct arms to avoid the Microban trunk.
    # These are recorded retargeting operations, not Kimodo-generated angles.
    d.qpos[m.joint('left_hip_yaw').qposadr[0]]=0.
    d.qpos[m.joint('right_hip_yaw').qposadr[0]]=0.
    d.qpos[m.joint('right_hip_roll').qposadr[0]]=-max(abs(initial['right_hip_roll']),args.lift_abduction)
    d.qpos[m.joint('right_ankle_roll').qposadr[0]]=max(abs(initial['right_hip_roll']),args.lift_abduction)
    for side,sign in [('right',-1),('left',1)]:
        d.qpos[m.joint(side+'_shoulder_roll').qposadr[0]]=sign*max(abs(initial[side+'_shoulder_roll']),args.arm_abduction)
    for name in ['right_hip_pitch','right_knee']:
        d.qpos[m.joint(name).qposadr[0]]=initial[name]*args.lift_scale
    d.qpos[m.joint('right_ankle_pitch').qposadr[0]]=-args.lift_scale*(initial['right_hip_pitch']+initial['right_knee'])
    d.qpos[m.joint('left_knee').qposadr[0]]=args.stance_knee
    orig=d.qpos.copy()
    varying=['left_hip_roll','left_ankle_roll','left_hip_pitch','left_knee','left_ankle_pitch']
    idx=[m.joint(n).qposadr[0] for n in varying]
    def residual(x):
        d.qpos[:]=orig;d.qpos[idx]=x;mujoco.mj_forward(m,d)
        foot=d.site('left_foot')
        return np.r_[40*(d.subtree_com[1,:2]-foot.xpos[:2]),6*(foot.xmat.reshape(3,3)[:,2]-[0,0,1]),.12*(x-orig[idx]),1.5*(x[3]-args.stance_knee)]
    bounds=np.array([m.joint(n).range for n in varying])
    fit=least_squares(residual,orig[idx],bounds=(bounds[:,0]+.03,bounds[:,1]-.03))
    residual(fit.x);d.qpos[2]-=d.site('left_foot').xpos[2];mujoco.mj_forward(m,d)
    jacp=np.zeros((3,m.nv));jacr=np.zeros_like(jacp)
    mujoco.mj_jac(m,d,jacp,jacr,np.r_[d.subtree_com[1,:2],0],m.site('left_foot').bodyid[0])
    tau=(d.qfrc_bias-jacp.T@np.array([0,0,m.body_mass.sum()*9.81]))[6:]
    target=d.qpos[7:]+tau/m.actuator_gainprm[:,0]
    out=args.output;out.mkdir(parents=True,exist_ok=True)
    selfcontacts=[{'geom1':m.geom(c.geom[0]).name,'geom2':m.geom(c.geom[1]).name,'distance_m':float(c.dist)} for c in d.contact if m.geom('floor').id not in c.geom]
    limits=np.array([m.joint(name).range for name in names])
    joint_violation=float(np.maximum(np.maximum(limits[:,0]-d.qpos[7:],d.qpos[7:]-limits[:,1]),0).max())
    foot_ids=[m.geom('right_foot_collision_'+str(i)).id for i in range(1,7)]
    clearance=min(float(d.geom_xpos[g,2]-np.abs(d.geom_xmat[g].reshape(3,3)[2])@m.geom_size[g]) for g in foot_ids)
    if joint_violation>1e-8 or clearance<.02 or any(c['distance_m']<-.0001 for c in selfcontacts):
        raise RuntimeError(f'Infeasible adapted text reference: limits={joint_violation}, right clearance={clearance}, self={selfcontacts}')
    report={'task':'one_leg_stand','kind':'Kimodo-generated median hold pose, adapted by named-angle mapping and stance IK','model_path':str(modelpath),'model_sha256':sha(modelpath),'kimodo_source':str(source),'kimodo_source_sha256':sha(source),'kimodo_npz_sha256':sha(source.with_name('oneleg_text_00.npz')),'kimodo_model':request['model_name_requested'],'kimodo_source_commit':request['space_commit'],'conditioning':'genuine sentence-conditioned NVIDIA public Kimodo service','prompt':request['prompt'],'generation_request':str(args.request.resolve()),'generation_request_sha256':sha(args.request),'generated_frame_indices':frames,'limitation':'static pose adaptation; source temporal variation is not tracked; G1 hip yaw and limb proportions differ from Microban','source_median_pose':median.tolist(),'source_mapped_microban_angles':initial,'contact_feasibility_projection':'hip yaw zero; lifted thigh abducted by source roll magnitude; lifted sole leveled; stance leg IK centers projected COM with level sole','qpos':d.qpos.tolist(),'target':target.tolist(),'equilibrium_torque_Nm':tau.tolist(),'names':names,'support':'left','root_height_m':float(d.qpos[2]),'com':d.subtree_com[1].tolist(),'feet':{n:d.site(n).xpos.tolist() for n in ['left_foot','right_foot']},'self_contacts':selfcontacts,'stance_fit_cost':float(fit.cost),'equilibrium_feedforward_method':'gravity generalized force minus vertical support wrench through total COM, converted to upstream .277 kp target offset'}
    report.update({'retargeting_parameters':{'lift_flexion_scale':args.lift_scale,'stance_knee_target_rad':args.stance_knee,'minimum_arm_abduction_rad':args.arm_abduction,'minimum_lift_abduction_rad':args.lift_abduction},'minimum_right_box_clearance_m':clearance,'joint_limit_violation_rad':joint_violation,'physical_validation':False,'contact_feasibility_projection':'source lifted hip/knee flexion amplified by recorded factor; arm abduction sign corrected and minimum clearance set; lifted thigh abduction minimum prevents stance-shin collision; stance knee regularized; yaw zero; level soles and stance COM IK'})
    (out/'executed_retarget_source.py').write_text(Path(__file__).read_text())
    (out/'reference.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if __name__=='__main__':main()
