"""Run existing lessons, capture real X11 application windows, and export provenance.

Run after sourcing /opt/ros/humble/setup.bash. Requires local Xvfb/xterm tools,
the MERO-education repositories, and the already installed project Python environments.
Uses an isolated local ROS domain. Does not connect to robot hardware.
"""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import signal
import subprocess
import time

from PIL import Image, ImageChops, ImageGrab
import yaml

ROOT=Path(__file__).resolve().parents[1]
LESSONS=Path('/home/user/MERO-education')
WORK=ROOT/'.local/education-captures'
TOOLS=ROOT/'.local/capture-tools/root/usr'
OUT=ROOT/'private/education-assets/execution'
HELPER=ROOT/'scripts/capture-education-data.py'
for path in [WORK,OUT,WORK/'runtime']:
    path.mkdir(parents=True,exist_ok=True)
(WORK/'runtime').chmod(0o700)
ENV=os.environ.copy()
ENV.update({'ROS_DOMAIN_ID':'183','ROS_LOCALHOST_ONLY':'1','RCUTILS_CONSOLE_OUTPUT_FORMAT':'[{severity}] [{name}]: {message}',
    'RCUTILS_COLORIZED_OUTPUT':'0','PYTHONUNBUFFERED':'1','CAPTURE_OUT':str(OUT),'CAPTURE_HELPER':str(HELPER),
    'XDG_RUNTIME_DIR':str(WORK/'runtime'),'SHELL':'/bin/bash',
    'LD_LIBRARY_PATH':str(TOOLS/'lib/x86_64-linux-gnu')+':'+os.environ.get('LD_LIBRARY_PATH','')})
PROCESSES=[]
RECORDS={}


