"""Execute lesson functions and export their actual outputs for the education pages.

Synthetic inputs and simulated physics are labelled explicitly. No hardware is opened.
"""
import argparse
import csv
import importlib.util
import json
import math
from pathlib import Path
import sys
import warnings

# Only 2D plots are used. Ignore the optional system Axes3D extension warning;
# leave runtime, model and numerical warnings visible.
warnings.filterwarnings("ignore", message="Unable to import Axes3D.*", category=UserWarning)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
LESSONS = Path("/home/user/MERO-education")
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
font_manager.fontManager.addfont(FONT)
plt.rcParams.update({"font.family": font_manager.FontProperties(fname=FONT).get_name(),
    "font.size": 12, "axes.unicode_minus": False, "axes.spines.top": False,
    "axes.spines.right": False, "axes.edgecolor": "#cbd5e1", "axes.labelcolor": "#334155",
    "text.color": "#172033", "xtick.color": "#64748b", "ytick.color": "#64748b",
    "figure.facecolor": "white", "axes.facecolor": "white", "savefig.facecolor": "white"})
BLUE, TEAL, ORANGE = "#2451b8", "#078575", "#bf6430"


def save(fig, path):
    fig.savefig(path, dpi=170, bbox_inches="tight", pad_inches=.25)
    plt.close(fig)
    print(f"PNG saved: {path.name}", flush=True)


def pid(output):
    sys.path.insert(0, str(LESSONS / "meroedu-control/lessons/01-pid"))
    from pid import PID, encoder_speed
    target, dt = 5., .02
    measured = [0., 1.2, 2.8, 4., 4.8, 5.4, 5.1, 5.]
    p = PID(kp=10)
    pi = PID(kp=10, ki=2)
    rows = []
    print("pid.py | P / PI calculation with illustrative measurements")
    print("target=5 rad/s, Kp=10, Ki=2, dt=0.02 s; not a motor test\n")
    print("step  measured   error    P output   PI output")
    for i, value in enumerate(measured):
        row = [i, value, target-value, p.step(target, value, dt), pi.step(target, value, dt)]
        rows.append(row)
        print(f"{i:4d}  {value:8.2f} {row[2]:7.2f} {row[3]:11.3f} {row[4]:11.3f}")
    print(f"\nEncoder: 21 ticks / 1320 CPR / 0.02 s = {encoder_speed(21, 1320, dt):.5f} rad/s")
    with (output / "pid-calculation.csv").open("w") as f:
        writer = csv.writer(f); writer.writerow(["step", "measured_rad_s", "error_rad_s", "p_output", "pi_output"]); writer.writerows(rows)
    a = np.asarray(rows)
    fig, axes = plt.subplots(2, 1, figsize=(9, 6.8), layout="constrained", sharex=True)
    axes[0].plot(a[:, 0], a[:, 1], "o-", color=BLUE, label="예시 측정값")
    axes[0].axhline(target, color=ORANGE, linestyle="--", label="목표 5 rad/s")
    axes[0].set(ylabel="속도 [rad/s]", title="주어진 측정값으로 pid.py를 실행한 결과")
    axes[0].legend(frameon=False, ncol=2)
    axes[1].plot(a[:, 0], a[:, 3], "o-", color=BLUE, label="P 출력")
    axes[1].plot(a[:, 0], a[:, 4], "s--", color=TEAL, label="PI 출력")
    axes[1].axhline(0, color="#94a3b8", linewidth=.8)
    axes[1].set(xlabel="입력 순서", ylabel="제어 출력 [PWM 단위]")
    axes[1].legend(frameon=False, ncol=2)
    for ax in axes: ax.grid(alpha=.15)
    save(fig, output / "pid-calculation.png")


