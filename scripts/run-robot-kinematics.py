"""Original two-link example using MIT-licensed modern_robotics.FKinSpace."""
from pathlib import Path
import json
import numpy as np
import modern_robotics as mr
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager

root = Path(__file__).resolve().parents[1] / 'private/education-assets/simulation'
root.mkdir(parents=True,exist_ok=True)
lengths = [0.35,0.25]
M = np.eye(4)
M[0,3] = sum(lengths)
# Rotation about z at x=0 and x=0.35. Columns: angular velocity, linear velocity.
Slist = np.array([[0,0],[0,0],[1,1],[0,0],[0,-lengths[0]],[0,0]],dtype=float)
angles = np.deg2rad([35,-55])
pose = mr.FKinSpace(M,Slist,angles)
target = np.array([0.40,0.15])
cos_q2 = (target @ target - lengths[0]**2 - lengths[1]**2)/(2*lengths[0]*lengths[1])
solutions = []
for sign in [1,-1]:
    q2 = sign*np.arccos(cos_q2)
    q1 = np.arctan2(target[1],target[0])-np.arctan2(lengths[1]*np.sin(q2), lengths[0]+lengths[1]*np.cos(q2))
    solutions.append(np.array([q1,q2]))
def points(q):
    elbow = lengths[0]*np.array([np.cos(q[0]),np.sin(q[0])])
    end = mr.FKinSpace(M,Slist,q)[:2,3]
    return np.stack([np.zeros(2),elbow,end])
font_path='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
font_manager.fontManager.addfont(font_path)
plt.rcParams.update({'font.family':font_manager.FontProperties(fname=font_path).get_name(),'axes.unicode_minus':False})
fig,axs=plt.subplots(1,2,figsize=(11,4.8),dpi=150)
for ax in axs:
    ax.set_aspect('equal');ax.set_xlim(-.1,.7);ax.set_ylim(-.4,.45)
    ax.set(xlabel='x (m)',ylabel='y (m)');ax.grid(alpha=.2)
p=points(angles)
axs[0].plot(p[:,0],p[:,1],'-o',lw=5,color='#2366a0',markersize=9)
axs[0].set_title('순기구학 · 관절 각도 → 끝점 위치')
axs[0].annotate(f'35°, −55°\n끝점 ({pose[0,3]:.3f}, {pose[1,3]:.3f}) m',p[-1],xytext=(.05,-.25),arrowprops={'arrowstyle':'->'})
for q,color,label in zip(solutions,['#2366a0','#d77c26'],['팔꿈치 방향 A','팔꿈치 방향 B']):
    p=points(q);axs[1].plot(p[:,0],p[:,1],'-o',lw=4,color=color,label=label,alpha=.8)
axs[1].scatter(*target,marker='x',s=120,color='#111',zorder=5)
axs[1].set_title('역기구학 · 같은 끝점, 서로 다른 관절 각도')
axs[1].legend(loc='lower right');fig.tight_layout();fig.savefig(root/'kinematics.png');plt.close(fig)
errors=[float(np.linalg.norm(mr.FKinSpace(M,Slist,q)[:2,3]-target)) for q in solutions]
assert max(errors)<1e-10
result={'lengths_m':lengths,'joint_angles_deg':[35,-55],'forward_pose':pose.tolist(),'target_xy_m':target.tolist(),'inverse_angles_deg':[np.rad2deg(q).tolist() for q in solutions],'position_residual_m':errors,'scope':'Original planar 2R example, unconstrained joints, endpoint position only; not a full orientation IK problem.'}
(root/'kinematics-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
