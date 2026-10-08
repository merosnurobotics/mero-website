"use client";

import { useCallback, useState } from "react";
import data from "@/lib/education/generated/cartpole.json";

type Run = typeof data.runs[number];
const axes = [
  { key: "kp", label: "P · 기울어짐을 되돌리는 힘", hint: "현재 각도에 반응합니다." },
  { key: "ki", label: "I · 누적된 기울어짐 보정", hint: "같은 방향으로 남는 오차를 누적합니다." },
  { key: "kd", label: "D · 회전 속도에 대한 반응", hint: "빠른 회전을 억제합니다." },
] as const;

function Result({ run, title, replay }: { run: Run; title: string; replay: number }) {
  const [loaded, setLoaded] = useState("");
  const token = `${run.id}-${replay}`;
  const imageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setLoaded(token);
  }, [token]);
  return <div className="cartpole-result">
    <header><h3>{title}</h3><span>P {run.kp} · I {run.ki} · D {run.kd}</span></header>
    <div className="cartpole-frame" aria-busy={loaded !== token}>
      <picture key={token}>
        <source media="(prefers-reduced-motion: reduce)" srcSet={run.still}/>
        {/* Actual precomputed frames; native picture also supports reduced motion. */}
        <img ref={imageRef} src={`${run.gif}?play=${replay}`} alt={`Cart-pole 실행 결과: P ${run.kp}, I ${run.ki}, D ${run.kd}`} width={640} height={424} onLoad={() => setLoaded(token)}/>
      </picture>
      {loaded !== token && <span className="cartpole-loading">결과 불러오는 중</span>}
    </div>
    <p className={`cartpole-outcome ${run.metrics.completed ? "is-complete" : "is-stopped"}`}>
      {run.metrics.completed ? "8초 동안 종료 기준 안에서 유지" : `${run.metrics.stop_s!.toFixed(2)}초에 종료 · ${run.metrics.stop_reason === "angle" ? "막대 기울기 초과" : "카트 이동 범위 초과"}`}
    </p>
    <dl className="cartpole-metrics">
      <div><dt>최대 기울기</dt><dd>{run.metrics.max_angle_deg.toFixed(1)}°</dd></div>
      <div><dt>최대 카트 이동</dt><dd>{run.metrics.max_cart_m.toFixed(2)} m</dd></div>
      <div><dt>마지막 2초 각도 RMS</dt><dd>{run.metrics.tail_angle_rms_deg === null ? "—" : `${run.metrics.tail_angle_rms_deg.toFixed(2)}°`}</dd></div>
    </dl>
  </div>;
}

export function CartpoleTuner() {
  const [indices, setIndices] = useState({ kp: 0, ki: 0, kd: 0 });
  const [reference, setReference] = useState("p24-i0-d4");
  const [replay, setReplay] = useState(0);
  const run = data.runs.find(item => axes.every(axis => item[axis.key] === data.values[axis.key][indices[axis.key]]))!;
  const saved = data.runs.find(item => item.id === reference)!;
  return <div className="cartpole-tuner">
    <div className="cartpole-controls">
      <p>슬라이더로 조합을 바꾸며 막대의 흔들림과 카트 이동을 함께 비교해 보세요. 같은 조건에서 미리 계산한 <strong>27개 조합</strong> 중 해당 결과를 재생합니다.</p>
      <div className="cartpole-sliders">{axes.map(axis => <div className="cartpole-slider" key={axis.key}>
        <label htmlFor={`cartpole-${axis.key}`}>{axis.label}<output>{run[axis.key]}</output></label>
        <input id={`cartpole-${axis.key}`} type="range" min={0} max={2} step={1} value={indices[axis.key]} aria-valuetext={String(run[axis.key])} onChange={event => { setIndices(previous => ({ ...previous, [axis.key]: Number(event.target.value) })); setReplay(value => value + 1); }}/>
        <div className="cartpole-ticks" aria-hidden="true">{data.values[axis.key].map(value => <span key={value}>{value}</span>)}</div>
        <p>{axis.hint}</p>
      </div>)}</div>
      <div className="cartpole-actions"><button type="button" onClick={() => { setReference(run.id); setReplay(value => value + 1); }}>현재 조합을 비교 기준으로</button><button type="button" onClick={() => setReplay(value => value + 1)}>처음부터 다시 보기</button></div>
      <p className="cartpole-selection" role="status">선택한 조합: P {run.kp} · I {run.ki} · D {run.kd}</p>
    </div>
    <div className="cartpole-comparison"><Result run={run} title="선택한 조합" replay={replay}/><Result run={saved} title="비교 기준" replay={replay}/></div>
    <p className="cartpole-footnote">RMS는 마지막 2초 동안 기울어진 정도를 모은 값입니다. 작을수록 위쪽 자세에 가까웠습니다. 중도 종료한 실행은 표시하지 않습니다. 종료 뒤 GIF는 마지막 상태에서 멈춰 있으며, 반복 재생 때 처음으로 돌아갑니다.</p>
  </div>;
}
