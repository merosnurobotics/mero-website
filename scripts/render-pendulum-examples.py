"""Render actual MuJoCo free/control runs, not keyframed pendulum animation.
MUJOCO_GL=egl /home/user/microbanRL/.venv/bin/python scripts/render-pendulum-examples.py
"""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
import mujoco
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'private/education-assets/simulation'
FONT = ROOT / 'private/education-assets/deepml/fonts/Lato-Regular.ttf'
ASSETS.mkdir(parents=True, exist_ok=True)


def model_xml(inverted):
    tip = '0.7' if inverted else '-0.7'
    return f'''<mujoco model="{'inverted' if inverted else 'regular'}_pendulum">
  <option timestep="0.002" gravity="0 0 -9.81"/>
  <visual><global offwidth="480" offheight="480"/><rgba haze="0.96 0.97 0.98 1"/></visual>
  <worldbody>
    <light pos="0 -2 3" ambient="0.45 0.45 0.45" diffuse="0.6 0.6 0.6"/>
    <geom type="plane" size="3 3 0.1" rgba="0.9 0.92 0.94 1"/>
    <geom type="capsule" fromto="0 0.12 0 0 0.12 1.1" size="0.02" rgba="0.4 0.45 0.5 1"/>
    <geom type="sphere" pos="0 0 1.1" size="0.055" rgba="0.35 0.4 0.45 1"/>
    <body name="pendulum" pos="0 0 1.1">
      <joint name="hinge" type="hinge" axis="0 1 0" damping="0.1"/>
      <geom type="capsule" fromto="0 0 0 0 0 {tip}" size="0.035" mass="0.5" rgba="0.12 0.4 0.68 1" contype="0" conaffinity="0"/>
      <geom type="sphere" pos="0 0 {tip}" size="0.09" mass="0.3" rgba="0.95 0.55 0.19 1" contype="0" conaffinity="0"/>
    </body>
  </worldbody>
  <actuator><motor joint="hinge" gear="1" ctrllimited="true" ctrlrange="-2 2"/></actuator>
</mujoco>'''


def control_step(model, data, *, controlled, inverted):
    kp, kd = (12.0, 2.0) if inverted else (3.0, 1.0)
    data.ctrl[0] = np.clip(-kp * data.qpos[0] - kd * data.qvel[0], -2.0, 2.0) if controlled else 0.0
    # A finite external torque pulse, independent of the actuator command.
    data.qfrc_applied[0] = 0.9 if inverted and 2.0 <= data.time < 2.15 else 0.0
    mujoco.mj_step(model, data)


