import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
import { JetsonSetup } from "@/components/education/jetson-setup";
export const metadata: Metadata = {title:"ROS 2 토픽으로 DYNAMIXEL 제어하기"};
const repo="https://github.com/merosnurobotics/meroedu-control/tree/main/lessons/04-ros2-dynamixel";
export default function Page() { return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/dynamixel" title="ROS 2 토픽으로 DYNAMIXEL 제어하기" intro="기본 사용 편에서 확인한 OpenRB firmware에 ROS 2 bridge를 연결합니다. Topic으로 명령을 보내고, 실제 응답을 다시 topic으로 받아 제어 흐름을 확인합니다." repo="meroedu-control">
<Chapter id="pipeline" title="1. USB interface 앞에 ROS node를 연결한다">
<p><a href="/education/control/openrb-dynamixel">OpenRB + DYNAMIXEL 기본 사용</a>에서 배선·ID·baud·firmware·console 동작을 먼저 확인하세요. 이번 편은 같은 firmware를 유지하고 Jetson의 console을 ROS bridge로 교체합니다. 이 교육 저장소 전체를 clone하면 필요한 코드가 모두 들어 있습니다.</p>
<FlowDiagram title="ROS command와 실제 응답의 경로" steps={[{title:"ROS publisher",lines:["/dynamixel/command", "std_msgs/msg/String"]},{title:"Jetson bridge",lines:["명령 검증 → USB", "응답 → /dynamixel/state"]},{title:"OpenRB + motor",lines:["ASCII → Protocol 2.0", "현재 위치 · 오류 읽기"]}]} feedback="Motor feedback은 OpenRB → USB → state topic으로 돌아옵니다." caption="Topic의 String, USB 한 줄, DYNAMIXEL packet은 서로 다른 구간의 표현입니다."/>
</Chapter>
<Chapter id="environment" title="2. 준비한 Jetson과 이전 firmware를 그대로 사용한다">
<JetsonSetup/>
<CodeExample label="교육 코드와 ROS 환경" code={`git clone https://github.com/merosnurobotics/meroedu-control.git
cd meroedu-control/lessons/04-ros2-dynamixel
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42`}/>
<p>Bridge는 같은 저장소 03의 protocol helper를 가져옵니다. 파일 하나만 복사하지 말고 전체를 clone하세요. 실제 연결 전에는 USB console·Wizard·Serial monitor를 종료합니다.</p>
</Chapter>
<Chapter id="dry-run" title="3. 모터 없이 topic부터 확인한다">
<CodeExample label="터미널 A · 기본 dry run" code="/usr/bin/python3 bridge_node.py"/>
<CodeExample label="터미널 B · 나가는 serial 명령" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic echo /dynamixel/serial_tx std_msgs/msg/String`}/>
<CodeExample label="터미널 C · 이동 명령 한 번" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'MOVE_DELTA 32'}"`}/>
<p>기본 <code>dry_run=true</code>는 USB를 열지 않습니다. TX에 MOVE_DELTA 32가 보이고 0.5초마다 STATUS?가 나와야 합니다. 실제 장치가 없으므로 state 측정값은 만들어지지 않습니다. 지원하지 않는 명령·개행·±64를 넘는 상대 이동은 bridge가 거절합니다.</p>
</Chapter>
<Chapter id="hardware" title="4. 실제 port를 열고 단계별 명령을 보낸다">
<CodeExample label="터미널 A · 실제 장치" code={`PORT=/dev/serial/by-id/여기에는-실제-장치명
/usr/bin/python3 bridge_node.py --ros-args -p dry_run:=false -p serial_port:="$PORT"`}/>
<CodeExample label="터미널 B · 실제 응답" code="ros2 topic echo /dynamixel/state std_msgs/msg/String"/>
<p>연결 시 bridge는 STOP만 보내며 power·INIT·torque·move를 자동 실행하지 않습니다. 터미널 C에서 아래 명령을 <strong>각각 실행하고 응답을 확인한 뒤</strong> 다음 단계로 넘어갑니다. 링크나 하중 없는 모터 하나를 고정한 상태에서 시작합니다.</p>
<CodeExample label="터미널 C · 한 번씩 실행" code={`ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'DXL_POWER_ON'}"
ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'PING'}"
ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'INIT'}"
ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'TORQUE_ON'}"
ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'MOVE_DELTA 32'}"
ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'STOP'}"
ros2 topic pub --once /dynamixel/command std_msgs/msg/String "{data: 'DXL_POWER_OFF'}"`}/>
<Check><p>왜 --once일까요? MOVE_DELTA는 현재 위치에서 더 움직이는 상대 명령입니다. 같은 문자열을 10Hz로 반복하면 목표가 계속 갱신됩니다. INIT도 mode register를 바꾸므로 반복 publish하지 않습니다.</p></Check>
</Chapter>
<Chapter id="feedback" title="5. Topic의 약속과 실제 상태를 확인한다">
<table><thead><tr><th>Topic</th><th>방향</th><th>의미</th></tr></thead><tbody><tr><td>/dynamixel/command</td><td>입력</td><td>명령 한 개 · String</td></tr><tr><td>/dynamixel/serial_tx</td><td>출력</td><td>보내려는 USB 명령 · String</td></tr><tr><td>/dynamixel/state</td><td>출력</td><td>실제 STATE / OK / ERR / STOP 응답 · String</td></tr></tbody></table>
<p>TX가 보인다고 모터가 목표에 도착한 것은 아닙니다. STATE의 position과 hardware error를 확인하세요. OK_MOVE는 register 쓰기 성공, POSITION은 실제 측정입니다. Library 오류가 있으면 측정값을 신뢰하지 않습니다.</p>
<p>Bridge는 0.5초마다 STATUS?를 보내고 firmware는 3초 통신 watchdog을 적용합니다. Node 종료 시 STOP, 통신 실패 시 자동 reconnect하지 않습니다. STOP은 torque OFF이므로 중력 하중을 지탱하는 장치에 그대로 적용하지 않습니다.</p>
</Chapter>
<Chapter id="discussion" title="6. 여러 관절로 확장할 때의 discussion">
<p>String 계약은 통신을 눈으로 확인하기 위한 시작점입니다. 여러 관절을 제어할 때는 motor ID·목표 위치·단위·timestamp를 담은 typed message나 service/action을 정하고 feedback으로 도착 여부를 판정합니다. 여러 publisher가 같은 상대 이동을 중복 실행하지 않도록 명령 소유권과 acknowledgment도 설계해야 합니다.</p>
<p>실습 저장소에는 실제 ROS 2와 pseudo-terminal을 연결하는 test가 있습니다. USB 문자열·feedback·잘못된 명령 거절을 검사하며 모터나 기구 동작을 대신하는 simulation은 아닙니다.</p>
</Chapter>
<footer className="education-sources"><h2>실습 코드와 참고 자료</h2><p><a href={repo}>ROS bridge · 실행 안내 · 통신 test</a> · <a href="/education/control/openrb-dynamixel">기본 사용과 firmware</a> · <a href="https://docs.ros.org/en/humble/Concepts/Basic/About-Topics.html">ROS 2 topics</a></p><p><a href="https://github.com/merosnurobotics/meroedu-control/blob/main/UPSTREAM.md">출처·라이선스 기록</a></p></footer>
</Lesson>; }