def lidar(output):
    record = json.loads((output / "lidar/result.json").read_text())
    scan = np.loadtxt(output / "lidar/scan.csv", delimiter=",", skiprows=1)
    estimate, truth = record["estimate"], record["truth"]
    theta = scan[:, 0] + estimate["yaw"]
    x = estimate["x"] + scan[:, 1]*np.cos(theta)
    y = estimate["y"] + scan[:, 1]*np.sin(theta)
    fig, axes = plt.subplots(1, 2, figsize=(11, 5), layout="constrained")
    ax = axes[0]
    # The lesson's actual wall bounds, read from the source module.
    sys.path.insert(0, str(LESSONS / "meroedu-localization/lessons/01-lidar"))
    import wall_localizer
    bounds = wall_localizer.BOUNDS
    xmin, xmax, ymin, ymax = bounds
    ax.plot([xmin,xmax,xmax,xmin,xmin], [ymin,ymin,ymax,ymax,ymin], color="#475569", label="알려진 벽")
    ax.scatter(x,y,s=22,color=BLUE,label="합성 스캔 48개")
    ax.scatter([estimate["x"]],[estimate["y"]],marker="x",s=90,color=ORANGE,label="추정 위치")
    ax.quiver(estimate["x"],estimate["y"],math.cos(estimate["yaw"])*.4,math.sin(estimate["yaw"])*.4,angles="xy",scale_units="xy",scale=1,color=ORANGE)
    ax.set(xlabel="지도 x [m]",ylabel="지도 y [m]",title="스캔을 추정 위치에 배치",aspect="equal")
    ax.legend(frameon=False,fontsize=10,loc="upper right")
    ax = axes[1]
    ax.scatter(truth["x"],truth["y"],s=110,color=TEAL,label="입력 생성에 사용한 정답")
    ax.scatter(estimate["x"],estimate["y"],s=100,marker="x",color=ORANGE,label="계산한 추정값")
    ax.set(xlabel="지도 x [m]",ylabel="지도 y [m]",title=f"위치 주변 확대 · 오차 {record['position_error_m']*1000:.2f} mm",aspect="equal")
    ax.set_xlim(truth["x"]-.012,truth["x"]+.012); ax.set_ylim(truth["y"]-.012,truth["y"]+.012)
    ax.ticklabel_format(useOffset=False);ax.legend(frameon=False,fontsize=10,loc="lower left")
    for ax in axes: ax.grid(alpha=.15)
    save(fig, output / "lidar-result.png")


def object_map(output):
    frame=json.loads((output/"object-map/input.json").read_text())
    result=json.loads((output/"object-map/result.json").read_text())
    mask=np.asarray(frame["mask"]);depth=np.asarray(frame["depth"],dtype=float)*frame["depth_scale_m"]
    depth[depth==0]=np.nan
    u,v=result["pixel_uv"]
    fig, axes=plt.subplots(1,3,figsize=(12,4.8),layout="constrained")
    axes[0].imshow(mask,cmap="Blues",vmin=0,vmax=1,interpolation="nearest")
    axes[0].scatter([u],[v],marker="x",s=90,color=ORANGE)
    axes[0].set(title=f"합성 마스크 · 선택 픽셀 ({u}, {v})",xlabel="u [pixel]",ylabel="v [pixel]")
    image=axes[1].imshow(depth,cmap="viridis",vmin=0,vmax=3.5,interpolation="nearest")
    axes[1].scatter([u],[v],marker="x",s=90,color=ORANGE)
    axes[1].set(title=f"깊이 · 주변 유효값 {result['depth_m']:.1f} m",xlabel="u [pixel]",ylabel="v [pixel]")
    fig.colorbar(image,ax=axes[1],fraction=.04,label="깊이 [m]")
    robot=frame["robot_pose"];point=result["map_xyz_m"]
    axes[2].scatter(robot["x"],robot["y"],color=BLUE,s=70,label="로봇")
    axes[2].quiver(robot["x"],robot["y"],.25*math.cos(robot["yaw"]),.25*math.sin(robot["yaw"]),angles="xy",scale_units="xy",scale=1,color=BLUE)
    axes[2].scatter(point[0],point[1],color=ORANGE,s=85,marker="x",label="물체 관측점")
    axes[2].plot([robot["x"],point[0]],[robot["y"],point[1]],"--",color="#94a3b8")
    axes[2].set(xlabel="지도 x [m]",ylabel="지도 y [m]",title="변환한 지도 좌표",aspect="equal",xlim=(-.3,1.3),ylim=(-.8,1.5))
    axes[2].legend(frameon=False,fontsize=10);axes[2].grid(alpha=.15)
    save(fig,output/"object-map-result.png")


