import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"처음 시작하는 ROS 2"};
export default function Page() {return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/basics" title="처음 시작하는 ROS 2" intro="ROS가 무엇을 연결하는지부터 시작합니다. Node·Package·Topic·Message를 구분하고 터미널에서 첫 메시지를 주고받습니다." repo="meroedu-ros">
<Chapter id="role" title="1. ROS는 여러 로봇 프로그램을 연결한다">
<p>로봇에는 센서를 읽는 프로그램, 위치를 계산하는 프로그램, 이동 목표를 만드는 프로그램, 모터를 움직이는 프로그램이 함께 필요합니다. 각자 만든 프로그램이 같은 약속으로 데이터를 주고받을 수 있게 도와주는 것이 ROS입니다. 이름은 Robot Operating System이지만 Ubuntu를 대체하는 OS 자체가 아니라 그 위에서 동작하는 middleware와 도구 모음입니다.</p>
<FlowDiagram title="로봇을 한 프로그램 대신 역할로 나누기" steps={[{title:"Sensor node",lines:["Camera image", "LiDAR scan"]},{title:"계산 node",lines:["물체 · 위치 추정", "이동 목표 결정"]},{title:"제어 node",lines:["이동 message 수신", "Hardware 명령 전달"]}]} caption="같은 센서 topic을 RViz나 기록 도구도 함께 받을 수 있습니다."/>
<p>이번 시리즈는 <strong>ROS 2 Humble</strong>을 사용합니다. ROS 1의 roscore·rostopic과 ROS 2의 ros2 명령은 섞지 않습니다. ROS 2는 기본 node discovery에 중앙 roscore를 따로 실행하지 않습니다.</p>
</Chapter>
<Chapter id="vocabulary" title="2. Node · Topic · Message · Package를 구분한다">
<table><thead><tr><th>용어</th><th>의미</th><th>예시</th></tr></thead><tbody><tr><td>Node</td><td>ROS graph에 참여하는 실행 단위</td><td>문자열을 보내는 talker</td></tr><tr><td>Topic</td><td>이름과 type으로 정한 발행/구독 통로</td><td>/meroedu/chatter</td></tr><tr><td>Message</td><td>실제로 전송하는 값과 구조</td><td>String의 data</td></tr><tr><td>Package</td><td>코드·의존성·실행 항목 묶음</td><td>meroedu_ros_basics</td></tr><tr><td>Workspace</td><td>Package를 모아 build/install하는 폴더</td><td>ros_ws</td></tr></tbody></table>
<p>Node 하나가 여러 topic을 발행하거나 구독할 수 있고, 하나의 process에 여러 node를 둘 수도 있습니다. Package는 프로그램의 묶음이지 실행 중인 node 자체가 아닙니다. Topic은 데이터를 저장한 파일이나 변수도 아닙니다.</p>
<FlowDiagram title="Publisher와 subscriber가 만나는 약속" steps={[{title:"Publisher",lines:["Message 객체 만들기", "publish(msg)"]},{title:"Topic",lines:["/meroedu/chatter", "std_msgs/msg/String"]},{title:"Subscriber",lines:["Message 수신", "Callback 실행"]}]} caption="이름·type·QoS·domain이 맞아야 통신할 수 있습니다. 여러 subscriber가 같은 데이터를 받을 수 있습니다."/>
</Chapter>
<Chapter id="environment" title="3. Ubuntu 22.04와 Humble을 준비한다">
<p><a href="https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html">Humble Ubuntu deb 설치 안내</a>를 따라 Ubuntu 22.04에 <code>ros-humble-ros-base</code>를 설치합니다. Windows/macOS라면 Ubuntu 실습 환경을 먼저 준비하세요. 다른 OS 버전에 아래 명령을 그대로 적용하지 않습니다. Jetson은 JetPack 6의 Ubuntu 22.04 환경을 사용합니다.</p>
<CodeExample label="설치 후 실습 의존성 준비" code={`sudo apt update
sudo apt install python3-colcon-common-extensions python3-setuptools ros-humble-std-msgs
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 --help`}/>
<p><code>source</code>는 해당 터미널에 ROS 명령·모듈·경로를 알려줍니다. 새 터미널에서도 반복하세요. 같은 실습의 node는 같은 ROS_DOMAIN_ID를 사용하고, 여러 팀은 서로 다른 번호를 정합니다. 같은 domain만으로 서로 다른 컴퓨터가 반드시 연결되는 것은 아니며 discovery·네트워크·firewall도 영향을 줍니다.</p>
</Chapter>
<Chapter id="first-message" title="4. 터미널에서 첫 message를 보내고 받는다">
<CodeExample label="터미널 A · 1초마다 문자열 publish" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic pub --rate 1 /meroedu/chatter std_msgs/msg/String "{data: 'hello MERO'}"`}/>
<CodeExample label="터미널 B · 같은 topic 구독" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic echo /meroedu/chatter std_msgs/msg/String`}/>
<p>B에 <code>data: hello MERO</code>가 반복되면 두 프로그램이 연결된 것입니다. <code>/meroedu/chatter</code>는 통로 이름, <code>std_msgs/msg/String</code>은 값의 구조, <code>data</code>는 실제 문자열을 담는 field입니다.</p>
<CodeExample label="터미널 C · Graph와 type 확인" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 node list
ros2 topic list -t
ros2 topic info /meroedu/chatter --verbose
ros2 interface show std_msgs/msg/String
ros2 topic hz /meroedu/chatter`}/>
<p><code>info</code>는 publisher/subscriber와 QoS를, <code>interface show</code>는 message field를, <code>hz</code>는 관측한 수신 주기를 보여줍니다. hz의 약 1Hz는 실시간 성능 보장 수치가 아닙니다. CLI의 pub/echo도 내부 node를 만들어 graph에 나타납니다. 각 터미널에서 Ctrl+C로 종료합니다.</p>
</Chapter>
<Chapter id="contracts" title="5. Topic과 Service · Action · Parameter의 역할">
<table><thead><tr><th>방식</th><th>쓰는 상황</th><th>예시</th></tr></thead><tbody><tr><td>Topic</td><td>연속적인 발행/구독 stream</td><td>Camera image · 현재 위치 · cmd_vel</td></tr><tr><td>Service</td><td>요청 하나와 응답 하나</td><td>설정 조회</td></tr><tr><td>Action</td><td>긴 작업의 목표·feedback·결과·취소</td><td>목표 위치까지 이동</td></tr><tr><td>Parameter</td><td>Node의 설정값</td><td>지원하는 node의 속도 제한</td></tr></tbody></table>
<p>계속 갱신되어야 하는 속도와, 완료 확인이 필요한 목표 이동은 계약이 다릅니다. Topic으로 문자열을 보낼 수 있다고 모든 작업을 같은 방식으로 설계하지 않습니다. 앞으로 명령이 한 번 실행되는지 반복 적용되는지도 확인할 것입니다.</p>
</Chapter>
<Chapter id="check" title="6. 안 보일 때는 연결의 약속을 하나씩 본다">
<p>ros2 명령이 없으면 source를 확인합니다. Echo가 기다리고 있으면 publisher가 켜져 있는지 확인하세요. Topic 이름·type·domain·QoS를 차례로 비교합니다. 이름만 같고 message type이 다르면 정상적인 같은 통로가 아닙니다.</p>
<Check><p>하나의 Camera topic을 객체인식 node, RViz, rosbag이 동시에 받을 수 있을까요? 가능합니다. Publisher는 특정 수신자 한 명에게만 보내는 구조가 아닙니다.</p></Check>
<p>다음은 <a href="/education/ros/python-pubsub">Python publisher/subscriber</a>로 직접 Node를 만듭니다. 데이터를 남기고 화면에서 보는 방법은 <a href="/education/ros/bag-rviz">rosbag과 RViz</a>에서 다룹니다.</p>
</Chapter>
<Chapter id="official-examples" title="7. 공식 talker/listener와 turtlesim으로 더 확인한다">
<p>ROS 2 공식 설치 안내의 talker/listener는 예제 코드를 쓰기 전에 통신 환경을 확인하는 방법입니다. 설치된 demo node를 두 터미널에서 실행합니다. 이번 시리즈의 /meroedu/chatter와 다른 /chatter topic을 사용합니다.</p>
<CodeExample label="공식 demo package 설치" code={`sudo apt install ros-humble-demo-nodes-cpp ros-humble-turtlesim`}/>
<CodeExample label="터미널 A · 공식 talker" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run demo_nodes_cpp talker`}/>
<CodeExample label="터미널 B · 공식 listener" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run demo_nodes_cpp listener`}/>
<p>Publisher의 Publishing과 subscriber의 I heard 출력이 같은 문자열을 가리키면 연결된 것입니다. C++로 만든 공식 demo와 다음 편의 Python node가 모두 같은 ROS graph/message 방식으로 동작합니다.</p>
<h3>GUI가 있으면 turtlesim</h3>
<p>Turtlesim은 ROS node와 topic을 배우는 작은 2D 예제입니다. 실제 로봇 하드웨어가 필요하지 않습니다. Ubuntu desktop에서 아래 두 명령을 각각 다른 터미널에서 실행하고, 키 입력은 두 번째 터미널에 focus를 둔 상태에서 합니다.</p>
<CodeExample label="터미널 A · 화면" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run turtlesim turtlesim_node`}/>
<CodeExample label="터미널 B · 키보드 제어" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 run turtlesim turtle_teleop_key`}/>
<CodeExample label="터미널 C · 어떤 message인지 보기" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic list -t
ros2 topic echo /turtle1/cmd_vel geometry_msgs/msg/Twist`}/>
<p>방향키를 누르면 Twist의 linear/angular 값이 바뀝니다. 문자열 예제에서 배운 topic/type 관계가 이동 명령에도 적용됩니다. GUI가 없는 Jetson SSH 환경에서는 talker/listener부터 진행하세요.</p>
<p><a href="https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html#try-some-examples">공식 설치 예제</a> · <a href="https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Introducing-Turtlesim/Introducing-Turtlesim.html">공식 turtlesim tutorial</a>의 순서로 이어갈 수 있습니다.</p>
</Chapter><footer className="education-sources"><h2>참고 자료와 실습 코드</h2><p>제공된 「기계시스템설계 · 로봇프로그래밍 기초 ROS」 강의 PDF의 개념과 교육 흐름을 참고해 Humble 환경과 독립 실행 예제로 재구성했습니다. 슬라이드 이미지를 붙이는 대신 사이트 테마에 맞는 HTML 도식으로 정리했습니다.</p><p><a href="https://github.com/merosnurobotics/meroedu-ros">실습 저장소</a> · <a href="https://github.com/merosnurobotics/meroedu-ros/blob/main/NOTICE.md">참고한 페이지·재구성·라이선스</a> · <a href="https://docs.ros.org/en/humble/Tutorials.html">ROS 2 Humble 공식 tutorial</a></p></footer></Lesson>; }
