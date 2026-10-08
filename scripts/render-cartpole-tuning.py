"""Precompute actual MuJoCo cart-pole PID trials and compressed GIFs."""
from pathlib import Path
import hashlib, json, subprocess, tempfile
import mujoco
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'private/education-assets/simulation/cartpole'
ASSETS.mkdir(parents=True, exist_ok=True)
VALUES = {'kp': [12, 24, 48], 'ki': [0, 2, 6], 'kd': [1, 4, 8]}
XML = '''<mujoco model="cartpole_pid"><option timestep="0.002" gravity="0 0 -9.81"/>
<visual><global offwidth="640" offheight="360"/></visual>
<worldbody><light pos="0 -2 4" ambient="0.5 0.5 0.5"/>
<geom type="plane" size="4 4 0.1" rgba="0.8 0.83 0.87 1"/>
<geom type="box" pos="0 0 0.12" size="2.5 0.06 0.025" rgba="0.4 0.45 0.5 1"/>
<body name="cart" pos="0 0 0.3"><joint name="slide" type="slide" axis="1 0 0" damping="0.1"/>
<geom type="box" size="0.15 0.1 0.07" mass="1" rgba="0.2 0.5 0.8 1" contype="0" conaffinity="0"/>
<body name="pole"><joint name="hinge" type="hinge" axis="0 1 0" damping="0.01"/>
<geom type="capsule" fromto="0 0 0 0 0 0.7" size="0.025" mass="0.15" rgba="0.3 0.65 0.8 1" contype="0" conaffinity="0"/>
<geom type="sphere" pos="0 0 0.7" size="0.055" mass="0.05" rgba="0.95 0.55 0.2 1" contype="0" conaffinity="0"/>
</body></body></worldbody><actuator><motor joint="slide" gear="1" ctrllimited="true" ctrlrange="-8 8"/></actuator></mujoco>'''


def trial(model, kp, ki, kd):
    data = mujoco.MjData(model)
    data.qpos[1] = 0.12
    mujoco.mj_forward(model, data)
    integral = 0.0
    trace, failed, saturated = [], None, 0
    for step in range(4001):
        if step % 25 == 0:
            trace.append({'time_s': round(step * .002, 3), 'physics_time_s': float(data.time), 'x_m': float(data.qpos[0]), 'angle_rad': float(data.qpos[1]), 'force_n': float(data.ctrl[0]), 'stopped': failed is not None, 'qpos': data.qpos.tolist()})
        if step == 4000 or failed is not None:
            continue
        x, theta = data.qpos
        vx, omega = data.qvel
        integral = float(np.clip(integral + theta * .002, -.3, .3))
        force = kp * theta + ki * integral + kd * omega + .8 * x + 1.5 * vx
        saturated += int(abs(force) > 8)
        data.ctrl[0] = np.clip(force, -8, 8)
        # Same perturbation and persistent torque bias in every trial.
        data.qfrc_applied[:] = [0.8 if 3 <= data.time < 3.2 else 0, 0.025]
        mujoco.mj_step(model, data)
        if abs(data.qpos[1]) > .7 or abs(data.qpos[0]) > 2.2:
            failed = float(data.time)
    tail = [r for r in trace if r['time_s'] >= 6]
    metrics = {'completed': failed is None, 'stop_s': failed, 'stop_reason': ('angle' if abs(data.qpos[1]) > .7 else 'cart') if failed is not None else None, 'max_angle_deg': float(np.degrees(max(abs(r['angle_rad']) for r in trace))), 'max_cart_m': max(abs(r['x_m']) for r in trace), 'tail_angle_rms_deg': float(np.degrees(np.sqrt(np.mean([r['angle_rad']**2 for r in tail])))) if failed is None else None, 'saturation_pct': 100 * saturated / max(1, round(data.time / .002))}
    return trace, metrics


def render(model, renderer, camera, trace, kp, ki, kd, name):
    data = mujoco.MjData(model)
    font = ImageFont.truetype(str(ROOT / 'private/education-assets/deepml/fonts/Lato-Regular.ttf'), 22)
    with tempfile.TemporaryDirectory(prefix='cartpole-', dir=ROOT / '.local') as tmp:
        tmp = Path(tmp)
        for index, row in enumerate(trace):
            data.qpos[:] = row['qpos']
            mujoco.mj_forward(model, data)
            renderer.update_scene(data, camera=camera)
            frame = Image.new('RGB', (640, 424), '#101827')
            frame.paste(Image.fromarray(renderer.render()), (0, 34))
            draw = ImageDraw.Draw(frame)
            draw.text((16, 5), f'Cart-pole   P {kp}   I {ki}   D {kd}', font=font, fill='white')
            label = f'Stopped at {row["physics_time_s"]:.2f} s' if row['stopped'] else f't = {row["physics_time_s"]:.2f} s'
            draw.text((16, 396), label, font=font, fill='#f2ac64' if row['stopped'] else '#d4e1ec')
            draw.text((624, 396), f'x {row["x_m"]:+.2f} m    angle {np.degrees(row["angle_rad"]):+.1f} deg', anchor='rt', font=font, fill='#d4e1ec')
            frame.save(tmp / f'{index:04d}.png')
            if index == 100:
                frame.save(ASSETS / f'{name}.png')
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','20','-i',str(tmp/'%04d.png'),'-filter_complex','[0:v]split[a][b];[a]palettegen=max_colors=80:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',str(ASSETS/f'{name}.gif')],check=True)


if __name__ == '__main__':
    model = mujoco.MjModel.from_xml_string(XML)
    (ASSETS / 'model.xml').write_text(XML)
    render_enabled = '--probe' not in __import__('sys').argv
    renderer = mujoco.Renderer(model, height=360, width=640) if render_enabled else None
    camera = mujoco.MjvCamera(); camera.lookat[:] = [0,0,.65]
    camera.distance, camera.azimuth, camera.elevation = 5.0, 90, -10
    runs=[]
    for kp in VALUES['kp']:
        for ki in VALUES['ki']:
            for kd in VALUES['kd']:
                name=f'p{kp}-i{ki}-d{kd}'
                trace, metrics=trial(model,kp,ki,kd)
                if render_enabled: render(model,renderer,camera,trace,kp,ki,kd,name)
                runs.append({'id':name,'kp':kp,'ki':ki,'kd':kd,'gif':f'/education-assets/simulation/cartpole/{name}.gif','still':f'/education-assets/simulation/cartpole/{name}.png','metrics':metrics})
                if render_enabled: (ASSETS/f'{name}.json').write_text(json.dumps(trace,indent=2)+'\n')
                print(name,json.dumps(metrics),flush=True)
    if renderer: renderer.close()
    if render_enabled:
        manifest={'engine':f'MuJoCo {mujoco.__version__}','values':VALUES,'initial_angle_rad':.12,'physics_timestep_s':.002,'duration_s':8,'fps':20,'force_limit_n':8,'cart_feedback':{'position':.8,'velocity':1.5},'integral_limit':.3,'pole_bias_torque_nm':.025,'disturbance':{'force_n':.8,'start_s':3,'end_s':3.2},'stop_limits':{'angle_rad':.7,'cart_m':2.2},'runs':runs,'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
        target=ROOT/'src/lib/education/generated/cartpole.json'
        target.write_text(json.dumps(manifest,indent=2)+'\n')
        manifest['files']={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in ASSETS.iterdir() if p.is_file() and p.name!='manifest.json'}
        (ASSETS/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
