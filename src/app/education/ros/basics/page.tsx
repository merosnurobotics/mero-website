import { FoundationChapter } from "@/components/education/foundation-chapter";
import { ExecutionResult } from "@/components/education/execution-result";
import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"처음 시작하는 ROS 2"};
export default function Page() {return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/basics" title="처음 시작하는 ROS 2" intro="ROS가 무엇을 연결하는지부터 시작합니다. 노드·패키지·토픽·메시지를 구분하고 터미널에서 첫 메시지를 주고받습니다." repo="meroedu-ros">
<FoundationChapter id="units"/>
<FoundationChapter id="frames"/>
<Chapter id="role" title="1. ROS는 여러 로봇 프로그램을 연결한다">
<p>로봇은 센서를 읽고, 위치를 계산하고, 이동할 곳을 정하고, 모터를 움직여야 합니다. 이 일을 맡은 프로그램들이 데이터를 주고받게 돕는 도구가 <strong>ROS</strong>입니다.</p>
<p>ROS는 Ubuntu 같은 운영체제 위에서 실행합니다. 각 프로그램의 역할을 나누고, 같은 센서 값을 여러 프로그램에 전달할 수 있습니다.</p>
<FlowDiagram title="로봇을 한 프로그램 대신 역할로 나누기" steps={[{title:"센서 노드",lines:["카메라 사진", "LiDAR 거리 측정"]},{title:"계산 노드",lines:["물체 · 위치 추정", "이동 목표 결정"]},{title:"제어 노드",lines:["이동 메시지 수신", "하드웨어 명령 전달"]}]} caption="같은 센서 토픽을 RViz나 기록 도구도 함께 받을 수 있습니다."/>
<p>실습은 <strong>ROS 2 Humble</strong> 기준입니다. 명령은 <code>ros2</code>로 시작합니다. ROS 1 자료에 나오는 <code>roscore</code>는 이 실습에서 실행하지 않습니다.</p>
</Chapter>
<Chapter id="vocabulary" title="2. 노드 · 토픽 · 메시지 · 패키지를 구분한다">
<table><thead><tr><th>용어</th><th>의미</th><th>예시</th></tr></thead><tbody><tr><td>노드(Node)</td><td>ROS 연결 관계에 참여하는 실행 단위</td><td>문자열을 보내는 talker</td></tr><tr><td>토픽(Topic)</td><td>이름과 형식으로 정한 발행/구독 통로</td><td>/meroedu/chatter</td></tr><tr><td>메시지(Message)</td><td>실제로 전송하는 값과 구조</td><td>String의 data</td></tr><tr><td>패키지(Package)</td><td>코드·의존성·실행 항목 묶음</td><td>meroedu_ros_basics</td></tr><tr><td>작업 공간(Workspace)</td><td>패키지를 모아 빌드하고 설치하는 폴더</td><td>ros_ws</td></tr></tbody></table>
<p>노드 하나가 여러 토픽을 발행하거나 구독할 수 있고, 하나의 프로세스에 여러 노드를 둘 수도 있습니다. 패키지는 프로그램의 묶음이지 실행 중인 노드 자체가 아닙니다. 토픽은 데이터를 저장한 파일이나 변수도 아닙니다.</p>
<FlowDiagram title="발행 노드와 구독 노드가 만나는 약속" steps={[{title:"보내는 노드",lines:["메시지 객체 만들기", "publish(msg)"]},{title:"토픽",lines:["/meroedu/chatter", "std_msgs/msg/String"]},{title:"받는 노드",lines:["메시지 수신", "수신 시 콜백 실행"]}]} caption="이름·형식·QoS·통신 영역이 맞아야 통신할 수 있습니다. 여러 구독 노드가 같은 데이터를 받을 수 있습니다."/>
</Chapter>
<Chapter id="environment" title="3. Ubuntu 22.04와 Humble을 준비한다">
<p><a href="https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html">Humble Ubuntu deb 설치 안내</a>를 따라 Ubuntu 22.04에 <code>ros-humble-ros-base</code>를 설치합니다. Windows/macOS라면 Ubuntu 실습 환경을 먼저 준비하세요. 다른 OS 버전에 아래 명령을 그대로 적용하지 않습니다. Jetson은 JetPack 6의 Ubuntu 22.04 환경을 사용합니다.</p>
<CodeExample label="설치 후 실습 의존성 준비" code={`sudo apt update
sudo apt install python3-colcon-common-extensions python3-setuptools ros-humble-std-msgs
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 --help`}/>
<p><code>source</code>는 해당 터미널에 ROS 명령·모듈·경로를 알려줍니다. 새 터미널에서도 반복하세요. 같은 실습의 노드는 같은 ROS_DOMAIN_ID를 사용하고, 여러 팀은 서로 다른 번호를 정합니다. 같은 통신 영역만으로 서로 다른 컴퓨터가 반드시 연결되는 것은 아니며 노드 검색·네트워크·방화벽도 영향을 줍니다.</p>
</Chapter>
<Chapter id="first-message" title="4. 터미널에서 첫 메시지를 보내고 받는다">
<CodeExample label="터미널 A · 1초마다 문자열 보내기" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic pub --rate 1 /meroedu/chatter std_msgs/msg/String "{data: 'hello MERO'}"`}/>
<CodeExample label="터미널 B · 같은 토픽 구독" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic echo /meroedu/chatter std_msgs/msg/String`}/>
<p>B에 <code>data: hello MERO</code>가 반복되면 두 프로그램이 연결된 것입니다. <code>/meroedu/chatter</code>는 통로 이름, <code>std_msgs/msg/String</code>은 값의 구조, <code>data</code>는 실제 문자열을 담는 필드입니다.</p>
<CodeExample label="터미널 C · 연결 관계와 형식 확인" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 node list
ros2 topic list -t
ros2 topic info /meroedu/chatter --verbose
ros2 interface show std_msgs/msg/String
ros2 topic hz /meroedu/chatter`}/>
<p><code>info</code>는 발행 노드/구독 노드와 QoS를, <code>interface show</code>는 메시지 필드를, <code>hz</code>는 관측한 수신 주기를 보여줍니다. hz의 약 1Hz는 실시간 성능 보장 수치가 아닙니다. CLI의 pub/echo도 내부 노드를 만들어 연결 관계에 나타납니다. 각 터미널에서 Ctrl+C로 종료합니다.</p>
<ExecutionResult id="ros-topic" alt="std_msgs/msg/String 토픽으로 수신한 hello MERO"/>
</Chapter>
<Chapter id="contracts" title="5. 토픽과 Service · Action · Parameter의 역할">
<table><thead><tr><th>방식</th><th>쓰는 상황</th><th>예시</th></tr></thead><tbody><tr><td>토픽(Topic)</td><td>연속적인 발행/구독 데이터 흐름</td><td>카메라 사진 · 현재 위치 · cmd_vel</td></tr><tr><td>Service</td><td>요청 하나와 응답 하나</td><td>설정 조회</td></tr><tr><td>Action</td><td>긴 작업의 목표·피드백·결과·취소</td><td>목표 위치까지 이동</td></tr><tr><td>Parameter</td><td>노드의 설정값</td><td>지원하는 노드의 속도 제한</td></tr></tbody></table>
<p>계속 갱신하는 속도 명령과 완료 여부를 확인해야 하는 이동 요청은 통신 방식이 다릅니다. 토픽으로 문자열을 보낼 수 있다고 모든 작업을 같은 방식으로 설계하지 않습니다. 앞으로 명령이 한 번 실행되는지 반복 적용되는지도 확인할 것입니다.</p>
</Chapter>
<Chapter id="check" title="6. 안 보일 때는 연결의 약속을 하나씩 본다">
<p>ros2 명령이 없으면 source를 확인합니다. Echo가 기다리고 있으면 발행 노드가 켜져 있는지 확인하세요. 토픽 이름·형식·통신 영역·QoS를 차례로 비교합니다. 이름만 같고 메시지 형식이 다르면 정상적인 같은 통로가 아닙니다.</p>
<Check><p>객체인식 노드, RViz, rosbag은 하나의 카메라 토픽을 동시에 구독할 수 있습니다. 발행 노드는 토픽으로 메시지를 보내고, 각 구독자가 이를 받습니다.</p></Check>
<p>다음은 <a href="/education/ros/python-pubsub">Python으로 메시지 주고받기</a>로 직접 노드를 만듭니다. 데이터를 남기고 화면에서 보는 방법은 <a href="/education/ros/bag-rviz">rosbag과 RViz</a>에서 다룹니다.</p>
</Chapter>
<Chapter id="official-examples" title="7. 공식 talker/listener와 turtlesim으로 더 확인한다">
<p>ROS 2 공식 설치 안내의 talker/listener는 예제 코드를 쓰기 전에 통신 환경을 확인하는 방법입니다. 설치된 예제 노드를 두 터미널에서 실행합니다. 이번 시리즈의 /meroedu/chatter와 다른 /chatter 토픽을 사용합니다.</p>
<CodeExample label="공식 예제 패키지 설치" code={`sudo apt install ros-humble-demo-nodes-cpp ros-humble-turtlesim`}/>
<CodeExample label="터미널 A · 공식 talker" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run demo_nodes_cpp talker`}/>
<CodeExample label="터미널 B · 공식 listener" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run demo_nodes_cpp listener`}/>
<p>발행 노드의 Publishing과 구독 노드의 I heard 출력이 같은 문자열을 가리키면 연결된 것입니다. C++로 만든 공식 예제와 다음 편의 Python 노드가 모두 같은 ROS 연결 관계/메시지 방식으로 동작합니다.</p>
<h3>GUI가 있으면 turtlesim</h3>
<p>Turtlesim은 ROS 노드와 토픽을 배우는 작은 2D 예제입니다. 실제 로봇 하드웨어가 필요하지 않습니다. Ubuntu desktop에서 아래 두 명령을 각각 다른 터미널에서 실행하고, 키 입력은 두 번째 터미널에 초점를 둔 상태에서 합니다.</p>
<CodeExample label="터미널 A · 화면" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run turtlesim turtlesim_node`}/>
<CodeExample label="터미널 B · 키보드 제어" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run turtlesim turtle_teleop_key`}/>
<CodeExample label="터미널 C · 어떤 메시지인지 보기" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic list -t
ros2 topic echo /turtle1/cmd_vel geometry_msgs/msg/Twist`}/>
<p>방향키를 누르면 Twist의 linear/angular 값이 바뀝니다. 문자열 예제에서 배운 토픽/형식 관계가 이동 명령에도 적용됩니다. GUI가 없는 Jetson SSH 환경에서는 talker/listener부터 진행하세요.</p>
<p><a href="https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html#try-some-examples">공식 설치 예제</a> · <a href="https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Introducing-Turtlesim/Introducing-Turtlesim.html">공식 turtlesim tutorial</a>의 순서로 이어갈 수 있습니다.</p>
</Chapter><footer className="education-sources"><h2>참고 자료와 실습 코드</h2><p>제공된 「기계시스템설계 · 로봇프로그래밍 기초 ROS」 강의 PDF의 개념과 교육 흐름을 참고해 Humble 환경과 독립 실행 예제로 재구성했습니다. 슬라이드 이미지를 붙이는 대신 사이트 테마에 맞는 HTML 도식으로 정리했습니다.</p><p><a href="https://github.com/merosnurobotics/meroedu-ros">실습 저장소</a> · <a href="https://github.com/merosnurobotics/meroedu-ros/blob/main/NOTICE.md">참고한 페이지·재구성·라이선스</a> · <a href="https://docs.ros.org/en/humble/Tutorials.html">ROS 2 Humble 공식 실습 안내</a></p></footer></Lesson>; }
