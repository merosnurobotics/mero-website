"use client";

import { useCallback, useState } from "react";
import data from "@/lib/education/generated/line-tracer.json";

type Run = typeof data.runs[number];
const axes = [
  { key: "kp", label: "P · 지금 벗어난 거리", hint: "오차 1 mm당 PWM 차이입니다." },
  { key: "ki", label: "I · 한쪽으로 쌓인 치우침", hint: "같은 방향 오차가 남으면 커집니다." },
  { key: "kd", label: "D · 오차가 바뀌는 속도", hint: "흔들림이 커지기 전에 제동합니다." },
] as const;
const mm = (value: number | null) => value === null ? "—" : `${value.toFixed(1)} mm`;

function Result({ run, title, replay }: { run: Run; title: string; replay: number }) {
  const [loaded, setLoaded] = useState("");
  const token = `${run.id}-${replay}`;
  const imageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setLoaded(token);
  }, [token]);
  return <div className="cartpole-result">
    <header><h3>{title}</h3><span>P {run.kp} · I {run.ki} · D {run.kd}</span></header>
    <div className="cartpole-frame" style={{ aspectRatio: "760 / 470" }} aria-busy={loaded !== token}>
      <picture key={token}>
        <source media="(prefers-reduced-motion: reduce)" srcSet={run.still}/>
        <img ref={imageRef} src={`${run.gif}?play=${replay}`} alt={`라인트레이서 주행 결과: P ${run.kp}, I ${run.ki}, D ${run.kd}`} width={760} height={470} onLoad={() => setLoaded(token)}/>
      </picture>
      {loaded !== token && <span className="cartpole-loading">결과 불러오는 중</span>}
    </div>
    <p className={`cartpole-outcome ${run.metrics.completed ? "is-complete" : "is-stopped"}`}>
      {run.metrics.completed ? `한 바퀴 완주 · ${run.metrics.lap_s!.toFixed(2)}초` : `${run.metrics.stop_s!.toFixed(2)}초에 코스 이탈`}
    </p>
    <dl className="cartpole-metrics">
      <div><dt>평균 |오차|</dt><dd>{mm(run.metrics.mean_abs_error_mm)}</dd></div>
      <div><dt>긴 직선 평균 치우침</dt><dd>{run.metrics.completed ? mm(run.metrics.straight_offset_mm) : "—"}</dd></div>
      <div><dt>라인을 놓친 시간</dt><dd>{run.metrics.line_lost_pct.toFixed(0)}%</dd></div>
    </dl>
  </div>;
}

export function LineTracerTuner() {
  const [indices, setIndices] = useState({ kp: 1, ki: 0, kd: 0 });
  const [reference, setReference] = useState("p6-i4-d0_5");
  const [replay, setReplay] = useState(0);
  const run = data.runs.find(item => axes.every(axis => item[axis.key] === data.values[axis.key][indices[axis.key]]))!;
  const saved = data.runs.find(item => item.id === reference)!;
  return <div className="cartpole-tuner">
    <div className="cartpole-controls">
      <p>슬라이더로 조합을 바꾸며 궤적의 흔들림, 오차 그래프, 완주 여부를 비교해 보세요. 같은 코스·같은 노이즈 시드로 미리 계산한 <strong>27개 조합</strong> 중 해당 결과를 재생합니다.</p>
      <div className="cartpole-sliders">{axes.map(axis => <div className="cartpole-slider" key={axis.key}>
        <label htmlFor={`line-tracer-${axis.key}`}>{axis.label}<output>{run[axis.key]}</output></label>
        <input id={`line-tracer-${axis.key}`} type="range" min={0} max={2} step={1} value={indices[axis.key]} aria-valuetext={String(run[axis.key])} onChange={event => { setIndices(previous => ({ ...previous, [axis.key]: Number(event.target.value) })); setReplay(value => value + 1); }}/>
        <div className="cartpole-ticks" aria-hidden="true">{data.values[axis.key].map(value => <span key={value}>{value}</span>)}</div>
        <p>{axis.hint}</p>
      </div>)}</div>
      <div className="cartpole-actions"><button type="button" onClick={() => { setReference(run.id); setReplay(value => value + 1); }}>현재 조합을 비교 기준으로</button><button type="button" onClick={() => setReplay(value => value + 1)}>처음부터 다시 보기</button></div>
      <p className="cartpole-selection" role="status">선택한 조합: P {run.kp} · I {run.ki} · D {run.kd}</p>
    </div>
    <div className="cartpole-comparison"><Result run={run} title="선택한 조합" replay={replay}/><Result run={saved} title="비교 기준" replay={replay}/></div>
    <p className="cartpole-footnote">긴 직선 평균 치우침은 정지선이 없는 왼쪽 세로 직선에서 잰 오차의 평균입니다. 0에 가까울수록 오른쪽 모터가 약한 영향을 잘 보정한 것입니다. 이 화면의 주행은 정지선을 멈추지 않고 지나갑니다. 정지 처리는 보너스 문제에서 다룹니다. 움직임 줄이기 설정에서는 마지막 프레임과 전체 궤적을 보여 줍니다.</p>
  </div>;
}
