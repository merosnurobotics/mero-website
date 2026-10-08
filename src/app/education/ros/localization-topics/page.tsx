import { ExecutionResult } from "@/components/education/execution-result";
import type { Metadata } from "next";
import Link from "next/link";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = { title: "위치 추정 결과를 ROS 2 토픽으로 내보내기" };
export default function Ros2TopicsLesson() { return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/localization-topics" title="위치 추정 결과를 ROS 2 토픽으로 내보내기" intro="앞에서 계산한 위치를 다른 프로그램이 받아 쓰도록 연결합니다. ROS 2의 노드와 토픽을 이해하고, LiDAR 스캔을 받아 지도 기준 위치를 발행한 뒤 터미널에서 직접 확인합니다." repo="meroedu-localization">
  <Chapter id="nodes" title="1. 계산 결과를 다른 프로그램에 전달한다">
    <p><Link href="/education/localization/lidar">첫 번째 LiDAR 자료</Link>에서는 Python 함수가 위치를 반환했습니다. 이제 센서를 읽는 프로그램, 위치를 계산하는 프로그램, 위치를 표시하는 프로그램을 나눕니다. ROS 2에서는 이런 실행 단위를 <strong>노드</strong>, 메시지가 흐르는 이름 있는 통로를 <strong>토픽</strong>이라고 부릅니다.</p>
    <FlowDiagram title="센서 → 위치 계산 → 결과 확인" steps={[{title:"Scan publisher",lines:["/meroedu/scan", "LaserScan"]},{title:"Localization node",lines:["scan 구독", "벽 거리 비교"]},{title:"Pose subscriber",lines:["/meroedu/pose", "터미널 · RViz"]}]} caption="발행 노드는 보내고 구독 노드는 받습니다. 위치 계산 노드는 스캔의 구독 노드이면서 위치와 방향의 발행 노드입니다."/>
    <p>이 예제는 <code>/meroedu/scan</code>을 구독하고 위치를 <code>/meroedu/pose</code>에 발행합니다. Matching 점수는 <code>/meroedu/match_score</code>로 보냅니다. Scan 메시지가 들어오면 각도와 거리를 계산 함수에 넣고, 유효한 결과만 출력합니다.</p>
    <Check><p>토픽 이름은 파일 이름이 아닙니다. <code>/meroedu/pose</code>에 구독자가 여러 개 붙으면 같은 위치 메시지를 각각 받을 수 있습니다.</p></Check>
  </Chapter>
  <Chapter id="messages" title="2. 위치 숫자에는 좌표와 시각이 필요하다">
    <p>(0.63, −0.47)만 보내면 어느 원점에서 측정했는지, 언제의 위치인지 알 수 없습니다. <code>geometry_msgs/msg/PoseStamped</code>는 <code>header</code>에 시각과 좌표 이름을, <code>pose</code>에 위치와 방향을 담습니다.</p>
    <div className="education-table-wrap"><table><caption>이번 예제의 세 토픽</caption><thead><tr><th>토픽</th><th>메시지 타입</th><th>내용</th></tr></thead><tbody><tr><td>/meroedu/스캔</td><td>sensor_msgs/msg/LaserScan</td><td>센서 기준 각도와 거리</td></tr><tr><td>/meroedu/위치와 방향</td><td>geometry_msgs/msg/PoseStamped</td><td>지도 기준 위치와 초기 가정 방향</td></tr><tr><td>/meroedu/match_score</td><td>std_msgs/msg/Float64</td><td>벽 거리 matching 잔차 [m]</td></tr></tbody></table></div>
    <CodeExample label="위치 추정을 PoseStamped에 담는 부분" code={`msg = PoseStamped()\nmsg.header.stamp = scan.header.stamp\nmsg.header.frame_id = "map"\nmsg.pose.position.x = pose.x\nmsg.pose.position.y = pose.y\nmsg.pose.orientation.z = math.sin(pose.yaw / 2)\nmsg.pose.orientation.w = math.cos(pose.yaw / 2)\nself.pose_pub.publish(msg)`}/>
    <p>위치는 m, yaw는 rad입니다. 메시지의 방향은 yaw 숫자 하나가 아니라 <strong>quaternion</strong> 네 성분입니다. 평면 회전에서는 x=y=0, z=sin(yaw/2), w=cos(yaw/2)로 채웁니다. 네 성분을 모두 0으로 두면 유효한 방향이 아닙니다.</p>
    <p><code>stamp</code>는 계산이 끝난 시각이 아니라 스캔을 관측한 시각입니다. <code>frame_id: map</code>은 이 예제의 방 중심 원점을 뜻합니다. 이름만 map으로 붙여도 좌표가 변환되는 것은 아닙니다. Score는 낮을수록 가정한 벽에 잘 맞는 잔차이며 정확도 백분율이 아닙니다. 별도 Float64에는 stamp가 없으므로 모니터링용으로 사용합니다.</p>
  </Chapter>
  <Chapter id="environment" title="3. ROS 2가 설치된 컴퓨터를 준비한다">
    <p>실행 예시는 Ubuntu 22.04와 ROS 2 Humble, 시스템 Python 3.10 기준입니다. ROS가 없다면 <a href="https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html">공식 설치 안내</a>에서 OS와 배포판 조합을 확인하세요. 이미 설치된 Jetson으로 <Link href="/education/development-setup/remote-work">ssh jetson</Link> 접속을 해 실습해도 됩니다.</p>
    <CodeExample label="처음 받는 경우 · 로컬 또는 Jetson" code={`cd ~\ngit clone https://github.com/merosnurobotics/meroedu-localization.git\ncd meroedu-localization/lessons/02-ros2-topics`}/>
    <p>이미 저장소가 있다면 그 폴더에서 <code>git pull --ff-only</code>로 업데이트한 후 이동합니다. <code>localization_node.py</code>는 01의 계산 함수를 불러오므로 저장소 전체를 clone하세요.</p>
    <CodeExample label="각 터미널에서 공통으로 실행" code={`source /opt/ros/humble/setup.bash\nexport ROS_DOMAIN_ID=42\ncd ~/meroedu-localization/lessons/02-ros2-topics\n/usr/bin/python3 -c "import rclpy, sensor_msgs, geometry_msgs, std_msgs"`}/>
    <p><code>source</code>는 현재 터미널에 ROS 환경을 불러옵니다. 새 터미널에서도 실행해야 합니다. 설치 배포판이나 clone 위치가 다르면 경로를 바꾸세요. <code>ROS_DOMAIN_ID</code>는 서로 발견할 ROS 그룹 번호입니다. 첫 실습은 같은 컴퓨터에서 세 터미널이 같은 번호를 사용합니다. 가상환경에 pip로 rclpy를 설치하는 방식은 사용하지 않습니다.</p>
  </Chapter>
  <Chapter id="run" title="4. 세 터미널로 발행과 구독을 확인한다">
    <CodeExample label="터미널 A · 센서 없이 합성 스캔 발행" code={`/usr/bin/python3 demo_scan.py`}/>
    <CodeExample label="터미널 B · 스캔을 받아 위치 발행" code={`/usr/bin/python3 localization_node.py`}/>
    <CodeExample label="터미널 C · 토픽과 메시지 확인" code={`ros2 topic list\nros2 topic info /meroedu/pose --verbose\nros2 topic echo /meroedu/pose --once\nros2 topic echo /meroedu/match_score --once\nros2 topic hz /meroedu/pose`}/>
    <FlowDiagram title="터미널마다 맡는 역할" steps={[{title:"A: 합성 센서",lines:["1초마다 scan", "고정된 합성 장면"]},{title:"B: 위치 계산",lines:["최신 scan 사용", "유효할 때만 pose"]},{title:"C: 관찰",lines:["echo: 내용 보기", "hz: 수신 주기 보기"]}]} caption="세 프로세스를 계속 실행한 상태에서 확인합니다. 각각 Ctrl+C로 종료합니다."/>
    <p>합성 장면의 위치는 (0.63, −0.47), 방향은 0.35 rad입니다. 출력 x/y가 이 근처이고 <code>frame_id: map</code>, stamp, quaternion이 채워졌는지 확인하세요. 고정된 장면을 반복 관측하므로 값은 거의 일정합니다. 이 결과는 실제 센서 정확도를 뜻하지 않습니다.</p>
    <p>RViz에서는 Fixed Frame을 <code>map</code>으로, Pose 표시 항목의 토픽을 <code>/meroedu/pose</code>로 지정합니다. LaserScan까지 겹쳐 보려면 해당 시각의 <code>map → laser</code> TF가 필요합니다. 위치 계산 노드에는 TF 발행 기능이 없으므로 <a href="/education-assets/execution/pose-to-tf.py">pose-to-tf.py</a>를 함께 실행합니다.</p>
      <ExecutionResult id="ros-localization" alt="합성 LaserScan으로 계산한 지도 좌표와 벽 일치 점수"/>
    <ExecutionResult id="rviz-localization" alt="RViz에서 벽에 겹쳐진 합성 거리 점과 추정 위치">파란 점: 합성 스캔 48개 · 초록 화살표: 추정 위치</ExecutionResult>
</Chapter>
  <Chapter id="real-scan" title="5. 합성 입력을 실제 LiDAR로 바꾼다">
    <p>A의 합성 발행 노드를 종료하고 실제 LiDAR 드라이버를 실행합니다. 드라이버마다 토픽 이름이 다를 수 있으므로 이름과 타입부터 확인합니다.</p>
    <CodeExample label="실제 스캔 확인과 입력 토픽 지정" code={`ros2 topic list -t\nros2 topic info /laser_scan --verbose\nros2 topic echo /laser_scan --once --qos-reliability best_effort\n/usr/bin/python3 localization_node.py --ros-args \\\n  -p scan_topic:=/laser_scan -p known_yaw:=0.0`}/>
    <p><code>/laser_scan</code>은 입력 이름의 예시입니다. 내 센서가 <code>/scan</code>을 내보내면 그 이름을 넣습니다. <code>known_yaw=0.0</code>은 센서 정면이 지도 +x 방향인 경우만 맞습니다. 센서 중심과 로봇 중심이 일치하고, 초기 방향을 유지하며, 벽 범위가 ±2 m인 첫 자료의 가정을 먼저 맞추세요.</p>
    <p>이 노드는 방향을 새로 추정하거나 모터를 움직이지 않습니다. 센서 장착 오프셋·다른 지도·회전 이동은 별도 확장이 필요합니다. IMU 방향 보완은 첫 자료의 더 생각해 보기으로 남겨둡니다.</p>
  </Chapter>
  <Chapter id="checks" title="6. 토픽이 안 보이면 약속을 하나씩 확인한다">
    <p><strong>토픽 이름·타입:</strong> 발행 노드와 구독 노드가 같은 이름과 타입을 사용하는지 봅니다. <strong>환경:</strong> 모든 터미널에서 setup을 source했고 ROS_DOMAIN_ID가 같은지 확인합니다. <strong>QoS:</strong> 센서가 BEST_EFFORT로 보내면 RELIABLE 수신만 요구하는 구독자는 연결되지 않을 수 있습니다.</p>
    <p>입력 QoS의 queue 깊이는 1로 설정해 최신 스캔을 우선합니다. 교육 노드는 스캔을 하나 저장하고 0.5초마다 소비합니다. 유효 광선이 8개 미만이거나 matching 잔차가 크면 위치와 방향을 발행하지 않습니다. 입력 stamp가 없거나 1초보다 오래됐을 때도 버립니다. 입력이 멈추면 출력도 멈추므로, 위치와 방향을 사용하는 쪽도 마지막 관측 시각을 확인해야 합니다.</p>
    <Check><p>메시지가 정상적으로 나와도 좌표 설정이 다르면 RViz에 잘못된 위치가 표시됩니다. 좌표계 이름뿐 아니라 실제 원점과 축, m/rad 단위, 초기 yaw를 확인하세요. Tailscale 연결만으로 DDS 노드 검색이 자동 전달되지는 않습니다. 처음에는 여러 SSH 터미널에서 같은 Jetson의 토픽을 확인하세요.</p></Check>
    <p>다음은 <Link href="/education/localization/object-localization">3번째 자료: 객체 위치 추정</Link>입니다. 로봇 위치를 이용해 카메라가 본 물체의 좌표를 지도에 옮깁니다.</p>
  </Chapter>
  <footer className="education-sources"><h2>참고 자료와 실행 확인</h2><p><a href="https://github.com/merosnurobotics/meroedu-localization/tree/main/lessons/02-ros2-topics">실습 코드와 실행 안내</a> · <a href="https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html">ROS 2 발행 노드/구독 노드</a> · <a href="https://docs.ros.org/en/humble/Concepts/Intermediate/About-Quality-of-Service-Settings.html">ROS 2 QoS</a></p><p>Ubuntu 22.04 / ROS 2 Humble에서 합성 스캔을 실제 ROS 메시지로 보내 위치·점수를 수신하고, 오래된 스캔이 발행되지 않는 것을 확인했습니다. 실제 LiDAR·TF·Nav2 연결은 이 실습의 실행 검증 범위에 포함되지 않습니다. <a href="https://github.com/merosnurobotics/meroedu-localization/blob/main/UPSTREAM.md">코드 출처·라이선스 기록</a></p></footer>
</Lesson>; }