def run_example(inverted):
    name = 'inverted-pendulum' if inverted else 'pendulum'
    xml = model_xml(inverted)
    (ASSETS / f'{name}-demo.xml').write_text(xml)
    model = mujoco.MjModel.from_xml_string(xml)
    states = [mujoco.MjData(model), mujoco.MjData(model)]
    initial = 0.16 if inverted else 0.65
    seconds = 6 if inverted else 3
    for data in states:
        data.qpos[0] = initial
        mujoco.mj_forward(model, data)
    camera = mujoco.MjvCamera()
    camera.lookat[:] = [0, 0, 0.95]
    camera.distance, camera.azimuth, camera.elevation = 3.1, 90, -8
    renderer = mujoco.Renderer(model, height=480, width=480)
    title_font, label_font = ImageFont.truetype(str(FONT), 25), ImageFont.truetype(str(FONT), 22)
    trace = []
    with tempfile.TemporaryDirectory(prefix=f'{name}-', dir=ROOT / '.local') as directory:
        directory = Path(directory)
        for step in range(seconds * 500 + 1):
            if step % 25 == 0:
                canvas = Image.new('RGB', (960, 560), '#101827')
                draw = ImageDraw.Draw(canvas)
                draw.text((240, 13), 'No control', font=title_font, fill='white', anchor='mt')
                draw.text((720, 13), 'PD balance' if inverted else 'PD control', font=title_font, fill='white', anchor='mt')
                for index, data in enumerate(states):
                    renderer.update_scene(data, camera=camera)
                    canvas.paste(Image.fromarray(renderer.render()), (index * 480, 48))
                draw.line((480, 48, 480, 528), fill='#101827', width=3)
                pulse = inverted and 2.0 <= states[0].time < 2.15
                draw.text((18, 534), f't = {states[0].time:.2f} s', font=label_font, fill='#d4e1ec')
                draw.text((942, 534), 'External torque: 0.9 N m' if pulse else 'Torque limit: +/- 2 N m', font=label_font, fill='#f2ac64' if pulse else '#d4e1ec', anchor='rt')
                canvas.save(directory / f'frame-{step // 25:04d}.png')
                if step == 0:
                    canvas.save(ASSETS / f'{name}-demo.png')
                trace.append({'time_s':float(states[0].time), 'free_angle_rad':float(states[0].qpos[0]), 'controlled_angle_rad':float(states[1].qpos[0]), 'controlled_torque_nm':float(states[1].ctrl[0])})
            if step < seconds * 500:
                for index, data in enumerate(states):
                    control_step(model, data, controlled=index == 1, inverted=inverted)
        renderer.close()
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','20','-i',str(directory/'frame-%04d.png'),'-filter_complex','[0:v]split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',str(ASSETS/f'{name}.gif')],check=True)
        # Export representative real frames for reviewing the disturbance and recovery.
        for sample in ([1.0,2.1,2.6,5.0] if inverted else [0.5,1.0,2.5]):
            Image.open(directory / f'frame-{round(sample * 20):04d}.png').save(ASSETS/f'{name}-at-{sample:.1f}s.png')
    controlled_angle = np.array([row['controlled_angle_rad'] for row in trace])
    if inverted:
        assert np.max(np.abs(controlled_angle)) < 0.2, 'Upright control left the local balancing region'
        assert abs(controlled_angle[-1]) < .001, 'Upright control did not recover'
        assert max(abs(row['free_angle_rad']) for row in trace) > 1.0, 'Uncontrolled upright did not fall'
    result = {'mujoco':mujoco.__version__,'duration_s':seconds,'physics_timestep_s':.002,'steps':seconds*500,'gif_fps':20,'gif_frame_count':len(trace),'initial_angle_rad':initial,'target_angle_rad':0,'upright':inverted,'kp':12 if inverted else 3,'kd':2 if inverted else 1,'torque_limit_nm':2,'external_torque':{'start_s':2,'end_s':2.15,'torque_nm':.9} if inverted else None,'final_controlled_angle_rad':float(states[1].qpos[0]),'trace':trace,'scope':'Original fixed-pivot torque-actuated pendulum, local PD balance only; no cart, swing-up, learned policy or real hardware.'}
    (ASSETS/f'{name}-demo-results.json').write_text(json.dumps(result,indent=2))
    print(json.dumps({key:value for key,value in result.items() if key != 'trace'},indent=2))
    return result


if __name__ == '__main__':
    regular, inverted = run_example(False), run_example(True)
    plt.rcParams.update({'font.family':'DejaVu Sans','axes.spines.top':False,'axes.spines.right':False})
    fig, ax = plt.subplots(figsize=(10,4.5),dpi=150)
    for key,label,color in [('free_angle_rad','No control','#d77c26'),('controlled_angle_rad','PD balance','#2366a0')]:
        ax.plot([row['time_s'] for row in inverted['trace']], [row[key] for row in inverted['trace']], label=label, color=color)
    ax.axhline(0,color='#999',linestyle='--',label='Upright target')
    ax.axvspan(2,2.15,color='#f2ac64',alpha=.25,label='External torque pulse')
    ax.set(xlabel='Simulation time (s)',ylabel='Angle from upright (rad)',title='Inverted pendulum: actual MuJoCo state')
    ax.grid(alpha=.15);ax.legend();fig.tight_layout();fig.savefig(ASSETS/'inverted-pendulum-control.png');plt.close(fig)
    files = [path for path in ASSETS.glob('*pendulum*') if path.is_file() and path.name != 'pendulum-demo-manifest.json']
    manifest = {'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'files':{path.name:{'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()} for path in files}}
    (ASSETS/'pendulum-demo-manifest.json').write_text(json.dumps(manifest,indent=2))
