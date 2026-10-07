import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"rosbag과 RViz로 데이터 다시 보기"};
export default function Page() {return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/bag-rviz" title="rosbag과 RViz로 데이터 다시 보기" intro="Topic 데이터를 기록하고 다시 발행하는 rosbag2, 데이터를 공간에 표시하는 RViz를 구분합니다. 작은 pose 예제로 frame과 시각까지 확인합니다." repo="meroedu-ros">
<Chapter id="roles" title="1. rosbag은 기록하고 RViz는 표시한다">
<p><strong>rosbag2</strong>는 topic message를 type·시각과 함께 저장하고 나중에 같은 topic으로 다시 발행하는 도구입니다. CLI 명령은 <code>ros2 bag</code>입니다. <strong>RViz</strong>는 message를 공간에 표시하는 GUI입니다. 위치를 계산하거나 로봇 물리를 simulation하는 도구가 아닙니다.</p>
<FlowDiagram title="같은 데이터를 기록하고 공간에서 보기" steps={[{title:"Pose publisher",lines:["/meroedu/pose", "위치 · 방향 · frame · 시각"]},{title:"rosbag2",lines:["Record → 파일", "Play → 원래 topic"]},{title:"RViz",lines:["Live 또는 replay 수신", "Arrow로 위치·방향 표시"]}]} caption="RViz는 live publisher에서도 직접 받을 수 있습니다. Bag은 같은 입력을 다시 확인할 때 사용합니다."/>
<p><a href="https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Recording-And-Playing-Back-Data/Recording-And-Playing-Back-Data.html">공식 rosbag tutorial</a>과 <a href="https://docs.ros.org/en/humble/Tutorials/Intermediate/RViz/RViz-User-Guide/RViz-User-Guide.html">공식 RViz user guide</a>도 함께 참고할 수 있습니다.</p><p>Bag은 GUI 없이 Jetson에서도 쓸 수 있습니다. RViz는 desktop/display와 그래픽 환경이 필요합니다. 첫 실습은 모든 node를 같은 Ubuntu에서 실행하세요. Jetson 화면을 원격으로 볼 때는 <a href="/education/development-setup/remote-work#gui">RustDesk</a>를 쓸 수 있습니다. SSH나 Tailscale 연결만으로 GUI나 다른 컴퓨터의 ROS discovery가 자동으로 준비되지는 않습니다.</p>
<CodeExample label="Humble · 추가 도구" code={`sudo apt update
sudo apt install ros-humble-rosbag2 ros-humble-rviz2 ros-humble-geometry-msgs
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42`}/>
</Chapter>
<Chapter id="pose" title="2. 화면에서 볼 작은 pose message를 준비한다">
<CodeExample label="교육용 pose publisher" code={`git clone https://github.com/merosnurobotics/meroedu-ros.git
cd meroedu-ros/lessons/03-bag-rviz
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
/usr/bin/python3 pose_publisher.py`}/>
<p>코드는 map 기준 x=1.0m, y=0.5m, yaw=45°인 pose를 10Hz로 발행합니다. 매번 새 timestamp를 넣습니다. <strong>형식과 화면을 배우기 위한 예시</strong>이며 실제 센서로 측정한 localization 결과가 아닙니다. Orientation은 quaternion으로 표현합니다.</p>
<CodeExample label="새 터미널 · 같은 setup/domain에서 확인" code="ros2 topic echo /meroedu/pose geometry_msgs/msg/PoseStamped --once"/>
<p><code>header.frame_id: map</code>, position (1, 0.5, 0), orientation z≈0.38268·w≈0.92388이 보입니다. 메시지의 위치만 보고 frame과 timestamp를 생략하면 실제 센서와 맞춰 볼 수 없습니다.</p>
</Chapter>
<Chapter id="rviz" title="3. RViz의 Fixed Frame과 display를 맞춘다">
<CodeExample label="강의 폴더의 새 GUI 터미널" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
rviz2 -d pose.rviz`}/>
<p>직접 설정하면 <strong>Fixed Frame = map</strong>, Add → Pose, Topic = <code>/meroedu/pose</code>입니다. Grid는 길이 눈금이고 arrow는 위치와 방향입니다. Fixed Frame은 화면의 좌표 기준입니다. 이번 pose는 이미 map 좌표라 별도 TF가 필요하지 않습니다.</p>
<figure className="education-native-figure"><div className="education-native-heading">Frame이 map인 pose를 map 화면에 표시</div><svg viewBox="0 0 600 280" role="img" aria-label="map 기준 x 1m y 0.5m 위치에서 45도 방향을 가리키는 pose arrow"><defs><marker id="ros-pose-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="var(--accent)"/></marker></defs>{[0,1,2,3,4].map(i=><g key={i}><line x1={70+i*100} y1="25" x2={70+i*100} y2="235" stroke="var(--border)"/><line x1="70" y1={35+i*50} x2="470" y2={35+i*50} stroke="var(--border)"/></g>)}<line x1="70" y1="235" x2="520" y2="235" stroke="var(--text)"/><line x1="70" y1="235" x2="70" y2="15" stroke="var(--text)"/><circle cx="170" cy="185" r="5" fill="var(--accent)"/><line x1="170" y1="185" x2="220" y2="135" stroke="var(--accent)" strokeWidth="4" markerEnd="url(#ros-pose-arrow)"/><text x="235" y="130" fill="var(--text)" fontSize="17">yaw 45°</text><text x="190" y="212" fill="var(--text)" fontSize="17">(1.0m, 0.5m)</text><text x="515" y="260" fill="var(--text)" fontSize="17">x</text><text x="43" y="23" fill="var(--text)" fontSize="17">y</text><text x="35" y="260" fill="var(--text)" fontSize="17">map</text></svg><figcaption>설명용 HTML/SVG 도식입니다. 실제 RViz screenshot이나 추정 정확도 결과가 아닙니다.</figcaption></figure>
<table><thead><tr><th>Message</th><th>Display</th><th>보이는 것</th></tr></thead><tbody><tr><td>PoseStamped</td><td>Pose</td><td>위치·방향 arrow</td></tr><tr><td>LaserScan</td><td>LaserScan</td><td>LiDAR 거리 점</td></tr><tr><td>PointCloud2</td><td>PointCloud2</td><td>3D points</td></tr><tr><td>OccupancyGrid</td><td>Map</td><td>지도 cell</td></tr><tr><td>Image</td><td>Image</td><td>Camera image</td></tr><tr><td>TF</td><td>TF</td><td>Frame 간 관계</td></tr></tbody></table>
<p>RViz가 그린 arrow는 수신한 message입니다. 독립적인 ground truth가 아닙니다. 다른 frame의 센서를 map에서 보려면 측정 시각에 맞는 transform도 필요합니다.</p>
</Chapter>
<Chapter id="record" title="4. 몇 초 기록하고 bag 내용을 확인한다">
<p>Publisher를 켜둔 상태에서 같은 강의 폴더의 새 터미널에서 기록합니다. 모든 ROS 터미널의 setup과 domain을 맞추세요.</p>
<CodeExample label="Record → Ctrl+C → info" code={`mkdir -p bags
ros2 bag record -o bags/pose-demo /meroedu/pose
# 약 5초 뒤 Ctrl+C
ros2 bag info bags/pose-demo`}/>
<p>결과는 metadata와 storage file이 들어 있는 폴더입니다. Humble 기본 storage는 SQLite3 .db3입니다. Topic 이름·type·message count·duration을 확인하세요. 같은 출력 이름을 재사용할 때는 새 이름을 정합니다. 녹화 데이터는 Git에 올리지 않습니다.</p>
</Chapter>
<Chapter id="replay" title="5. Live publisher를 끄고 같은 topic으로 재생한다">
<p>Pose publisher를 Ctrl+C로 종료하고 RViz는 켜둡니다. 녹화된 message가 원래 topic으로 다시 발행되면 같은 arrow를 볼 수 있습니다. Live publisher와 replay를 같이 실행하면 두 입력이 섞입니다.</p>
<CodeExample label="Bag 재생" code={`ros2 bag play bags/pose-demo
# 필요할 때 --loop 또는 --rate 0.5 추가`}/>
<p>여러 sensor의 timestamp와 TF를 함께 다룰 때는 ROS time을 맞춥니다. <code>--clock</code>은 /clock을 발행하고 <code>use_sim_time=true</code>인 node는 그 시간을 사용합니다. /clock이 없는데 true이면 시간이 멈춘 것처럼 보일 수 있습니다.</p>
<CodeExample label="재생 시각으로 RViz를 맞추는 경우 · 별도 터미널" code={`ros2 bag play bags/pose-demo --clock

# 별도 GUI 터미널에서
rviz2 -d pose.rviz --ros-args -p use_sim_time:=true`}/>
<p>실제 motor command를 기록한 bag을 재생하면 hardware subscriber가 받아 로봇을 움직일 수 있습니다. 이번 편은 표시용 pose만 사용합니다.</p>
</Chapter>
<Chapter id="checks" title="6. 안 보이면 message · frame · TF · QoS를 나눠 본다">
<p>먼저 topic echo로 실제 입력이 있는지 확인합니다. 다음으로 Fixed Frame 이름, message의 frame, TF 경로와 timestamp를 봅니다. TF를 쓰는 데이터는 <code>/tf</code>와 <code>/tf_static</code> 등 관련 transform도 함께 기록해야 합니다. 마지막으로 topic info의 QoS와 display 설정을 비교하세요. Sensor의 best-effort와 display의 reliable 요구가 안 맞으면 수신하지 못할 수 있습니다.</p>
<p>ROS 명령은 되는데 RViz가 안 뜨면 desktop session·DISPLAY·graphics 환경을 확인합니다. SSH shell만으로 화면이 생기지는 않습니다. 배포된 <code>pose.rviz</code>는 화면 구성을 준비한 파일이며 각 desktop 환경에서 실제 표시를 확인해야 합니다.</p>
<Check><p>RViz에 보이는 pose가 바뀌었다면 센서 측정이 바뀐 걸까요? Live인지 replay인지, 누가 topic을 publish하는지부터 확인해야 합니다.</p></Check>
</Chapter>
<footer className="education-sources"><h2>참고 자료와 실습 코드</h2><p>제공된 「기계시스템설계 · 로봇프로그래밍 기초 ROS」 강의 PDF의 개념과 교육 흐름을 참고해 Humble 환경과 독립 실행 예제로 재구성했습니다. 슬라이드 이미지를 붙이는 대신 사이트 테마에 맞는 HTML 도식으로 정리했습니다.</p><p><a href="https://github.com/merosnurobotics/meroedu-ros">실습 저장소</a> · <a href="https://github.com/merosnurobotics/meroedu-ros/blob/main/NOTICE.md">참고한 페이지·재구성·라이선스</a> · <a href="https://docs.ros.org/en/humble/Tutorials.html">ROS 2 Humble 공식 tutorial</a></p></footer></Lesson>; }
