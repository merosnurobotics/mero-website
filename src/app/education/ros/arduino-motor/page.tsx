import { ExecutionResult } from "@/components/education/execution-result";
import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
import { JetsonSetup } from "@/components/education/jetson-setup";
export const metadata: Metadata = { title: "Jetson에서 ROS로 엔코더 모터 제어하기" };
const repo="https://github.com/merosnurobotics/meroedu-control/tree/main/lessons/02-ros-arduino-motor";
export default function Page() { return <Lesson topic="ROS" topicPath="/education/ros" path="/education/ros/arduino-motor" title="Jetson에서 ROS로 엔코더 모터 제어하기" intro="ROS의 이동 명령이 USB를 지나 Arduino와 모터 드라이버를 거쳐 실제 회전이 되는 과정을 따라갑니다. 엔코더 피드백은 Arduino에서 처리하고, Jetson은 이동 목표를 전달합니다." repo="meroedu-control">
<Chapter id="pipeline" title="1. Jetson은 목표를 보내고 Arduino는 속도를 맞춘다">
<p>Jetson에서 로봇을 앞으로 움직이라고 결정해도 모터가 바로 도는 것은 아닙니다. ROS 메시지를 받아 시리얼 통신 명령으로 바꾸는 연결 프로그램, 바퀴별 목표를 계산하는 Arduino, 전력을 공급하는 모터 드라이버가 필요합니다. 이번 실습은 엔코더 모터 네 개와 메카넘 바퀴를 기준으로 그 연결을 정리합니다.</p>
<FlowDiagram title="이동 명령이 실제 회전이 되기까지" steps={[{title:"Jetson · ROS 2",lines:["/cmd_vel → USB serial", "m vx vy wz"]},{title:"Arduino UNO",lines:["바퀴별 목표 속도", "Encoder → PI → PWM / DIR"]},{title:"Driver + motor",lines:["MDD10A × 2", "Encoder motor × 4"]}]} feedback="Encoder A/B 신호는 Arduino로 돌아갑니다." caption="USB는 명령 통신, 별도 모터 전원은 회전 에너지를 공급합니다."/>
<JetsonSetup/>
</Chapter>
<Chapter id="cmd-vel" title="2. cmd_vel은 로봇의 이동 속도를 담는다">
<p><code>geometry_msgs/msg/Twist</code>의 <code>linear.x</code>는 전진 속도, <code>linear.y</code>는 왼쪽 이동 속도(m/s), <code>angular.z</code>는 반시계 회전 속도(rad/s)로 사용합니다. 이 약속은 로봇 정면과 바퀴 장착 방향이 맞아야 성립합니다. 다른 축 값은 이 예제에서 사용하지 않습니다.</p>
<CodeExample label="Twist → USB 한 줄" code={`linear.x = 0.03
linear.y = 0.0
angular.z = 0.0

# Bridge가 보내는 명령
m 0.03000 0.00000 0.00000`}/>
<p>연결 프로그램는 20Hz로 최근 목표를 보냅니다. 0.5초 동안 새 cmd_vel이 없으면 <code>stop</code>을 보냅니다. 입력 속도와 바퀴 목표에는 제한을 두고, geometry로 계산한 네 바퀴 중 하나라도 상한을 넘으면 전체 속도를 같은 비율로 줄입니다.</p>
<Check><p>cmd_vel의 0.03은 PWM 3이 아닙니다. 로봇의 전진 속도 0.03 m/s입니다. Arduino가 바퀴 반지름과 배치로 바퀴의 rad/s 목표를 계산합니다.</p></Check>
</Chapter>
<Chapter id="firmware" title="3. Arduino가 엔코더를 읽고 PI로 PWM을 보정한다">
<FlowDiagram title="각 바퀴 안쪽의 속도 피드백" steps={[{title:"목표 rad/s",lines:["몸체 속도 → 바퀴 속도", "실측 geometry 사용"]},{title:"PI + feedforward",lines:["목표 − encoder 속도", "PWM 출력 제한"]},{title:"Motor + encoder",lines:["회전 → A/B count", "20ms마다 속도 계산"]}]} feedback="측정 속도를 다음 PI 계산으로 되돌립니다." caption="D는 0인 PI부터 시작합니다. 네 바퀴가 각각 자신의 속도 오차를 줄입니다."/>
<CodeExample label="FL / FR / RL / RR · X 메카넘 배치" code={`k = half_length + half_width
FL = (vx - vy - k*wz) / wheel_radius
FR = (vx + vy + k*wz) / wheel_radius
RL = (vx + vy - k*wz) / wheel_radius
RR = (vx - vy + k*wz) / wheel_radius

measured_rad_s = delta_ticks * 2*pi / ticks_per_revolution / dt`}/>
<p>엔코더는 A/B의 모든 edge를 세는 x4 방식입니다. 예제 CPR 1320은 특정 geared 모터 기준이며 자신의 출력축을 한 바퀴 돌려 count가 얼마 늘어나는지 확인해 <code>ENCODER_CPR</code>를 바꾸세요. 연결 프로그램의 geometry도 실측 반지름·앞뒤 및 좌우 바퀴 중심 간격의 절반으로 수정합니다. 예시 치수는 정답이 아닙니다.</p>
<p>펌웨어는 목표 속도의 예상 PWM인 feedforward에 PI 보정을 더합니다. 출력이 포화되는 방향으로 적분이 계속 쌓이지 않도록 하고 정지 시 적분을 초기화합니다. USB 명령이 500ms 끊기면 Arduino도 별도로 정지합니다.</p>
</Chapter>
<Chapter id="wiring" title="4. USB·모터 전원·엔코더 신호를 구분한다">
<p>Arduino UNO R3와 MDD10A 두 개를 사용합니다. MDD10A는 sign-magnitude 방식으로 PWM과 DIR를 받습니다. 모터 전원은 드라이버의 전원 단자에, 모터 두 선은 각 출력에 연결합니다. Driver의 signal ground와 Arduino GND를 연결합니다. 엔코더의 전원 규격도 확인하세요. UNO의 5V 신호를 Jetson의 3.3V GPIO에 직접 연결하지 않습니다.</p>
<table><thead><tr><th>바퀴</th><th>DIR</th><th>PWM</th><th>엔코더 A / B</th></tr></thead><tbody><tr><td>FL · 앞 왼쪽</td><td>D4</td><td>D5</td><td>D8 / D9</td></tr><tr><td>FR · 앞 오른쪽</td><td>D7</td><td>D6</td><td>A0 / A1</td></tr><tr><td>RL · 뒤 왼쪽</td><td>D2</td><td>D3</td><td>A2 / A3</td></tr><tr><td>RR · 뒤 오른쪽</td><td>D12</td><td>D10</td><td>D11 / A5</td></tr></tbody></table>
<p>엔코더 pin-change interrupt를 직접 사용하는 UNO 전용 펌웨어입니다. Mega·ESP32로 board 이름만 바꾸면 동작하지 않습니다. 전원이 꺼진 상태에서 배선하고, 첫 회전에서는 바퀴를 바닥에서 들어 올려 고정하세요. PWM 제한만으로 기계적 안전이 보장되지는 않습니다.</p>
</Chapter>
<Chapter id="dry-run" title="5. 모터 없이 ROS부터 확인한다">
<CodeExample label="터미널 A · clone하고 dry run" code={`git clone https://github.com/merosnurobotics/meroedu-control.git
cd meroedu-control/lessons/02-ros-arduino-motor
source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
/usr/bin/python3 bridge_node.py`}/>
<CodeExample label="터미널 B · 나가는 명령 확인" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic echo /motor/serial_tx std_msgs/msg/String`}/>
<CodeExample label="터미널 C · 낮은 전진 속도" code={`source /opt/ros/humble/setup.bash
export ROS_DOMAIN_ID=42
ros2 topic pub --rate 10 /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.03}, angular: {z: 0.0}}"`}/>
<p>기본 실행은 <code>dry_run=true</code>라 USB를 열지 않습니다. B에 <code>m 0.03000 0.00000 0.00000</code>이 나오고 C를 Ctrl+C로 종료하면 <code>stop</code>으로 바뀌어야 합니다. 아직 엔코더 측정값이나 모터 동작은 없습니다.</p>
<ExecutionResult id="motor-command" alt="목표 속도 0.03 m/s를 변환한 시리얼 명령">드라이런 · 목표 속도 0.03 m/s</ExecutionResult>
<ExecutionResult id="motor-timeout" alt="속도 입력 중단 후 출력된 stop 명령">드라이런 · 속도 입력 중단 → stop</ExecutionResult>
</Chapter>
<Chapter id="hardware" title="6. 펌웨어를 올리고 실제 장치를 연결한다">
<p>Arduino IDE에서 UNO board와 실제 port를 선택해 <code>firmware/encoder_motor/encoder_motor.ino</code>를 Verify 후 Upload합니다. Arduino CLI를 사용한다면 <a href={`${repo}/README.md`}>README의 compile/upload 절차</a>를 따르세요. 업로드 중에는 연결 프로그램와 Serial monitor를 닫습니다.</p>
<CodeExample label="터미널 A · 실제 USB와 실측 geometry" code={`# PORT와 치수는 자신의 장치로 바꿉니다. 아래 치수는 예시입니다.
PORT=/dev/serial/by-id/여기에는-실제-장치명
/usr/bin/python3 bridge_node.py --ros-args \
  -p dry_run:=false -p serial_port:="$PORT" \
  -p wheel_radius_m:=0.05 -p half_length_m:=0.15 -p half_width_m:=0.125`}/>
