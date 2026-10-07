import type { Metadata } from "next";
import { Lesson, Chapter, Figure, Check } from "@/components/education/lesson-primitives";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"그림으로 이해하는 PID control"};
const a="/education-assets/control";
const source="https://github.com/YenCho/ddonggae/blob/d85758c752e6cd3244e16d9ea4a3d2831da225b4";
const commons=(name:string)=>`https://commons.wikimedia.org/wiki/File:${name}`;
export default function PIDLesson() { return <Lesson topic="Control theory" topicPath="/education/control-theory" path="/education/control-theory/pid-control" title="그림으로 이해하는 PID control" intro="목표 속도로 바퀴를 돌리고, 정해진 경로로 로봇을 움직여봅니다. 목표와 측정값을 비교하는 feedback부터 P·I·D의 역할을 그림으로 이해하고, ddonggae의 encoder motor와 경로 추종 구조를 작은 실습으로 연결합니다." repo="meroedu-control">
  <Chapter id="feedback" title="1. 목표대로 움직이려면 결과를 다시 본다">
    <p>모터에 PWM 80을 준다고 항상 같은 속도가 나오지는 않습니다. 배터리 상태, 바닥 마찰, 실린 물체에 따라 달라집니다. Open-loop는 명령만 보내고 끝냅니다. Closed-loop는 encoder로 실제 속도를 재고 목표와 비교해 다음 명령을 바꿉니다. 이 되먹임을 feedback이라고 부릅니다.</p>
    <p>Setpoint는 원하는 값, measurement는 실제로 측정한 값입니다. <code>error = setpoint − measurement</code>로 정합니다. 목표가 5 rad/s인데 3 rad/s로 돌면 오차는 +2 rad/s입니다. 이때 회전을 더 빠르게 하는 방향으로 출력을 늘립니다. Encoder 부호가 반대라면 보정이 오차를 키우므로 게인보다 부호를 먼저 확인해야 합니다.</p>
    <Figure src={`${a}/PID_en.svg`} width={972} height={345} alt="목표 r에서 측정 y를 빼 오차를 만들고 P I D의 출력을 합쳐 plant에 보내는 PID 블록 다이어그램" caption="왼쪽의 빼기 → P·I·D 세 경로 → 합산 → plant → 측정값의 되먹임을 따라 읽어보세요. Plant는 실제로 움직이는 대상입니다." credit={<><a href={commons('PID_en.svg')}>Arturo Urquizo · Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a> · 원본 그대로 사용</>}/>
    <Check><p>목표 속도는 rad/s, 출력은 PWM입니다. 오차를 그대로 PWM으로 쓸 수 있을까요? 단위와 대상 특성을 연결하는 계수, 즉 gain이 필요합니다.</p></Check>
  </Chapter>
  <Chapter id="terms" title="2. P는 현재, I는 누적, D는 변화 속도를 본다">
    <div className="education-table-wrap"><table><thead><tr><th>항</th><th>무엇을 보는가</th><th>처음 떠올릴 역할</th></tr></thead><tbody><tr><td>P · proportional</td><td>지금의 오차</td><td>멀리 틀렸으면 크게 보정</td></tr><tr><td>I · integral</td><td>시간 동안 쌓인 오차</td><td>작지만 계속 남는 오차를 보정</td></tr><tr><td>D · derivative</td><td>오차의 변화율</td><td>변화가 빠를 때 응답에 제동을 걸기</td></tr></tbody></table></div>
    <h3>P: 지금 얼마나 틀렸는가</h3><p><code>P = Kp × error</code>. Kp=10이면 +2 rad/s의 오차에 +20 PWM을 더합니다. 작은 Kp는 반응이 느릴 수 있고, 크게 올리면 overshoot나 진동이 생길 수 있습니다. 큰 값이 항상 좋은 것은 아닙니다.</p>
    <Figure src={`${a}/PID_varyingP.jpg`} width={591} height={458} alt="Kp 값에 따라 목표에 도달하는 시간과 overshoot가 달라지는 응답 곡선" caption="가로축은 시간, 세로축은 제어 대상의 값입니다. 같은 목표에 대한 곡선들이 얼마나 빠르게 접근하고 넘치는지 비교하세요. 이 그림의 대상과 게인을 우리 모터에 그대로 옮길 수는 없습니다." credit={<><a href={commons('PID_varyingP.jpg')}>TimmmyK · Wikimedia Commons</a> · CC0 · 원본 그대로 사용</>}/>
    <h3>I: 작은 오차가 계속 남는가</h3><p>실린 물체 때문에 0.2 rad/s가 계속 부족하다면 P 보정만으로 필요한 힘에 도달하지 못할 수 있습니다. I는 그 오차를 시간에 걸쳐 누적합니다. 다만 출력이 이미 최대인데도 누적하면 나중에 목표를 지나치는 integral windup이 생깁니다. 적분값 제한과 포화 중 누적 억제를 함께 사용합니다.</p>
    <h3>D: 오차가 얼마나 빠르게 바뀌는가</h3><p>D는 연속 두 오차의 차이를 시간 간격으로 나눕니다. 목표로 빠르게 접근할 때 보정 출력을 줄이는 데 도움이 될 수 있습니다. 그러나 측정 잡음도 미분하면 커집니다. Encoder의 계단 형태 측정에 D를 크게 넣으면 출력이 떨릴 수 있으므로, 처음에는 D=0으로 시작하세요.</p>
    <Figure src={`${a}/PID_Compensation_Animated.gif`} width={400} height={300} alt="P I D gain을 순서대로 바꾸면서 목표 응답 곡선이 달라지는 애니메이션" caption="계수가 바뀔 때 응답이 빨라지고, 남은 오차가 줄고, 진동 모양이 달라지는 과정을 봅니다. 특정 plant의 설명용 예제이며 모든 시스템에서 똑같은 모양이 나오는 것은 아닙니다." credit={<><a href={commons('PID_Compensation_Animated.gif')}>Physicsch · Wikimedia Commons</a> · CC0 · 원본 그대로 사용</>}/>
  </Chapter>
  <Chapter id="digital" title="3. 컴퓨터는 일정 시간마다 PID를 다시 계산한다">
    <p>연속적인 적분과 미분을 컴퓨터에서는 작은 시간 간격 dt로 근사합니다. 같은 loop에서 target, measurement, dt를 넣어 다음 출력을 얻습니다. 20 ms는 0.02 s입니다. dt를 ms 숫자 20으로 넣으면 I와 D의 크기가 크게 달라집니다.</p>
    <CodeExample label="Discrete PID의 기본 형태" code={`error = target - measured\nintegral += error * dt\nderivative = (error - previous_error) / dt\noutput = kp * error + ki * integral + kd * derivative\nprevious_error = error`}/>
    <p>실습의 <code>PID</code> 클래스는 여기에 출력 제한, 적분값 제한, 포화 방향으로 계속 쌓이는 적분을 억제하는 처리를 넣었습니다. 첫 호출의 D는 0으로 시작합니다. 모터를 정지할 때는 적분값을 초기화해야 다음 시작에 이전 보정이 남지 않습니다.</p>
    <p>목표값을 갑자기 바꾸면 error의 D도 순간적으로 커질 수 있습니다. 실물에서 이 문제가 보이면 목표를 천천히 바꾸는 ramp, 측정값 기준 derivative, 저역통과 필터를 검토합니다. 한 번에 모두 넣기보다 측정 그래프를 보고 필요한 것을 추가하세요.</p>
  </Chapter>
  <Chapter id="encoder" title="4. Encoder motor: tick을 속도로 바꿔 PWM을 보정한다">
    <Figure src={`${a}/motor-loop.svg`} alt="목표 바퀴 속도와 encoder 측정 속도의 차이로 PID PWM을 만들고 모터를 돌리는 폐루프" caption="안쪽 루프는 바퀴 자체의 속도를 맞춥니다. 로봇 전체가 어디에 있는지는 이 루프의 입력이 아닙니다."/>
    <p>Encoder tick은 회전량입니다. dt 동안 늘어난 tick을 바퀴 한 바퀴당 count 수 CPR로 나누면 회전수가 되고, 2π를 곱하면 rad가 됩니다. 여기에 dt를 나누면 rad/s입니다. CPR은 encoder 사양의 pulse 수와 다를 수 있습니다. A/B decoding 방식과 기어비를 포함한 <strong>바퀴 한 바퀴의 실제 count</strong>로 보정하세요.</p>
    <CodeExample label="Encoder tick → rad/s" code={`omega = delta_ticks * (2 * math.pi) / counts_per_wheel_rev / dt\n# 예: 20 ms에 21 ticks, 보정한 CPR=1320\n# omega ≈ 5.00 rad/s\n# RPM으로 보려면 omega * 60 / (2 * math.pi)`}/>
    <p>ddonggae의 Arduino firmware는 20 ms 주기로 wheel velocity를 계산합니다. 기본 게인은 Kp=10, Ki=8, Kd=0으로, 실제로는 PI입니다. 목표 속도에 대한 feedforward를 먼저 주고 PI가 부족한 부분을 보정합니다. 이 값은 그 로봇의 모터·드라이버·부하에서 정한 값이며 다른 모터의 시작값으로 보장되지 않습니다.</p>
    <CodeExample label="원본에서 추린 motor 제어의 핵심" code={`error = target - measured\nintegral = clamp(integral + error * dt, integral_limit)\nfeedforward = sign(target) * (min_pwm + ff_slope * abs(target))\npwm = clamp(feedforward + kp*error + ki*integral + kd*derivative, max_pwm)\n# target≈0: PWM=0, integral과 previous_error 초기화`}/>
    <Figure src={`${a}/motor-response.png`} alt="간단한 모터 시뮬레이션의 P PI PID 속도 응답과 PI PWM 그래프" caption="교육 코드로 실행한 모터 모델입니다. 1 s에 목표를 주고 6 s에 부하를 늘렸습니다. 왼쪽의 속도와 오른쪽의 PWM을 함께 보세요. 실제 모터 측정 그래프가 아닙니다."/>
    <p>모터를 실제로 연결할 때는 driver의 DIR/PWM 규약, encoder 부호, 전압과 전류 한계부터 확인합니다. 바퀴를 띄운 상태에서 작은 출력으로 방향을 보고, 그다음 작은 목표 속도로 시작합니다. 즉시 정지할 방법을 준비한 뒤 바닥 부하를 더해 측정하세요. 예제 프로그램은 실제 PWM 핀이나 serial port에 명령을 보내지 않습니다.</p>
  </Chapter>
  <Chapter id="line" title="5. 정해진 line 따라가기: 바퀴 속도 위에 경로 루프를 둔다">
    <p>여기서 line은 바닥의 검은 테이프가 아니라 <strong>지도 좌표에 정해진 경로</strong>입니다. ddonggae는 LiDAR localization으로 현재 위치를 얻고, 경기장의 통로를 따라 이동했습니다. 광센서로 테이프를 보는 line follower라면 오차를 얻는 센서 부분이 달라집니다.</p>
    <Figure src={`${a}/qualifier1-route.png`} width={1275} height={1134} alt="실제 qualifier 1 경기에서 기록된 localization 추정 경로" caption="원본 경기의 경로 기록입니다. 위치 추정값을 시각화한 것이며 ground truth 궤적은 아닙니다. 교육용 PID 실습의 결과와 구분해서 보세요." credit={<a href={`${source}/media/runs/README.md`}>ddonggae · Qualifier 1 pose log와 필터링 설명</a>}/>
    <p>수평 경로 y=0을 따라갈 때 횡오차는 <code>e_cross = 0 − current_y</code>입니다. 로봇이 선의 위쪽 y=+0.1 m로 벗어나면 e_cross=−0.1 m입니다. 메카넘 로봇에서는 음의 지도 y 속도를 주어 선으로 돌아오게 할 수 있습니다. 진행 방향 속도와 선으로 돌아오는 속도를 따로 계산합니다.</p>
    <Figure src={`${a}/line-loop.svg`} alt="경로와 localization의 오차가 body velocity를 만들고 encoder PID가 각 바퀴 속도를 맞추는 계층 구조" caption="바깥 루프: 경로 오차 → 이동 속도. 안쪽 루프: 목표 바퀴 속도 → PWM. 서로 다른 값을 제어하는 두 루프입니다."/>
    <p>원본 <code>navigation/street_nav.py</code>는 횡오차에 P 보정, 작은 오차의 deadband, 속도 상한, 큰 이탈 시 진행 감속을 사용합니다. I·D를 모두 쓰는 경로 PID라고 설명하면 원본과 다릅니다. 실습은 이 P 중심 구조를 먼저 만들고, 같은 PID 클래스에서 Ki 또는 Kd를 켜보는 확장으로 구성했습니다.</p>
    <CodeExample label="수평 line의 횡방향 보정" code={`cross_error = reference_y - measured_y\nvy_map = lateral_pid.step(cross_error, 0.0, dt)\nvx_map = forward_speed * slowdown_from_cross_error\n# 지도 속도를 현재 로봇의 body frame으로 회전\nvx_body = cos(yaw)*vx_map + sin(yaw)*vy_map\nvy_body = -sin(yaw)*vx_map + cos(yaw)*vy_map`}/>
    <Figure src={`${a}/line-response.png`} alt="메카넘 모형이 수평 기준선으로 복귀하는 경로와 시간별 횡오차 그래프" caption="교육 시뮬레이션에서 18 cm 이탈 상태로 시작했습니다. 4 s부터 일정한 측방 교란을 추가합니다. P만 사용하면 교란에 대응하는 만큼 작은 잔여 오차가 남습니다. Ki를 추가해 그 차이를 비교해보세요."/>
    <p>차동 구동 로봇은 옆으로 움직일 수 없으므로 이 vy 명령을 그대로 실행할 수 없습니다. 횡오차로 목표 방향이나 회전 속도를 만들도록 바꿔야 합니다. 또 localization 갱신 주기가 느리거나 같은 측정값이 반복되면 D가 튈 수 있습니다. 센서의 새 timestamp와 실제 dt를 사용하고 noise를 확인하세요.</p>
  </Chapter>
  <Chapter id="practice" title="6. 그래프를 보고 하나씩 튜닝한다">
    <CodeExample label="PID 첫 실습 · 로컬 컴퓨터" code={`git clone https://github.com/merosnurobotics/meroedu-control.git\ncd meroedu-control/lessons/01-pid\npython3 demo.py --output output\n# motor-p.csv, motor-pi.csv, motor-pid.csv, line.csv 생성\npython3 -m unittest discover -s tests`}/>
    <ol className="education-process"><li><strong>단위와 부호</strong><span>Encoder count, dt, 목표와 측정의 단위를 맞추고 작은 출력에 측정이 같은 방향으로 변하는지 확인합니다.</span></li><li><strong>P부터</strong><span>I=D=0에서 Kp를 작게 시작해 반응 속도와 overshoot를 봅니다.</span></li><li><strong>I는 남는 오차에</strong><span>부하를 바꿔 정상 상태 오차가 남을 때 추가합니다. 출력 포화와 적분값을 함께 기록합니다.</span></li><li><strong>D는 필요한 경우에</strong><span>진동을 줄일 여지가 있는지 보고 작은 값부터 확인합니다. 잡음 때문에 나빠지면 필터와 측정 주기를 먼저 봅니다.</span></li></ol>
    <Check><p>실습: line controller의 Ki를 0에서 작은 값으로 바꿔 같은 교란을 반복하세요. 오차가 줄어드는 대신 복귀 과정이 흔들리지는 않나요? 속도 상한에 오래 걸리면 적분값은 어떻게 되나요?</p></Check>
  </Chapter>
  <footer className="education-sources"><h2>참고 자료와 코드의 출처</h2><p><a href="https://en.wikipedia.org/wiki/PID_controller">Wikipedia · PID controller</a> · <a href={`${source}/hardware/firmware/arduino_mecanum/mecanum_encoder_control.ino`}>ddonggae encoder firmware</a> · <a href={`${source}/navigation/street_nav.py`}>원본 경로 제어</a></p><p>그림과 개념을 설명한 글은 교육용으로 작성했습니다. 원본 PI·P 구현과 교육용 PID 확장을 구분했고, 시뮬레이션 결과를 실제 측정으로 표시하지 않았습니다. <a href={`${a}/NOTICE.md`}>이미지 출처·라이선스</a></p></footer>
</Lesson>; }