def protocol(output):
    sys.path.insert(0,str(LESSONS/"meroedu-control/lessons/03-openrb-dynamixel"))
    from protocol import command_line
    print("OpenRB USB protocol | encoder only, no serial port opened\n")
    records=[]
    for command in ["PING","INIT","STATUS?","MOVE_DELTA 32","MOVE_DELTA 65","MOVE_DELTA 32\nSTOP","STOP"]:
        try:
            result=repr(command_line(command));state="ACCEPT"
        except ValueError as exc:result=str(exc);state="REJECT"
        print(f"{state:6s} {command!r:24s} -> {result}")
        records.append({"input":command,"state":state,"result":result})
    (output/"openrb-protocol.json").write_text(json.dumps(records,indent=2))


def microban(output):
    import mujoco
    import torch
    from PIL import Image
    source=Path("/home/user/microbanRL")
    sys.path.insert(0,str(source/"src"))
    from microban_rl.one_leg import OneLegEnv, load_policy, sha256
    checkpoint=source/"runs/one_leg_text_disturbance_pair/no_push/policy_final.pt"
    actor,reference,saved=load_policy(checkpoint)
    env=OneLegEnv(reference,n=1,workers=1,seed=75501,horizon=18.,perturb=.006,transition=True,push_magnitude=0.)
    renderer=mujoco.Renderer(env.model,width=960,height=720)
    camera=mujoco.MjvCamera();camera.lookat[:]=[0,-.01,.155]
    camera.distance=.65;camera.azimuth=135;camera.elevation=-14
    obs=env.observe();trace=[];images=[]
    print(f"Native MuJoCo {mujoco.__version__} | CPU physics | one initial state")
    print("Saved PPO policy: 400 updates; no retraining in this run")
    print("seed=75501, duration=18 s, policy=50 Hz, external force=0 N\n")
    try:
        for tick in range(900):
            with torch.no_grad(): action=actor(torch.from_numpy(np.repeat(obs,64,axis=0))).numpy()[:1]
            obs,reward,done,info=env.step(action,auto_reset=False)
            gravity,clearance,tilt,com,support,*_=env.metrics(0)
            trace.append({"time_s":float(env.data[0].time),"clearance_m":float(clearance),"tilt_deg":math.degrees(float(tilt)),"single_support":bool(support),"done":bool(done[0])})
            if tick in [0,224,674]:
                renderer.update_scene(env.data[0],camera=camera)
                name=f"microban-{tick+1:04d}.png"
                Image.fromarray(renderer.render().copy()).save(output/name);images.append(name)
                print(f"t={env.data[0].time:5.2f}s  right clearance={clearance*1000:6.2f} mm  tilt={math.degrees(tilt):5.2f} deg  support={bool(support)}")
    finally:
        renderer.close();env.close()
    (output/"microban-trace.json").write_text(json.dumps({"backend":"native MuJoCo CPU","checkpoint_sha256":sha256(checkpoint),"seed":75501,"n":1,"duration_s":18,"images":images,"trace":trace},indent=2))
    print(f"\nContinuous rollout: {len(trace)} steps; recorded in microban-trace.json")
    times=[r["time_s"] for r in trace]
    fig,axes=plt.subplots(2,1,figsize=(9,6),layout="constrained",sharex=True)
    axes[0].plot(times,[r["clearance_m"]*1000 for r in trace],color=BLUE)
    axes[0].set(ylabel="오른발 지면 간격 [mm]",title="학습된 정책을 CPU 물리 환경에서 다시 실행")
    axes[0].axhline(10,color="#94a3b8",linestyle="--",linewidth=1)
    axes[1].plot(times,[r["tilt_deg"] for r in trace],color=TEAL)
    axes[1].set(xlabel="시뮬레이션 시간 [s]",ylabel="몸통 기울기 [°]")
    for ax in axes:ax.grid(alpha=.15)
    save(fig,output/"microban-trace.png")


if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("mode",choices=["pid","lidar","object-map","protocol","microban"]);parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
    {"pid":pid,"lidar":lidar,"object-map":object_map,"protocol":protocol,"microban":microban}[args.mode](args.output)
