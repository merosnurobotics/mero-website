import { ExecutionResult } from "@/components/education/execution-result";
import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"rosbag과 RViz로 데이터 다시 보기"};
export default function Page() {return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/bag-rviz" title="rosbag과 RViz로 데이터 다시 보기" intro="한 번 받은 로봇 데이터를 저장했다가 다시 살펴봅니다. rosbag으로 기록하고, RViz에서 위치와 방향을 그림으로 확인합니다." repo="meroedu-ros">
<Chapter id="roles" title="1. rosbag은 기록하고 RViz는 표시한다">
<p><strong>rosbag2</strong>는 토픽 메시지를 형식·시각과 함께 저장하고 나중에 같은 토픽으로 다시 발행하는 도구입니다. CLI 명령은 <code>ros2 bag</code>입니다. <strong>RViz</strong>는 메시지를 공간에 표시하는 GUI입니다. 위치를 계산하거나 로봇 물리를 시뮬레이션하는 도구가 아닙니다.</p>
<FlowDiagram title="같은 데이터를 기록하고 공간에서 보기" steps={[{title:"Pose publisher",lines:["/meroedu/pose", "위치 · 방향 · frame · 시각"]},{title:"rosbag2",lines:["Record → 파일", "Play → 원래 topic"]},{title:"RViz",lines:["Live 또는 replay 수신", "Arrow로 위치·방향 표시"]}]} caption="RViz는 live 발행 노드에서도 직접 받을 수 있습니다. Bag은 같은 입력을 다시 확인할 때 사용합니다."/>
<p><a href="https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Recording-And-Playing-Back-Data/Recording-And-Playing-Back-Data.html">공식 rosbag tutorial</a>과 <a href="https://docs.ros.org/en/humble/Tutorials/Intermediate/RViz/RViz-User-Guide/RViz-User-Guide.html">공식 RViz user guide</a>도 함께 참고할 수 있습니다.</p><p>Bag은 GUI 없이 Jetson에서도 쓸 수 있습니다. RViz는 화면을 표시할 데스크톱과 그래픽 환경이 필요합니다. 첫 실습은 모든 노드를 같은 Ubuntu에서 실행하세요. Jetson 화면을 원격으로 볼 때는 <a href="/education/development-setup/remote-work#gui">RustDesk</a>를 쓸 수 있습니다. SSH나 Tailscale 연결만으로 GUI나 다른 컴퓨터의 ROS 노드 검색이 자동으로 준비되지는 않습니다.</p>
<CodeExample label="Humble · 추가 도구" code={`sudo apt update
sudo apt install ros-humble-rosbag2 ros-humble-rviz2 ros-humble-geometry-msgs
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42`}/>
</Chapter>
<Chapter id="pose" title="2. 화면에서 볼 작은 위치와 방향 메시지를 준비한다">
<CodeExample label="교육용 위치와 방향 발행 노드" code={`git clone https://github.com/merosnurobotics/meroedu-ros.git
cd meroedu-ros/lessons/03-bag-rviz
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
/usr/bin/python3 pose_publisher.py`}/>
<p>코드는 map 기준 x=1.0m, y=0.5m, yaw=45°인 위치와 방향을 10Hz로 발행합니다. 매번 새 측정 시각을 넣습니다. <strong>형식과 화면을 배우기 위한 예시</strong>이며 실제 센서로 측정한 위치 추정 결과가 아닙니다. 방향은 쿼터니언이라는 네 숫자 묶음으로 표현합니다.</p>
<CodeExample label="새 터미널 · 같은 setup/통신 영역에서 확인" code="ros2 topic echo /meroedu/pose geometry_msgs/msg/PoseStamped --once"/>
<p><code>header.frame_id: map</code>, position (1, 0.5, 0), orientation z≈0.38268·w≈0.92388이 보입니다. 메시지의 위치만 보고 좌표계와 측정 시각을 생략하면 실제 센서와 맞춰 볼 수 없습니다.</p>
<ExecutionResult id="ros-pose" alt="map 좌표계의 위치와 방향을 담은 PoseStamped 메시지"/>
</Chapter>
<Chapter id="rviz" title="3. RViz의 Fixed Frame과 표시 항목을 맞춘다">
<CodeExample label="강의 폴더의 새 GUI 터미널" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
rviz2 -d pose.rviz`}/>
<p>직접 설정하면 <strong>Fixed Frame = map</strong>, Add → Pose, 토픽 = <code>/meroedu/pose</code>입니다. Grid는 길이 눈금이고 arrow는 위치와 방향입니다. Fixed Frame은 화면의 좌표 기준입니다. 이번 위치와 방향은 이미 map 좌표라 별도 TF가 필요하지 않습니다.</p>
<ExecutionResult id="rviz-pose" alt="지도 좌표 (1.0, 0.5)에서 45도 방향을 가리키는 RViz 화살표">초록 화살표: 위치 (1.0, 0.5) m · 방향 45°</ExecutionResult>
<p>원점 축은 Add → Axes로 추가합니다. 기준 프레임을 등록하려면 별도 터미널에서 다음 명령을 실행합니다.</p>
<CodeExample label="화면의 기준 프레임 등록 · 별도 터미널" code="ros2 run tf2_ros static_transform_publisher --frame-id world --child-frame-id map"/>

<table><thead><tr><th>메시지</th><th>표시 항목</th><th>보이는 것</th></tr></thead><tbody><tr><td>PoseStamped</td><td>Pose</td><td>위치·방향 arrow</td></tr><tr><td>LaserScan</td><td>LaserScan</td><td>LiDAR 거리 점</td></tr><tr><td>PointCloud2</td><td>PointCloud2</td><td>3D points</td></tr><tr><td>OccupancyGrid</td><td>Map</td><td>지도 cell</td></tr><tr><td>Image</td><td>Image</td><td>카메라 사진</td></tr><tr><td>TF</td><td>TF</td><td>Frame 간 관계</td></tr></tbody></table>
<p>RViz가 그린 화살표는 수신한 메시지입니다. 화면에 보인다는 사실만으로 실제 위치와 일치한다고 판단할 수는 없습니다. 다른 좌표계의 센서를 map에서 보려면 측정 시각에 맞는 transform도 필요합니다.</p>
</Chapter>
<Chapter id="record" title="4. 몇 초 기록하고 bag 내용을 확인한다">
<p>발행 노드를 켜둔 상태에서 같은 강의 폴더의 새 터미널에서 기록합니다. 모든 ROS 터미널의 setup과 통신 영역을 맞추세요.</p>
<CodeExample label="Record → Ctrl+C → info" code={`mkdir -p bags
ros2 bag record -o bags/pose-demo /meroedu/pose
# 약 5초 뒤 Ctrl+C
ros2 bag info bags/pose-demo`}/>
<p>결과는 metadata와 storage file이 들어 있는 폴더입니다. Humble 기본 storage는 SQLite3 .db3입니다. 토픽 이름·형식·메시지 count·duration을 확인하세요. 같은 출력 이름을 재사용할 때는 새 이름을 정합니다. 녹화 데이터는 Git에 올리지 않습니다.</p>
<ExecutionResult id="rosbag-info" alt="rosbag의 토픽 형식, 메시지 수와 기록 시간"/>
</Chapter>
<Chapter id="replay" title="5. Live 발행 노드를 끄고 같은 토픽으로 재생한다">
<p>Pose 발행 노드를 Ctrl+C로 종료하고 RViz는 켜둡니다. 녹화된 메시지가 원래 토픽으로 다시 발행되면 같은 화살표를 볼 수 있습니다. 새 값을 보내는 노드와 기록을 재생하는 노드를 함께 켜면 두 입력이 섞입니다.</p>
<CodeExample label="Bag 재생" code={`ros2 bag play bags/pose-demo
# 필요할 때 --loop 또는 --rate 0.5 추가`}/>
<p>여러 센서의 측정 시각과 TF를 함께 다룰 때는 ROS time을 맞춥니다. <code>--clock</code>은 /clock을 발행하고 <code>use_sim_time=true</code>인 노드는 그 시간을 사용합니다. /clock이 없는데 true이면 시간이 멈춘 것처럼 보일 수 있습니다.</p>
<CodeExample label="재생 시각으로 RViz를 맞추는 경우 · 별도 터미널" code={`ros2 bag play bags/pose-demo --clock

# 별도 GUI 터미널에서
rviz2 -d pose.rviz --ros-args -p use_sim_time:=true`}/>
<p>실제 모터 명령을 기록한 bag을 재생하면 모터를 연결한 구독 노드가 받아 로봇을 움직일 수 있습니다. 이번 편은 표시용 위치와 방향만 사용합니다.</p>
<ExecutionResult id="rosbag-replay" alt="저장된 rosbag에서 재생한 PoseStamped 메시지">발행 노드 종료 후 bag 재생</ExecutionResult>
</Chapter>
<Chapter id="checks" title="6. 안 보이면 메시지 · 좌표계 · TF · QoS를 나눠 본다">
<p>먼저 토픽 echo로 실제 입력이 있는지 확인합니다. 다음으로 Fixed Frame 이름, 메시지의 좌표계, TF 경로와 측정 시각을 봅니다. TF를 쓰는 데이터는 <code>/tf</code>와 <code>/tf_static</code> 등 관련 transform도 함께 기록해야 합니다. 마지막으로 토픽 info의 QoS와 표시 항목 설정을 비교하세요. Sensor의 best-effort와 표시 항목의 reliable 요구가 안 맞으면 수신하지 못할 수 있습니다.</p>
<p>ROS 명령은 되는데 RViz가 안 뜨면 desktop session·DISPLAY·graphics 환경을 확인합니다. SSH shell만으로 화면이 생기지는 않습니다. 배포된 <code>pose.rviz</code>는 화면 구성을 준비한 파일이며 각 desktop 환경에서 실제 표시를 확인해야 합니다.</p>
<Check><p>RViz에 표시된 위치와 방향이 달라지면 먼저 메시지의 발행 노드를 확인합니다. 새 센서 측정인지 rosbag으로 재생한 기록인지에 따라 원인이 달라집니다.</p></Check>
</Chapter>
<footer className="education-sources"><h2>참고 자료와 실습 코드</h2><p>제공된 「기계시스템설계 · 로봇프로그래밍 기초 ROS」 강의 PDF의 개념과 교육 흐름을 참고해 Humble 환경과 독립 실행 예제로 재구성했습니다. 슬라이드 이미지를 붙이는 대신 사이트 테마에 맞는 HTML 도식으로 정리했습니다.</p><p><a href="https://github.com/merosnurobotics/meroedu-ros">실습 저장소</a> · <a href="https://github.com/merosnurobotics/meroedu-ros/blob/main/NOTICE.md">참고한 페이지·재구성·라이선스</a> · <a href="https://docs.ros.org/en/humble/Tutorials.html">ROS 2 Humble 공식 실습 안내</a></p></footer></Lesson>; }
