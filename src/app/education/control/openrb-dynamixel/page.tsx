import type { Metadata } from "next";
import { Lesson, Chapter, Check } from "@/components/education/lesson-primitives";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { CodeExample } from "@/components/education/code-example";
import { JetsonSetup } from "@/components/education/jetson-setup";
export const metadata: Metadata = { title: "Jetson + OpenRB로 DYNAMIXEL 기본 사용하기" };
const repo="https://github.com/merosnurobotics/meroedu-control/tree/main/lessons/03-openrb-dynamixel";
export default function Page() { return <Lesson topic="Control" topicPath="/education/control" path="/education/control/openrb-dynamixel" title="Jetson + OpenRB로 DYNAMIXEL 기본 사용하기" intro="ROS를 연결하기 전에 USB 명령으로 모터 하나를 움직여봅니다. OpenRB와 DYNAMIXEL의 역할, 전원과 통신, ID 확인, torque와 위치 명령을 순서대로 살펴봅니다." repo="meroedu-control">
<Chapter id="roles" title="1. DYNAMIXEL은 제어기가 들어 있는 모터다">
<p>DYNAMIXEL은 motor, encoder, 내부 제어기, 통신 interface가 함께 들어 있는 actuator입니다. 목표 위치를 보내면 내부에서 측정 위치와 비교해 움직입니다. 외부 Arduino가 PWM을 계산하는 encoder motor와 달리, 이번에는 OpenRB가 digital packet을 보내고 DYNAMIXEL이 자체 제어를 수행합니다.</p>
<FlowDiagram title="USB 명령에서 내부 위치 제어까지" steps={[{title:"Jetson",lines:["Python USB console", "ASCII 명령 한 줄"]},{title:"OpenRB-150",lines:["Serial1 · TTL half-duplex", "Protocol 2.0 packet"]},{title:"DYNAMIXEL",lines:["목표 위치 → 내부 제어", "Encoder 측정 feedback"]}]} feedback="Position · current · voltage가 같은 bus를 거쳐 Jetson으로 돌아옵니다." caption="이번 편은 ROS 없이 기본 동작부터 확인합니다."/>
</Chapter>
<Chapter id="setup" title="2. Jetson과 준비물을 먼저 맞춘다">
<JetsonSetup/>
<p>기본 편은 pySerial만 사용하지만 다음 회차를 위해 ROS 2 Humble까지 미리 준비합니다. 준비물은 OpenRB-150, XC330 계열 TTL 모터 한 개, USB data cable, DYNAMIXEL cable, 모델 규격에 맞는 전원입니다. 예제는 XC330의 <strong>current-based position mode (5)</strong>를 사용합니다. 다른 모터의 지원 모드와 control table이 같다고 가정하지 마세요.</p>
<CodeExample label="Jetson · 교육 코드만 clone" code={`git clone https://github.com/merosnurobotics/meroedu-control.git
cd meroedu-control
bash setup/check_jetson.sh
cd lessons/03-openrb-dynamixel`}/>
</Chapter>
<Chapter id="bus" title="3. USB 통신과 모터 전원을 나누어 연결한다">
<FlowDiagram title="신호 경로와 전력 경로" steps={[{title:"Jetson USB",lines:["USB data → OpenRB", "Host baud: 115200"]},{title:"OpenRB",lines:["External terminal ← motor 전원", "Jumper: VIN(DXL)"]},{title:"TTL DXL port",lines:["GND / VDD / DATA", "DXL bus: 1 Mbps"]}]} caption="전원은 모터 모델에 맞게 공급하고, 연결·분리는 전원을 끈 상태에서 합니다."/>
<p>OpenRB는 연결된 전원 전압을 DYNAMIXEL bus로 넘깁니다. 예를 들어 <a href="https://emanual.robotis.com/docs/en/dxl/x/xc330-t288/">XC330-T288은 6.5~12.0V, 권장 11.1V</a>이며 저전압 모델은 별도 사양입니다. 라벨과 해당 모델 eManual을 확인하세요. Jetson USB에서 모터 전력을 끌어 쓰거나, RS-485 모터를 TTL port에 직접 연결하지 않습니다.</p>
<p>첫 실습은 집게·링크·하중을 떼고 모터 하나를 고정해 진행합니다. <code>STOP</code>은 torque OFF라 축을 붙잡지 않습니다. 중력 하중이 매달린 리프트의 정지 방법으로 그대로 쓰면 안 됩니다.</p>
</Chapter>
<Chapter id="identity" title="4. ID와 baud를 확인하고 교육 firmware를 올린다">
<p><a href="https://emanual.robotis.com/docs/en/software/dynamixel/dynamixel_wizard2/">DYNAMIXEL Wizard 2.0</a>으로 모터 하나의 ID와 baud를 읽고 필요하면 설정합니다. 준비 기준은 <strong>ID 0 · 1,000,000 bps · Protocol 2.0</strong>입니다. Factory default라는 뜻이 아닙니다. 다른 ID를 유지하려면 sketch의 <code>DXL_ID</code>를 바꿉니다.</p>
<p>OpenRB를 Wizard adapter로 쓸 때는 <code>usb_to_dynamixel</code> passthrough sketch가 필요합니다. Wizard 확인이 끝나면 닫고 아래 교육용 ASCII firmware로 교체합니다. 교육 firmware를 올린 상태에서는 Wizard가 직접 packet을 주고받을 수 없습니다.</p>
<p>Arduino IDE에 아래 Board Manager URL을 추가한 뒤 Arduino SAMD Boards와 OpenRB-150을 설치합니다. Library Manager에서 Dynamixel2Arduino를 설치하고, board와 실제 USB port를 선택해 <code>firmware/openrb_dynamixel/openrb_dynamixel.ino</code>를 Verify 후 Upload합니다. 자세한 IDE/CLI 절차는 <a href={`${repo}/README.md`}>실습 README</a>에 있습니다.</p>
<CodeExample label="OpenRB Board Manager URL" code="https://raw.githubusercontent.com/ROBOTIS-GIT/OpenRB-150/master/package_openrb_index.json"/>
<p>Firmware는 <code>Serial1</code>, direction pin <code>-1</code>, DXL bus 1 Mbps를 사용합니다. Boot 시 bus power와 torque를 자동 켜지 않습니다. 모터 전원을 꺼두고 업로드하세요.</p>
</Chapter>
<Chapter id="commands" title="5. Power · ping · torque · 위치를 순서대로 확인한다">
<CodeExample label="Jetson · USB console 실행" code={`PORT=/dev/serial/by-id/여기에는-실제-장치명
/usr/bin/python3 serial_console.py --port "$PORT"`}/>
<p>Console에 아래 명령을 <strong>한 줄씩 입력하고 응답을 확인한 뒤</strong> 다음으로 넘어갑니다. <code>DXL_POWER_ON</code>은 bus power만 켜고, <code>INIT</code>도 torque OFF를 유지합니다. <code>TORQUE_ON</code>에서 현재 위치를 다시 goal로 기록한 뒤 힘을 켭니다.</p>
<CodeExample label="Console 입력 순서" code={`DXL_POWER_ON
PING
INIT
STATUS?
TORQUE_ON
MOVE_DELTA 32
STATUS?
STOP
DXL_POWER_OFF`}/>
<p><code>INIT</code>은 mode 5, Goal Current raw 80, profile velocity 20과 acceleration 5를 설정합니다. 교육용 시작값이며 장착된 기구에 맞춘 튜닝값은 아닙니다. <code>MOVE_DELTA 32</code>는 현재 위치에서 32 ticks 이동하라는 뜻입니다. 4096 ticks가 한 바퀴이므로 약 2.8°입니다.</p>
<p>예제는 명령당 ±64 ticks, 목표 0~4095 범위를 허용합니다. 상대 이동을 반복하면 계속 움직이므로 한 번만 입력하세요. 기계적 충돌을 알아내는 기능은 없습니다. Single-turn 위치와 작은 이동에 집중하며 multi-turn이나 homing은 다루지 않습니다.</p>
<Check><p>OK_MOVE는 목표 register 쓰기가 성공했다는 뜻입니다. 실제로 도착했는지는 POSITION feedback을 읽어 확인해야 합니다.</p></Check>
</Chapter>
<Chapter id="feedback" title="6. 명령의 성공과 실제 측정을 구분한다">
<CodeExample label="STATE 형식 · 설명용 예시" code="STATE POWER=1 READY=1 TORQUE=1 POSITION=2080 CURRENT_RAW=15 VOLTAGE_RAW=111 HW_ERROR=0 TORQUE_READ=1 VALID=1"/>
<p><code>POSITION</code>은 encoder 측정값입니다. Current와 voltage raw에는 모델별 단위를 적용해야 합니다. XC330-T288에서 전류는 1mA/LSB, 전압은 0.1V/LSB입니다. 프로그램이 요청한 <code>TORQUE</code>와 실제 register인 <code>TORQUE_READ</code>를 함께 보세요. 위 값은 형식 설명용이며 실제 측정 사진이나 기록이 아닙니다.</p>
<p>응답이 없으면 전원·ID·DXL baud·TTL cable을 확인합니다. USB baud 115200과 motor bus 1 Mbps는 서로 다른 구간입니다. VALID=0이면 읽기 오류 또는 motor alert가 있으므로 숫자를 유효한 측정값으로 사용하지 않습니다.</p>
<p>Console는 0.5초마다 STATUS?를 보내고, firmware는 통신이 3초 이상 끊기면 torque OFF를 요청합니다. Bus 자체가 끊기면 정지 요청도 전달되지 않을 수 있습니다. Console 종료 시 STOP을 보내고, 재연결 후 이전 이동을 자동 실행하지 않습니다.</p>
<p>기본 동작이 확인되면 <a href="/education/ros/dynamixel">다음 편 · ROS 2 토픽으로 DYNAMIXEL 제어하기</a>로 이어집니다.</p>
</Chapter>
<footer className="education-sources"><h2>실습 코드와 참고 자료</h2><p><a href={repo}>Console · firmware · 상세 실행 안내</a> · <a href="https://emanual.robotis.com/docs/en/parts/controller/openrb-150/">OpenRB eManual</a> · <a href="https://emanual.robotis.com/docs/en/dxl/x/xc330-t288/">XC330-T288 control table</a></p><p>OpenRB board core로 compile를 검증했습니다. 실제 모터·전원·기구 시험은 별도입니다. <a href="https://github.com/merosnurobotics/meroedu-control/blob/main/UPSTREAM.md">출처·라이선스 기록</a></p></footer>
</Lesson>; }
