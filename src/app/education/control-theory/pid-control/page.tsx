import { FlowDiagram } from "@/components/education/native-diagrams";
import type { Metadata } from "next";
import { Lesson, Chapter, Figure, Check } from "@/components/education/lesson-primitives";
import { CodeExample } from "@/components/education/code-example";
export const metadata: Metadata = {title:"그림으로 이해하는 PID control"};
const a="/education-assets/control";
const source="https://github.com/YenCho/ddonggae/blob/d85758c752e6cd3244e16d9ea4a3d2831da225b4";
const commons=(name:string)=>`https://commons.wikimedia.org/wiki/File:${name}`;
export default function PIDLesson() { return <Lesson topic="Control theory" topicPath="/education/control-theory" path="/education/control-theory/pid-control" title="그림으로 이해하는 PID control" intro="목표 속도로 바퀴를 돌리고, 정해진 경로로 로봇을 움직여봅니다. 목표와 측정값을 비교하는 feedback부터 P·I·D의 역할을 그림으로 이해하고, ddonggae의 encoder motor와 경로 추종을 통해 PID를 적용할 수 있는 흐름을 살펴봅니다." repo="meroedu-control">
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
  <Chapter id="applications" title="4. PID 활용 예시">
    <p>PID를 적용하려면 먼저 네 가지를 정합니다. 무엇을 원하는가, 무엇을 측정하는가, 둘의 차이는 무엇인가, 어떤 명령을 바꿀 수 있는가. 같은 PID라도 바퀴 속도를 제어할 때와 로봇의 경로를 제어할 때는 이 값들이 달라집니다.</p>
    <h3>예시 1 · Encoder motor의 속도 맞추기</h3>
    <p>목표는 바퀴가 원하는 속도로 도는 것입니다. Encoder는 바퀴의 회전량을 알려주므로, 일정 시간 동안 늘어난 count를 이용해 실제 회전 속도를 얻습니다. 목표 속도에서 측정 속도를 빼면 속도 오차가 됩니다. 제어기가 바꾸는 값은 motor driver에 보내는 PWM입니다.</p>
    <FlowDiagram title="Encoder motor: 속도를 보고 출력을 보정" steps={[{title:"원하는 바퀴 속도",lines:["얼마나 빠르게 돌릴까?"]},{title:"Encoder 측정",lines:["실제 회전 속도", "목표와 비교"]},{title:"PID → PWM",lines:["속도 오차에 따라", "모터 출력 보정"]}]} feedback="바뀐 속도를 다시 측정하고 같은 과정을 반복합니다." caption="목표: 회전 속도 · 측정: encoder 속도 · 오차: 목표 − 측정 · 출력: PWM"/>
    <p>로봇에 물체를 싣거나 바닥 마찰이 커져 속도가 떨어지면 P는 현재의 부족한 속도만큼 출력을 보탭니다. 작은 속도 부족이 계속 남으면 I가 그 오차를 누적해 추가 출력을 만듭니다. 속도 응답이 너무 빠르게 변하거나 진동한다면 D를 검토할 수 있지만, encoder 측정의 잡음도 함께 커질 수 있습니다.</p>
    <p>ddonggae도 각 바퀴의 encoder 속도를 확인해 PWM을 보정했습니다. 원본의 기본 속도 제어는 D를 0으로 둔 <strong>PI</strong>이고, 목표 속도에서 예상되는 출력을 feedforward로 먼저 주었습니다. PID의 세 항을 반드시 모두 켜야 하는 것은 아닙니다. 측정과 부하를 보고 필요한 항을 선택한다는 사례입니다.</p>
    <h3>예시 2 · 정해진 line을 따라 움직이기</h3>
    <p>이번 목표는 바퀴의 속도 자체가 아니라 로봇이 정해진 경로를 따라가는 것입니다. ddonggae의 line은 지도에 정한 통로입니다. LiDAR localization으로 현재 위치를 얻고, 기준 경로에서 옆으로 얼마나 벗어났는지를 측정합니다. 바닥의 검은 테이프를 따라가는 로봇이라면 이 오차를 광센서나 카메라로 얻을 수 있습니다.</p>
    <FlowDiagram title="Line tracking: 경로 이탈을 보고 움직임 보정" steps={[{title:"기준 line",lines:["어디로 가야 할까?"]},{title:"위치·선 측정",lines:["경로에서 벗어난 정도", "횡방향 오차"]},{title:"PID → 이동 명령",lines:["옆으로 복귀하거나", "회전 방향 보정"]}]} feedback="로봇의 새 위치를 다시 기준 line과 비교합니다." caption="목표: 경로 유지 · 측정: 위치 또는 선의 위치 · 오차: 경로 이탈 · 출력: 이동·회전 명령"/>
    <p>선에서 멀리 벗어나면 P가 더 크게 복귀하도록 보정합니다. 한쪽 바퀴의 특성이나 지속적인 미끄러짐 때문에 같은 방향으로 계속 치우친다면 I를 검토할 수 있습니다. 선을 지나 좌우로 흔들린다면 D로 변화 속도를 고려하는 방법을 생각할 수 있습니다. 다만 위치 측정이 드문드문 갱신되거나 잡음이 크면 D가 불필요한 출력을 만들 수 있습니다.</p>
    <p>원본 ddonggae의 경로 추종은 <strong>P 중심 보정</strong>에 작은 오차의 deadband, 보정 속도 제한, 크게 벗어났을 때 진행 감속을 더했습니다. 메카넘 바퀴는 옆으로 이동할 수 있어 횡방향 속도로 복귀하지만, 차동 구동 로봇은 회전 명령으로 진행 방향을 바꾸어야 합니다. 제어기가 보내는 출력은 로봇이 실제로 할 수 있는 움직임이어야 합니다.</p>
    <div className="education-note"><p><strong>두 예시가 연결되는 방식</strong></p><p>경로 루프가 로봇의 이동 속도를 정하면, 각 바퀴의 속도 루프가 그 명령을 실제 회전으로 만듭니다. 바깥 루프는 경로 오차를, 안쪽 루프는 바퀴 속도 오차를 줄입니다. 서로 다른 목표와 측정값을 가진 feedback입니다.</p></div>
    <Check><p>카메라로 검은 테이프를 따라가는 로봇이라면 목표·측정값·오차·출력은 무엇일까요? 예를 들어 화면 중앙과 선의 중심 사이의 차이를 오차로 삼고 회전 명령을 바꿀 수 있습니다.</p></Check>
  </Chapter>
  <Chapter id="tuning" title="5. 적용할 때는 필요한 항부터 선택한다">
    <p>먼저 측정 단위와 부호를 확인합니다. 출력을 올렸을 때 측정값이 목표에 가까워져야 합니다. 그다음 P만으로 시작해 반응을 보고, 계속 남는 오차에는 I, 빠른 변화와 진동에는 D가 도움이 되는지 판단합니다. 한 번에 여러 값을 바꾸면 어떤 변화가 영향을 주었는지 알기 어렵습니다.</p>
    <p>출력에는 모터 전류·PWM·이동 속도의 한계가 있습니다. 최대 출력에 도달했다고 오차가 바로 없어지지는 않습니다. 적분이 계속 쌓이지 않게 제한하고, 측정값이 오래 갱신되지 않으면 명령을 유지해도 되는지 따로 판단해야 합니다.</p>
    <p>필요한 함수만 정리한 <a href="https://github.com/merosnurobotics/meroedu-control/tree/main/lessons/01-pid">교육용 코드</a>에서 encoder 속도 변환과 PID 계산을 확인할 수 있습니다. 원본의 하드웨어 설정을 그대로 복사하기보다, 내 로봇의 목표·측정·출력을 먼저 정해 연결하세요.</p>
  </Chapter>
  <footer className="education-sources"><h2>참고 자료와 코드의 출처</h2><p><a href="https://en.wikipedia.org/wiki/PID_controller">Wikipedia · PID controller</a> · <a href={`${source}/hardware/firmware/arduino_mecanum/mecanum_encoder_control.ino`}>ddonggae encoder firmware</a> · <a href={`${source}/navigation/street_nav.py`}>원본 경로 제어</a></p><p>원본 motor PI와 경로 P를 구분해 설명했습니다. 활용 예시는 적용할 값과 feedback 구조를 이해하는 데 집중합니다. <a href={`${a}/NOTICE.md`}>이미지 출처·라이선스</a></p></footer>
</Lesson>; }
