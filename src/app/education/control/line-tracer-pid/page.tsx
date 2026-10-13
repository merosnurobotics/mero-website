import type { Metadata } from "next";
import { Lesson, Chapter, Figure, Check } from "@/components/education/lesson-primitives";
import { CodeExample } from "@/components/education/code-example";
import { FlowDiagram } from "@/components/education/native-diagrams";
import { LineTracerTuner } from "@/components/education/line-tracer-tuner";
import data from "@/lib/education/generated/line-tracer.json";
export const metadata: Metadata = {title:"PID로 라인트레이서 제어하기"};
const a="/education-assets/control/line-tracer";
const run=(id:string)=>data.runs.find(item=>item.id===id)!.metrics;
const s=(value:number|null)=>value===null?"—":value.toFixed(2);
const mm=(value:number|null)=>value===null?"—":value.toFixed(1);
const [naive,state]=[data.bonus.naive.metrics,data.bonus.state.metrics];

function Animation({ gif, still, alt, caption }: { gif: string; still: string; alt: string; caption: string }) {
  return <figure><picture><source media="(prefers-reduced-motion: reduce)" srcSet={still}/><img src={gif} width={760} height={470} loading="lazy" alt={alt} style={{width:"100%",height:"auto",borderRadius:8}}/></picture><figcaption>{caption}</figcaption></figure>;
}

