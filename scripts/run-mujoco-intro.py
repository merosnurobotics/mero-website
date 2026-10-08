"""Original MERO pendulum example. MUJOCO_GL=egl python scripts/run-mujoco-intro.py."""
from pathlib import Path
import json
import mujoco
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager

root = Path(__file__).resolve().parents[1] / 'private/education-assets/simulation'
root.mkdir(parents=True, exist_ok=True)
xml = '''<mujoco model="one_joint_pendulum">
  <option timestep="0.002" gravity="0 0 -9.81"/>
  <visual><global offwidth="1200" offheight="720"/></visual>
  <worldbody>
    <light pos="0 -2 3"/>
    <geom type="plane" size="2 2 0.1" rgba="0.93 0.94 0.96 1"/>
    <body name="pendulum" pos="0 0 1.1">
      <joint name="hinge" type="hinge" axis="0 1 0" damping="0.1"/>
      <geom type="capsule" fromto="0 0 0 0 0 -0.7" size="0.035" mass="0.5" rgba="0.12 0.40 0.68 1"/>
      <geom type="sphere" pos="0 0 -0.7" size="0.09" mass="0.3" rgba="0.95 0.55 0.19 1"/>
    </body>
  </worldbody>
  <actuator><motor joint="hinge" gear="1" ctrllimited="true" ctrlrange="-2 2"/></actuator>
</mujoco>'''
(root / 'pendulum.xml').write_text(xml)
model = mujoco.MjModel.from_xml_string(xml)
data = mujoco.MjData(model)
data.qpos[0] = 0.65
mujoco.mj_forward(model, data)
renderer = mujoco.Renderer(model, height=720, width=1200)
camera = mujoco.MjvCamera()
camera.lookat[:] = [0, 0, 0.65]
camera.distance, camera.azimuth, camera.elevation = 2.5, 90, -12
renderer.update_scene(data, camera=camera)
plt.imsave(root / 'pendulum.png', renderer.render())
renderer.close()
trace = []
for step in range(1500):
    data.ctrl[0] = np.clip(-3.0 * data.qpos[0] - 1.0 * data.qvel[0], -2.0, 2.0)
    mujoco.mj_step(model, data)
    if step % 10 == 0:
        trace.append([float(data.time), float(data.qpos[0]), float(data.qvel[0]), float(data.ctrl[0])])
font_path = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
font_manager.fontManager.addfont(font_path)
plt.rcParams.update({'font.family':font_manager.FontProperties(fname=font_path).get_name(), 'axes.unicode_minus':False})
values = np.array(trace)
fig, ax = plt.subplots(figsize=(10, 4.5), dpi=150)
ax.plot(values[:, 0], values[:, 1], color='#1e659c', label='관절 각도')
ax.axhline(0, color='#999', linestyle='--', label='목표 0 rad')
ax.set(xlabel='시뮬레이션 시간 (s)', ylabel='각도 (rad)', title='한 관절 진자 · PD 제어의 실제 실행 결과')
ax.grid(alpha=.2); ax.legend(); fig.tight_layout(); fig.savefig(root / 'control.png'); plt.close(fig)
results = {'mujoco':mujoco.__version__, 'nq':model.nq, 'nv':model.nv, 'nu':model.nu, 'timestep':model.opt.timestep, 'steps':1500, 'time':float(data.time), 'final_angle_rad':float(data.qpos[0]), 'trace':trace, 'scope':'Original synthetic pendulum, PD control, no learned policy or real hardware.'}
(root / 'results.json').write_text(json.dumps(results, indent=2))
print(json.dumps({key:value for key,value in results.items() if key != 'trace'}, indent=2))