def spawn(args,name,cwd=ROOT,extra=None):
    env=ENV.copy();env.update(extra or {})
    log=(WORK/(name+'.log')).open('w')
    p=subprocess.Popen(args,cwd=cwd,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
    PROCESSES.append((p,log));return p


def stop(p):
    if p.poll() is None:
        os.killpg(p.pid,signal.SIGINT)
        try:p.wait(timeout=4)
        except subprocess.TimeoutExpired:
            os.killpg(p.pid,signal.SIGTERM)
            try:p.wait(timeout=3)
            except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()


def run(args,cwd=ROOT,timeout=25):
    r=subprocess.run(args,cwd=cwd,env=ENV,capture_output=True,text=True,timeout=timeout)
    if r.returncode:raise RuntimeError(f'{shlex.join(args)}\n{r.stderr}\n{r.stdout}')
    return r.stdout


def geometry(title):
    text=run(['xwininfo','-name',title])
    values=[int(re.search(label+r':\s+(-?\d+)',text).group(1)) for label in ['Absolute upper-left X','Absolute upper-left Y','Width','Height']]
    return values


def capture_window(title,name,trim_terminal=False):
    x,y,w,h=geometry(title)
    image=ImageGrab.grab(bbox=(x,y,x+w,y+h),xdisplay=ENV['DISPLAY'])
    if trim_terminal:
        # Keep the unmodified window as evidence; remove only empty bottom space.
        image.save(WORK/(name+'-full-window.png'))
        inside=image.convert('RGB').crop((2,2,w-2,h-2))
        bounds=ImageChops.difference(inside,Image.new('RGB',inside.size,'#101827')).getbbox()
        if bounds:
            h=min(h,bounds[3]+24)
            image=image.crop((0,0,w,h))
    image.save(OUT/(name+'.png'))
    return {'image':name+'.png','width':w,'height':h,'sha256':hashlib.sha256((OUT/(name+'.png')).read_bytes()).hexdigest()}


def terminal(name,command,cwd=ROOT,rows=23,timeout=45,extra=None):
    done=WORK/(name+'.done.json');done.unlink(missing_ok=True)
    script=WORK/(name+'.sh')
    script.write_text('#!/bin/bash\n'+command+'\n')
    # script(1) records the program actually running in this terminal, including stderr.
    wrapper=WORK/(name+'-window.py')
    wrapper.write_text('import json,os,subprocess\nfrom pathlib import Path\n'
        +'print("\\033[36m$ '+command.replace('\\','\\\\').replace('"','\\"').replace('\n','\\n$ ')+'\\033[0m",flush=True)\n'
        +'result=subprocess.run('+repr(['script','-q','-e','-c',shlex.join(['/bin/bash',str(script)]),str(OUT/(name+'.txt'))])+')\n'
        +'print("\\n[process exit: %d]" % result.returncode,flush=True)\n'
        +'Path('+repr(str(done))+').write_text(json.dumps({"exit":result.returncode}))\n')
    title='MERO-CAPTURE-'+name
    p=spawn([str(TOOLS/'bin/xterm'),'-title',title,'-geometry',f'100x{rows}+0+0','-fa','DejaVu Sans Mono','-fs','15','-bg','#101827','-fg','#e5edf8','-cr','#101827','-b','18','-hold','-e','/usr/bin/python3',str(wrapper)],name+'-window',cwd,extra)
    start=time.monotonic()
    while not done.exists():
        if p.poll() is not None:raise RuntimeError((WORK/(name+'-window.log')).read_text())
        if time.monotonic()-start>timeout:stop(p);raise TimeoutError(name)
        time.sleep(.15)
    status=json.loads(done.read_text())['exit']
    if status:stop(p);raise RuntimeError(name+' failed: '+(OUT/(name+'.txt')).read_text())
    time.sleep(.3)
    record=capture_window(title,name,trim_terminal=True)
    record.update({'kind':'terminal screenshot','command':command,'cwd':str(cwd),'log':name+'.txt','exitCode':status})
    RECORDS[name]=record;stop(p)
    print('Captured '+name,flush=True)


def start_display():
    display=next(i for i in range(91,100) if not Path(f'/tmp/.X11-unix/X{i}').exists())
    ENV['DISPLAY']=f':{display}'
    p=spawn([str(TOOLS/'bin/Xvfb'),ENV['DISPLAY'],'-screen','0','1400x1000x24','-nolisten','tcp','-ac'],'xvfb')
    for _ in range(40):
        if Path(f'/tmp/.X11-unix/X{display}').exists():return
        if p.poll() is not None:raise RuntimeError((WORK/'xvfb.log').read_text())
        time.sleep(.1)
    raise TimeoutError('Xvfb startup')


def capture_rviz(name,config):
    p=spawn(['rviz2','-d',str(config)],name,extra={'LIBGL_ALWAYS_SOFTWARE':'1'})
    title=None
    for _ in range(80):
        if p.poll() is not None:raise RuntimeError((WORK/(name+'.log')).read_text())
        tree=run(['xwininfo','-root','-tree'])
        match=re.search(r'"([^"\n]* - RViz[^"\n]*)"',tree)
        if match:title=match.group(1);break
        time.sleep(.1)
    if title is None:raise RuntimeError('RViz window not found: '+tree)
    time.sleep(3)
    record=capture_window(title,name)
    shutil.copy2(config,OUT/(name+'.rviz'))
    record.update({'kind':'RViz screenshot','command':'rviz2 -d '+config.name,'config':name+'.rviz'})
    RECORDS[name]=record;stop(p);print('Captured '+name,flush=True)


def basic_data():
    terminal('ssh-config','python3 check_config.py ssh_config.example',LESSONS/'meroedu-setup/lessons/01-remote-work',rows=13)
    terminal('pid-terminal','python3 "$CAPTURE_HELPER" pid --output "$CAPTURE_OUT"',rows=21)
    terminal('openrb-protocol','python3 "$CAPTURE_HELPER" protocol --output "$CAPTURE_OUT"',rows=16)
    terminal('lidar-terminal','python3 demo.py --output "$CAPTURE_OUT/lidar"',LESSONS/'meroedu-localization/lessons/01-lidar',rows=25)
    run(['/usr/bin/python3',str(HELPER),'lidar','--output',str(OUT)])
    terminal('object-map-terminal','python3 demo.py --output "$CAPTURE_OUT/object-map"',LESSONS/'meroedu-localization/lessons/03-object-localization',rows=34)
    run(['/usr/bin/python3',str(HELPER),'object-map','--output',str(OUT)])


def ros_data():
    pub=spawn(['ros2','topic','pub','--rate','2','/meroedu/hello','std_msgs/msg/String',"{data: 'hello MERO'}"],'hello-publisher')
    terminal('ros-topic','ros2 topic type /meroedu/hello\nros2 topic echo /meroedu/hello std_msgs/msg/String --once',rows=13)
    stop(pub)
    package=LESSONS/'meroedu-ros/lessons/02-python-pubsub/ros_ws/src/meroedu_ros_basics/meroedu_ros_basics'
    talker=spawn(['/usr/bin/python3',str(package/'talker.py')],'talker')
    # timeout sends the same SIGINT as Ctrl+C; both example nodes handle it.
    terminal('ros-pubsub','timeout --preserve-status --signal=INT 6s python3 listener.py',package,rows=17)
    stop(talker)
    pose_dir=LESSONS/'meroedu-ros/lessons/03-bag-rviz'
    pose=spawn(['/usr/bin/python3',str(pose_dir/'pose_publisher.py')],'pose-publisher')
    terminal('ros-pose','ros2 topic echo /meroedu/pose geometry_msgs/msg/PoseStamped --once',rows=25)
    map_frame=spawn(['ros2','run','tf2_ros','static_transform_publisher','--frame-id','world','--child-frame-id','map'],'map-frame')
    config=WORK/'pose.rviz';settings=yaml.safe_load((pose_dir/'pose.rviz').read_text())
    settings['Panels']=[{'Class':'rviz_common/Displays','Name':'Displays','Property Tree Widget':{'Expanded':['/Global Options1','/Status1','/Example pose1','/Example pose1/Topic1'],'Splitter Ratio':.48},'Tree Height':690}]
    settings['Window Geometry']={'Width':1240,'Height':820}
    manager=settings['Visualization Manager']
    manager['Views']['Current']={'Class':'rviz_default_plugins/TopDownOrtho','Scale':145,'Angle':0,'X':.5,'Y':.25,'Near Clip Distance':.01}
    manager['Displays'].append({'Class':'rviz_default_plugins/Axes','Name':'Map axes','Enabled':True,'Reference Frame':'map','Length':.65,'Radius':.018})
    config.write_text(yaml.safe_dump(settings,sort_keys=False))
    capture_rviz('rviz-pose',config)
    bag=WORK/('pose-bag-'+datetime.datetime.now().strftime('%H%M%S'))
    recorder=spawn(['ros2','bag','record','-o',str(bag),'/meroedu/pose'],'bag-record')
    time.sleep(4);stop(recorder);stop(pose)
    ENV['CAPTURE_BAG']=str(bag)
    terminal('rosbag-info','ros2 bag info "$CAPTURE_BAG"',rows=21)
    replay=spawn(['ros2','bag','play',str(bag),'--loop'],'bag-replay')
    terminal('rosbag-replay','ros2 topic echo /meroedu/pose geometry_msgs/msg/PoseStamped --once',rows=25)
    stop(replay)
    localize=LESSONS/'meroedu-localization/lessons/02-ros2-topics'
    scan=spawn(['/usr/bin/python3',str(localize/'demo_scan.py')],'scan-publisher')
    estimator=spawn(['/usr/bin/python3',str(localize/'localization_node.py')],'localization-node')
    terminal('ros-localization','ros2 topic echo /meroedu/pose geometry_msgs/msg/PoseStamped --once\nros2 topic echo /meroedu/match_score std_msgs/msg/Float64 --once',rows=30)
    # Rendering adapter: broadcast the computed pose, without changing localization.
    adapter=OUT/'pose-to-tf.py'
    adapter.write_text('''"""RViz adapter for the stationary synthetic scan; publishes estimated map -> laser."""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped, TransformStamped
from tf2_ros import TransformBroadcaster
rclpy.init()
node=Node('meroedu_capture_pose_tf')
broadcaster=TransformBroadcaster(node)
def receive(pose):
    transform=TransformStamped()
    transform.header=pose.header
    transform.child_frame_id='laser'
    transform.transform.translation.x=pose.pose.position.x
    transform.transform.translation.y=pose.pose.position.y
    transform.transform.rotation=pose.pose.orientation
    broadcaster.sendTransform(transform)
subscription=node.create_subscription(PoseStamped,'/meroedu/pose',receive,10)
try: rclpy.spin(node)
except KeyboardInterrupt: pass
finally:
    node.destroy_node()
    if rclpy.ok(): rclpy.shutdown()
''')
    tf=spawn(['/usr/bin/python3',str(adapter)],'pose-to-tf')
    manager['Views']['Current'].update({'Scale':130,'X':0,'Y':0})
    manager['Displays'].append({'Class':'rviz_default_plugins/LaserScan','Name':'Synthetic scan','Enabled':True,'Style':'Points','Size (Pixels)':6,'Color Transformer':'FlatColor','Color':'70; 176; 245','Topic':{'Value':'/meroedu/scan','Depth':5,'History Policy':'Keep Last','Reliability Policy':'Best Effort','Durability Policy':'Volatile'},'Decay Time':1.5})
    settings['Panels'][0]['Property Tree Widget']['Expanded']=['/Global Options1','/Status1','/Synthetic scan1','/Synthetic scan1/Topic1']
    scan_config=WORK/'localization.rviz';scan_config.write_text(yaml.safe_dump(settings,sort_keys=False))
    capture_rviz('rviz-localization',scan_config)
    stop(tf);stop(estimator);stop(scan);stop(map_frame)
    motor_dir=LESSONS/'meroedu-control/lessons/02-ros-arduino-motor'
    bridge=spawn(['/usr/bin/python3',str(motor_dir/'bridge_node.py')],'motor-bridge')
    velocity=spawn(['ros2','topic','pub','--rate','10','/cmd_vel','geometry_msgs/msg/Twist',"{linear: {x: 0.03}, angular: {z: 0.0}}"],'velocity-publisher')
    terminal('motor-command','ros2 topic echo /motor/serial_tx std_msgs/msg/String --once',rows=12)
    stop(velocity);time.sleep(.8)
    terminal('motor-timeout','ros2 topic echo /motor/serial_tx std_msgs/msg/String --once',rows=12)
    stop(bridge)
    dynamixel=LESSONS/'meroedu-control/lessons/04-ros2-dynamixel'
    bridge=spawn(['/usr/bin/python3',str(dynamixel/'bridge_node.py')],'dynamixel-bridge')
    # Echo only MOVE_DELTA to distinguish it from automatic STATUS? heartbeats.
    sender=spawn(['/bin/bash','-c',"sleep 2; ros2 topic pub --once /dynamixel/command std_msgs/msg/String '{data: MOVE_DELTA 32}'"],'dynamixel-command')
    terminal('dynamixel-command',"ros2 topic echo /dynamixel/serial_tx std_msgs/msg/String --once --filter \"m.data.startswith('MOVE_DELTA')\"",rows=13)
    sender.wait(timeout=10);stop(bridge)


def perception_data():
    source=Path('/home/user/SNU_PhysicalAI2026_Team14/logs/real_validation/face_model_compare/crops')
    env={'PYTHONPATH':str(ROOT/'.local/inference-deps'), 'CAPTURE_MODEL':'/home/user/team14-release-assets/unified_face_best.pt','CAPTURE_IMAGES':str(source)}
    command='/home/user/microbanRL/.venv/bin/python scripts/predict_examples.py --model "$CAPTURE_MODEL" --source "$CAPTURE_IMAGES/crop_0005.png" "$CAPTURE_IMAGES/crop_0007.png" "$CAPTURE_IMAGES/crop_0009.png" "$CAPTURE_IMAGES/crop_0050.png" --output "$CAPTURE_OUT/inference" --device cpu'
    terminal('perception-terminal',command,LESSONS/'meroedu-detection/lessons/01-synthetic-data',rows=18,timeout=60,extra=env)
    for name in ['crop_0005','crop_0007','crop_0009','crop_0050']:
        Image.open(OUT/f'inference/prediction-{name}.jpg').save(OUT/f'perception-{name}.png')


def microban_data():
    terminal('microban-terminal','/home/user/microbanRL/.venv/bin/python "$CAPTURE_HELPER" microban --output "$CAPTURE_OUT"',rows=19,timeout=60,extra={'MUJOCO_GL':'egl'})


def export_manifest():
    # Preserve records when rerunning one capture group.
    previous=OUT/'manifest.json'
    old=json.loads(previous.read_text()).get('results',{}) if previous.exists() else {}
    for path in OUT.glob('*.png'):
        key=path.stem
        w,h=Image.open(path).size
        RECORDS[key]={**old.get(key,{}),**RECORDS.get(key,{}),'image':path.name,'width':w,'height':h,'kind':RECORDS.get(key,old.get(key,{})).get('kind','code output PNG'),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    results={**old,**RECORDS}
    sources=[HELPER,Path(__file__),Path('/home/user/microbanRL/src/microban_rl/one_leg.py')]
    sources.extend(LESSONS.glob('*/lessons/*/*.py'))
    sources.extend((LESSONS/'meroedu-detection/lessons/01-synthetic-data/scripts').glob('predict_examples.py'))
    sources.extend((LESSONS/'meroedu-ros/lessons/02-python-pubsub/ros_ws/src/meroedu_ros_basics/meroedu_ros_basics').glob('*.py'))
    source_hashes={str(path):hashlib.sha256(path.read_bytes()).hexdigest() for path in sources}
    manifest={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rosDistro':'humble','rosDomainId':183,'display':'isolated Xvfb session','hardware':'not connected','sourceSha256':source_hashes,'results':results}
    previous.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'src/lib/education/execution-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    print(f'Exported {len(results)} execution images.',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('group',choices=['basic','ros','perception','microban','all']);a=parser.parse_args()
    try:
        start_display()
        for name,fn in [('basic',basic_data),('ros',ros_data),('perception',perception_data),('microban',microban_data)]:
            if a.group in (name,'all'):fn()
    finally:
        export_manifest()
        for p,log in reversed(PROCESSES):stop(p);log.close()