export default function LineTracerLesson() { return <Lesson topic="제어" topicPath="/education/control" path="/education/control/line-tracer-pid" title="PID로 라인트레이서 제어하기" intro="바닥의 흰 라인을 따라 달리는 로봇은 PID를 가장 직접 눈으로 확인할 수 있는 예제입니다. IR 센서 8개로 라인이 얼마나 옆에 있는지 숫자로 만들고, 그 오차로 좌우 바퀴 속도를 나눕니다. 같은 코스에서 미리 계산한 주행 GIF로 P·I·D를 하나씩 바꿔 보고, 마지막에 정지선 문제를 풀어 봅니다.">
  <Chapter id="setup" title="1. 로봇과 코스: 무엇을 제어하는가">
    <p>로봇은 양쪽에 DC 모터 2개, 뒤쪽에 방향이 자유로운 볼캐스터 1개로 움직입니다. 두 바퀴 속도가 같으면 직진하고, 오른쪽이 빠르면 왼쪽으로 돕니다. 이런 방식을 <strong>차동 구동</strong>이라고 합니다. 모터에는 엔코더가 없습니다. 바퀴가 실제로 얼마나 빨리 도는지 모른 채 PWM만 정해서 보냅니다.</p>
    <p>앞쪽 바닥에는 IR 반사 센서 8개가 12 mm 간격으로 일자로 붙어 있습니다. 검은 바닥은 빛을 적게, 흰 테이프는 많이 반사합니다. 우리가 측정하는 것은 바퀴 속도가 아니라 <strong>라인이 센서 줄의 가운데에서 옆으로 몇 mm 떨어져 있는가</strong>입니다.</p>
    <Figure src={`${a}/track-layout.png`} width={900} height={470} alt="흰 라인으로 그린 폐곡선 코스. 큰 곡선, S자 구간, 급한 곡선과 라인을 가로지르는 두 개의 정지선이 있다" caption="이 자료에서 사용하는 시뮬레이션 코스입니다. 반지름 300 mm 곡선, S자 구간, 반지름 180 mm 급한 곡선이 있고, 주행 라인을 가로지르는 짧은 가로선(Pause & Resume 라인) 두 개가 있습니다. 가로선은 마지막 보너스 문제에서 사용합니다."/>
    <div className="education-table-wrap"><table><thead><tr><th>PID 요소</th><th>라인트레이서에서</th></tr></thead><tbody>
      <tr><td>목표</td><td>라인이 센서 줄 가운데에 오도록 유지 (오차 0 mm)</td></tr>
      <tr><td>측정</td><td>IR 8개 값으로 계산한 라인 위치</td></tr>
      <tr><td>오차</td><td>라인 위치 − 0, 왼쪽이 + (mm)</td></tr>
      <tr><td>출력</td><td>좌우 PWM 차이 u. 왼쪽 = 기본 − u, 오른쪽 = 기본 + u</td></tr>
    </tbody></table></div>
    <div className="education-note"><p><strong>이 자료의 시뮬레이션은 교육용입니다</strong></p><p>Python으로 위에서 내려다본 2D 운동을 계산했습니다. 로봇에 바로 올리는 펌웨어는 아니지만, 실제 로봇에서 문제를 일으키는 요소를 넣었습니다. 모터 응답 지연 0.15 s, 센서→모터 지연 20 ms, PWM 불감대 20, <strong>오른쪽 모터가 12% 약한 좌우 차이</strong>, 그리고 <strong>가우시안 노이즈</strong>입니다. 노이즈는 IR 값 σ = 0.05, 바퀴 속도 σ = 0.01 m/s를 매 주기 더합니다. 제어 주기는 100 Hz입니다.</p></div>
  </Chapter>

  <Chapter id="sensors" title="2. IR 센서 8개로 라인 위치 읽기">
    <h3>보정: 센서마다 다른 값을 0~1로 맞춘다</h3>
    <p>같은 흰 테이프 위에서도 센서마다 읽는 값이 다릅니다. 높이, 부품 편차, 주변광 때문입니다. 시작 전에 로봇을 좌우로 쓸어 각 센서의 최소값(검정)과 최대값(흰색)을 기록하고, 측정값을 <code>w = (raw − min) / (max − min)</code>으로 0~1 사이에 맞춥니다. 흰 라인이면 1, 검은 바닥이면 0에 가깝습니다. 검은 라인을 쓰는 코스라면 <code>1 − w</code>로 뒤집습니다.</p>
    <h3>가중 평균으로 라인 위치를 계산한다</h3>
    <p>센서 8개의 위치를 가운데 기준으로 −42, −30, …, +30, +42 mm라고 두고, 각 센서 값 w를 가중치로 평균을 냅니다. 라인 폭이 30 mm이고 센서 간격이 12 mm이므로 보통 2~3개가 동시에 라인을 봅니다. 두 센서 사이에 라인이 있으면 두 값이 비슷하게 나와 평균이 사이 값이 됩니다. 센서가 8개뿐이어도 <strong>1 mm 단위의 연속적인 오차</strong>를 얻을 수 있는 이유입니다.</p>
    <Figure src={`${a}/sensor-array.png`} width={1040} height={420} alt="흰 라인이 가운데에서 왼쪽으로 10 mm 떨어져 있을 때 8개 센서의 위치와 읽은 값, 가중 평균 오차 계산" caption="라인이 왼쪽으로 10 mm 치우친 경우입니다. +6, +18 mm 센서가 1에 가깝고 −6 mm 센서는 라인 가장자리만 일부 봅니다. 가중 평균은 +9.2 mm로 실제 10 mm와 가깝고, +이므로 왼쪽으로 돌아야 합니다."/>
    <CodeExample label="센서 값 → 라인 오차 (mm)" code={`SENSOR_Y = [42, 30, 18, 6, -6, -18, -30, -42]   # mm, 왼쪽이 +
LOST_ERROR = 48                                   # 센서 줄 끝(42)보다 바깥

def line_error(raw, min_v, max_v, last_error):
    w = [max(0, min(1, (r - lo) / (hi - lo))) for r, lo, hi in zip(raw, min_v, max_v)]
    total = sum(w)
    if total < 0.5:                       # 아무 센서도 라인을 못 봄
        return LOST_ERROR if last_error > 0 else -LOST_ERROR
    return sum(wi * y for wi, y in zip(w, SENSOR_Y)) / total`}/>
    <h3>라인을 놓쳤을 때는 마지막 방향을 기억한다</h3>
    <p>급한 곡선에서 로봇이 바깥으로 밀리면 8개 센서 모두 검은 바닥을 볼 수 있습니다. 이때 가중 평균은 0/0이 되어 계산할 수 없습니다. 0으로 두면 로봇은 “가운데에 있다”고 착각하고 그대로 직진해 코스를 벗어납니다. 그래서 <strong>마지막으로 본 쪽의 끝보다 더 바깥 값(±48 mm)</strong>을 오차로 써서 그쪽으로 크게 돌게 합니다. 아래 GIF의 오차 그래프가 ±48에서 평평하게 잘린 구간이 바로 이 상태입니다.</p>
    <h3>노이즈는 평균에서 줄고 미분에서 커진다</h3>
    <p>센서 값마다 σ = 0.05의 가우시안 노이즈가 섞여도 여러 센서를 평균하면 오차의 흔들림은 1 mm 안팎으로 줄어듭니다. 하지만 D항은 오차의 차이를 0.01 s로 나눕니다. 0.5 mm만 튀어도 50 mm/s가 되므로, D 게인을 키우면 노이즈도 함께 커져 PWM이 떨립니다. 이 트레이드오프는 4장 튜닝 결과에서 직접 확인합니다.</p>
    <Check><p>센서 간격을 라인 폭보다 넓게 두면(예: 40 mm) 대부분 센서 1개만 라인을 보게 됩니다. 그러면 오차가 −42, −30, … 처럼 계단으로 바뀌고, 계단이 바뀌는 순간 D항이 크게 튑니다.</p></Check>
  </Chapter>

  <Chapter id="control" title="3. 오차를 좌우 바퀴 속도로 나누기">
    <FlowDiagram title="라인트레이서의 PID 루프 (100 Hz)" steps={[{title:"IR 8개 읽기",lines:["보정 후 0~1","라인 = 1"]},{title:"라인 오차 e",lines:["가중 평균 (mm)","놓치면 ±48"]},{title:"PID → u",lines:["Kp·e + Ki·Σe·dt","+ Kd·Δe/dt"]},{title:"좌우 PWM",lines:["왼쪽 = 기본 − u","오른쪽 = 기본 + u"]}]} feedback="로봇이 돌면 라인과 센서의 상대 위치가 바뀌고, 다음 주기에 다시 읽습니다." caption="목표: 오차 0 · 측정: 라인 위치 · 출력: 좌우 바퀴의 PWM 차이"/>
    <p>기본 PWM(이 자료에서는 170)으로 앞으로 가면서, PID 출력 u만큼 한쪽을 빼고 다른 쪽에 더합니다. 라인이 왼쪽(+)에 있으면 u가 +가 되어 오른쪽 바퀴가 빨라지고 로봇은 왼쪽으로 돕니다. 부호가 반대면 로봇은 라인에서 도망칩니다. 처음 연결할 때 손으로 로봇을 들고 라인을 왼쪽에 대 보며 오른쪽 바퀴가 빨라지는지 먼저 확인하세요.</p>
    <CodeExample label="100 Hz 제어 주기 한 번" code={`dt = 0.01
e = line_error(raw, min_v, max_v, last_error)

integral += e * dt
integral = clamp(integral, -60 / ki, 60 / ki)   # I항이 PWM 60을 넘지 않게 (windup 방지)
derivative = (e - last_error) / dt
last_error = e

u = kp * e + ki * integral + kd * derivative
left_pwm  = clamp(BASE_PWM - u, -255, 255)
right_pwm = clamp(BASE_PWM + u, -255, 255)`}/>
    <h3>세 항이 라인트레이서에서 하는 일</h3>
    <div className="education-table-wrap"><table><thead><tr><th>항</th><th>보는 것</th><th>라인트레이서에서의 효과</th><th>너무 크면</th></tr></thead><tbody>
      <tr><td>P (PWM/mm)</td><td>지금 몇 mm 벗어났나</td><td>멀리 벗어날수록 세게 돈다. 곡선을 따라갈 힘</td><td>라인을 지나쳐 좌우로 흔들림</td></tr>
      <tr><td>I (PWM/(mm·s))</td><td>한쪽으로 쌓인 오차</td><td>약한 모터처럼 계속 남는 치우침을 보정</td><td>곡선에서 쌓인 값이 직선에서 반대로 밀어냄</td></tr>
      <tr><td>D (PWM/(mm/s))</td><td>오차가 얼마나 빨리 변하나</td><td>라인으로 돌아오는 중에 미리 덜 돌게 해 흔들림을 줄임</td><td>센서 노이즈가 PWM 떨림으로</td></tr>
    </tbody></table></div>
    <h3>왜 라인트레이서에는 D가 특히 중요할까</h3>
    <p>PWM 차이 u는 라인 위치를 바로 바꾸지 않습니다. u는 <strong>회전 속도</strong>를 바꾸고, 회전이 쌓여 <strong>방향</strong>이 바뀌고, 방향으로 달려야 <strong>옆으로 이동</strong>합니다. 출력이 두 번 쌓여야 오차가 줄어드는 구조입니다. 그래서 P만 쓰면 오차가 0이 되는 순간에도 로봇은 이미 비스듬히 달리고 있어 반대편으로 넘어갑니다. 여기에 모터 응답 지연까지 더해지면 흔들림이 커집니다. D는 “오차가 빠르게 줄고 있다 = 라인 쪽으로 비스듬히 달리고 있다”를 알아채고 미리 반대로 조향합니다.</p>
    <h3>엔코더가 없어서 생기는 일</h3>
    <p>같은 PWM을 넣어도 두 모터의 속도는 다릅니다. 이 시뮬레이션에서는 오른쪽 모터가 12% 약해서, u = 0이면 로봇이 오른쪽으로 휩니다. P만으로는 “조금 벗어난 상태”에서 균형이 잡혀 오차가 남습니다. 바퀴 속도를 직접 재서 맞출 수 없으니, <strong>라인 오차 자체를 I로 누적해 그 차이를 보정</strong>합니다. 엔코더가 있다면 바퀴마다 속도 PID(안쪽 루프)를 두고, 라인 PID(바깥 루프)는 목표 속도를 정하는 이중 구조로 만들 수 있습니다.</p>
    <Check><p>기본 PWM을 올리면 같은 Kp에서도 더 흔들립니다. 같은 시간 동안 더 멀리 비스듬히 달리기 때문입니다. 속도를 올렸다면 Kd를 함께 키우거나 Kp를 줄이세요.</p></Check>
  </Chapter>

  <Chapter id="tuning" title="4. P·I·D를 바꾸며 결과 비교하기">
    <p>아래 결과는 모두 같은 코스, 같은 출발 위치, 같은 노이즈 시드로 계산했습니다. 한 바퀴를 돌거나, 센서 줄 가운데가 라인에서 120 mm 넘게 벗어나면(코스 이탈) 끝납니다. 이 화면의 로봇은 정지선에서 멈추지 않고 지나갑니다. 가로선을 지날 때 센서 8개가 모두 흰색이 되어도 가중 평균은 0 근처라 조향에 거의 영향이 없습니다.</p>
    <LineTracerTuner/>
    <h3>관찰 포인트</h3>
    <ol>
      <li><strong>P만 사용 (P 6 · I 0 · D 0)</strong>: 완주는 하지만 {s(run("p6-i0-d0").lap_s)}초가 걸리고, 시간의 {run("p6-i0-d0").line_lost_pct.toFixed(0)}% 동안 라인을 놓칩니다. 오차 그래프가 ±48까지 크게 출렁입니다. P를 16으로 키우면 더 세게 흔들리다 {s(run("p16-i0-d0").stop_s)}초에 이탈합니다. P가 2로 작아도 흔들림이 점점 커지다가 S자 구간에서 {s(run("p2-i0-d0").stop_s)}초에 이탈합니다. P만으로는 흔들림을 줄이는 힘(감쇠)이 없어서, 게인이 작든 크든 진동이 남습니다.</li>
      <li><strong>D 추가 (P 6 · D 0 → 0.15 → 0.5)</strong>: 평균 |오차|가 {mm(run("p6-i0-d0").mean_abs_error_mm)} → {mm(run("p6-i0-d0_15").mean_abs_error_mm)} → {mm(run("p6-i0-d0_5").mean_abs_error_mm)} mm로 줄고 랩 타임은 {s(run("p6-i0-d0_5").lap_s)}초가 됩니다. 라인트레이서에서 가장 효과가 큰 변화입니다. D가 충분하면 P 16도 완주합니다(평균 {mm(run("p16-i0-d0_5").mean_abs_error_mm)} mm). 다만 직선에서의 잔떨림(표준편차)이 P 6일 때 {mm(run("p6-i0-d0_5").straight_wobble_mm)} mm, P 16일 때 {mm(run("p16-i0-d0_5").straight_wobble_mm)} mm입니다. 큰 게인이 노이즈와 지연을 키운 결과입니다.</li>
      <li><strong>I로 치우침 제거 (P 6 · D 0.5 · I 0 → 4 → 20)</strong>: 왼쪽 긴 직선의 평균 치우침이 {mm(run("p6-i0-d0_5").straight_offset_mm)} → {mm(run("p6-i4-d0_5").straight_offset_mm)} → {mm(run("p6-i20-d0_5").straight_offset_mm)} mm로 바뀝니다. I가 약한 오른쪽 모터 몫을 대신 채워 줍니다. I 4에서 부호가 −로 넘어간 것은 앞 곡선에서 쌓인 적분이 직선에 들어와서도 남아 있기 때문입니다.</li>
      <li><strong>D 없이 I만 키우면 (P 6 · I 4 · D 0)</strong>: P만 썼을 때는 완주했는데 {s(run("p6-i4-d0").stop_s)}초에 이탈합니다. I는 오래된 오차를 더하므로 응답을 더 늦게 만듭니다. 이미 흔들리는 시스템에 I를 넣으면 더 불안정해집니다.</li>
    </ol>
    <h3>추천 튜닝 순서</h3>
    <ol>
      <li>모든 게인을 0으로 두고, 라인을 왼쪽에 댔을 때 오른쪽 바퀴가 빨라지는지(부호) 확인합니다.</li>
      <li>느린 기본 속도에서 P를 올려 곡선을 따라가기 시작하는 값을 찾습니다. 흔들림이 생겨도 괜찮습니다.</li>
      <li>흔들림이 줄어들 때까지 D를 올립니다. PWM이 떨리기 시작하면 한 단계 내립니다.</li>
      <li>직선에서 한쪽으로 치우친 채 달리면 I를 작게 넣습니다. 적분 제한을 꼭 같이 둡니다.</li>
      <li>기본 속도를 올리고 2~4를 반복합니다.</li>
    </ol>
    <p>게인 숫자 자체는 오차 단위(mm), 출력 범위(PWM 0~255), 모터·바퀴·무게에 따라 달라지므로 이 값을 실제 로봇에 그대로 옮길 수는 없습니다. 옮겨 가야 할 것은 <strong>각 항을 바꿨을 때 궤적과 오차 그래프가 어떻게 달라지는가</strong>입니다.</p>
  </Chapter>

  <Chapter id="bonus" title="5. 보너스 문제: Pause & Resume 라인">
    <p>코스 중간에 주행 라인을 가로지르는 짧은 흰 가로선이 있습니다. 로봇은 이 선을 만나면 <strong>7초 동안 멈춘 뒤 다시 출발</strong>해야 하고, 다음 가로선에서도 같은 동작을 반복해야 합니다. 라인 추종 PID는 그대로 두고, 무엇을 더해야 할지 생각해 봅시다.</p>
    <div className="education-note">
      <p><strong>문제 1.</strong> 센서 8개 값만으로 “지금 가로선 위에 있다”를 어떻게 알아낼 수 있을까요? 급한 곡선이나 노이즈 때문에 잘못 감지하지 않으려면 어떤 조건을 더해야 할까요?</p>
      <p><strong>문제 2.</strong> “가로선 감지 → 7초 정지 → 다시 PID 주행”만 구현하면 어떤 일이 생길까요? 아래 GIF를 보고 원인을 설명해 보세요.</p>
      <p><strong>문제 3.</strong> 엔코더가 없어 이동 거리를 모를 때, “가로선을 다 지나갔다”는 어떻게 판단할 수 있을까요?</p>
      <p><strong>문제 4.</strong> 7초 동안 멈춰 있다가 출발할 때 PID의 적분값과 이전 오차는 어떻게 처리해야 할까요?</p>
    </div>
    <Animation gif={data.bonus.naive.gif} still={data.bonus.naive.still} alt="가로선에서 멈춘 로봇이 7초 뒤 출발하자마자 같은 가로선에서 다시 멈추는 시뮬레이션" caption={`단순 구현의 결과입니다. ${naive.pauses_s.map(v=>v.toFixed(2)).join("초, ")}초에 모두 첫 번째 가로선에서 멈췄습니다. 7초 정지 구간은 4배 빠르게 재생합니다.`}/>
    <details className="education-preparation">
      <summary>힌트 보기</summary>
      <ul>
        <li>주행 라인(폭 30 mm)은 12 mm 간격 센서 중 많아야 3개를 덮습니다. 가로선은 8개를 한꺼번에 덮습니다.</li>
        <li>로봇은 감지한 순간 바로 서지 않습니다. 브레이크를 걸어도 조금 밀립니다. 이 시뮬레이션에서는 이 속도에서 센서가 아직 가로선 위에 남아 있는 상태로 멈춥니다.</li>
        <li>“지금 흰색이 많다”는 상태와 “흰색이 많아지기 시작했다”는 사건은 다릅니다.</li>
      </ul>
    </details>
    <details className="education-preparation">
      <summary>풀이 보기</summary>
      <p><strong>1. 감지 조건</strong>: 보정값 0.5를 넘는 센서가 <strong>6개 이상</strong>인 상태가 <strong>2번 연속</strong>(20 ms) 이어지면 가로선으로 판단합니다. 개수 기준은 곡선의 오감지를 막고, 연속 조건은 한 번 튄 노이즈를 막습니다.</p>
      <p><strong>2. 단순 구현의 문제</strong>: 로봇이 가로선 위에서 멈추므로, 7초 뒤 FOLLOW로 돌아가는 순간 센서는 여전히 흰색 8개를 봅니다. 같은 선을 “새 가로선”으로 다시 감지해 또 7초를 멈춥니다. 출발할 때마다 몇 mm씩만 나가니 같은 자리에서 여러 번 멈춥니다. 더 빠른 속도에서는 우연히 선을 지나쳐 멈춰서 문제가 안 보일 수 있습니다. 속도에 따라 되기도 하고 안 되기도 하는 코드는 버그입니다.</p>
      <p><strong>3. 상태를 나눈다</strong>: 정지가 끝나면 바로 FOLLOW로 가지 않고 RESUME 상태를 거칩니다. RESUME에서는 가로선 감지를 끄고 기본 PWM으로 똑바로 나아갑니다. 흰 센서가 3개 이하인 상태가 5번 연속 나오면, 즉 <strong>센서가 가로선을 벗어난 것을 확인하면</strong> FOLLOW로 돌아갑니다. 거리를 몰라도 센서로 “지나갔다”를 판단할 수 있습니다. 시간만으로 무시 구간을 두면 배터리 전압이나 부하가 바뀔 때 거리가 달라집니다.</p>
      <p><strong>4. 정지 중 PID 초기화</strong>: PAUSE에 들어갈 때 적분값을 0으로 비우고, 출발 후 첫 주기의 D는 0으로 둡니다. 멈춰 있는 동안 적분이 쌓이거나 7초 전 오차로 미분을 계산하면 출발하자마자 한쪽으로 튑니다. 또 7초는 <code>sleep(7)</code>처럼 프로그램을 멈추지 말고 시작 시각과 비교해 세야 합니다. 그래야 기다리는 동안에도 센서를 읽고 정지 명령을 계속 보낼 수 있습니다.</p>
      <FlowDiagram title="Pause & Resume 상태 머신" steps={[{title:"FOLLOW",lines:["라인 PID 주행","흰 센서 ≥ 6이 2회 연속 → PAUSE"]},{title:"PAUSE",lines:["PWM 0 + 브레이크","적분·이전 오차 초기화","7초 경과 → RESUME"]},{title:"RESUME",lines:["가로선 감지 끔, 직진","흰 센서 ≤ 3이 5회 연속 → FOLLOW"]}]} feedback="FOLLOW로 돌아가면 다음 가로선에서 같은 과정을 반복합니다." caption="‘가로선 위에 있다’는 상태가 아니라 ‘가로선에 새로 들어왔다’는 사건에만 정지합니다."/>
      <CodeExample label="상태 머신 (100 Hz 루프 안)" code={`white = sum(1 for wi in w if wi > 0.5)

if state == "FOLLOW":
    streak = streak + 1 if white >= 6 else 0
    if streak >= 2:
        state, t0 = "PAUSE", now
        integral, first_after_pause = 0.0, True
elif state == "PAUSE" and now - t0 >= 7.0:
    state, clear = "RESUME", 0
elif state == "RESUME":
    clear = clear + 1 if white <= 3 else 0
    if clear >= 5:
        state, streak = "FOLLOW", 0

if state == "PAUSE":
    left_pwm = right_pwm = 0          # 브레이크
elif state == "RESUME":
    left_pwm = right_pwm = BASE_PWM   # 가로선을 똑바로 통과
else:
    left_pwm, right_pwm = pid_step(e, first_after_pause)
    first_after_pause = False`}/>
      <Animation gif={data.bonus.state.gif} still={data.bonus.state.still} alt="상태 머신을 적용한 로봇이 두 가로선에서 각각 한 번씩 7초 멈추고 한 바퀴를 돈 뒤 첫 가로선에서 다시 멈추는 시뮬레이션" caption={`상태 머신을 적용한 결과입니다. ${state.pauses_s.map(v=>v.toFixed(2)).join("초, ")}초에 첫 번째 → 두 번째 → 다시 첫 번째 가로선 순서로 한 번씩만 멈춥니다. 단순 구현과 같은 게인(P ${data.pause_gains[0]} · I ${data.pause_gains[1]} · D ${data.pause_gains[2]})과 같은 기본 PWM ${data.pause_base_pwm}으로 계산했습니다.`}/>
    </details>
    <Check><p>더 생각해 보기: 정지 시점을 센서가 아니라 바퀴(축) 위치로 맞추고 싶다면, 센서 줄이 축보다 90 mm 앞에 있다는 점을 어떻게 이용할 수 있을까요? 엔코더가 없을 때와 있을 때의 방법을 비교해 보세요.</p></Check>
  </Chapter>
  <footer className="education-sources"><h2>시뮬레이션 정보</h2><p>모든 GIF와 그림은 <code>scripts/render-line-tracer-tuning.py</code>로 직접 계산·렌더링했습니다(NumPy·SciPy·Pillow, 2D 운동학 모델, 100 Hz 제어, 2 ms 적분). 실행 조건과 파일 해시는 <a href={`${a}/manifest.json`}>manifest.json</a>에 있습니다. 실제 로봇의 관성·미끄러짐·센서 높이 변화는 단순화했습니다.</p></footer>
</Lesson>; }