<p>연결 프로그램는 USB를 연 뒤 재부팅 시간을 기다리고 stop·geometry·부호·데이터 흐름 설정을 보냅니다. 바퀴를 들어 올린 상태에서 한 번에 낮은 속도로 확인하고, 양의 목표에서 실제 회전과 엔코더 count가 모두 양의 방향인지 점검하세요. 다르면 <code>motor_signs</code>와 <code>encoder_signs</code>를 바퀴별로 보정합니다. 틀린 피드백 부호는 PI가 출력을 키우게 만듭니다.</p>
</Chapter>
<Chapter id="feedback" title="7. 명령과 실제 피드백을 따로 확인한다">
<CodeExample label="실제 Arduino 응답 보기" code={`ros2 topic echo /motor/state std_msgs/msg/String

# 형식 설명용 예시, 실제 측정값 아님
# STATE,ms,FLticks,FRticks,RLticks,RRticks,FLpwm,FRpwm,RLpwm,RRpwm,mode`}/>
<p><code>/motor/serial_tx</code>는 보내려는 명령, <code>/motor/state</code>는 Arduino가 읽은 엔코더 count와 적용 PWM입니다. TX만 보고 실물이 목표에 도달했다고 판단하지 않습니다. Count 변화량과 시간 간격으로 속도를 계산하고 부하를 바꿨을 때 PWM과 속도가 어떻게 바뀌는지 관찰하세요.</p>
<p>cmd_vel 발행 노드를 끄면 연결 프로그램의 0.5초 timeout으로 정지해야 합니다. USB가 끊기면 펌웨어의 0.5초 watchdog이 적용됩니다. 이 예제는 통신 오류 후 자동으로 이전 움직임을 재개하지 않습니다. 전원을 끊을 수 있는 방법도 준비하세요.</p>
</Chapter>
<footer className="education-sources"><h2>실습 코드와 참고 자료</h2><p><a href={repo}>펌웨어 · 연결 프로그램 · 실행 안내</a> · <a href="https://docs.ros.org/en/humble/Concepts/Basic/About-Topics.html">ROS 2 topics</a> · <a href="https://docs.arduino.cc/hardware/uno-rev3/">Arduino UNO</a> · <a href="https://www.cytron.io/p-10amp-5v-30v-dc-motor-driver-2-channels">MDD10A</a></p><p>UNO compile와 실제 ROS 2 + pseudo-terminal 통신 검증을 수행했습니다. 실제 모터·전원·기구 시험은 별도입니다. <a href="https://github.com/merosnurobotics/meroedu-control/blob/main/UPSTREAM.md">출처·라이선스 기록</a></p></footer>
</Lesson>; }
