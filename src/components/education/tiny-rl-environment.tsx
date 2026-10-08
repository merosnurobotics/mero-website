"use client";
import { useState } from "react";
export function TinyRLEnvironment() {
  const [position,setPosition]=useState(2);
  const [rewards,setRewards]=useState<number[]>([]);
  const [gamma,setGamma]=useState(.9);
  const terminated=position===0 || position===4;
  const truncated=rewards.length>=8 && !terminated;
  const finished=terminated || truncated;
  function move(direction:number) {
    if(finished)return;
    const next=position+direction;
    setPosition(next);setRewards(previous=>[...previous,next===4 ? 5 : next===0 ? -2 : -.1]);
  }
  return <div className="tiny-rl-environment">
    <p>왼쪽·오른쪽 행동을 선택하고 지금 보상과 누적 보상을 구분해 보세요.</p>
    <ol className="tiny-rl-cells" aria-label="환경의 다섯 칸">{[0,1,2,3,4].map(cell=><li key={cell} aria-current={cell===position ? "location" : undefined}><span>{cell}</span><strong>{cell===position ? "●" : cell===0 ? "−2" : cell===4 ? "+5" : "·"}</strong></li>)}</ol>
    <div className="cartpole-actions"><button type="button" disabled={finished} onClick={()=>move(-1)}>← 왼쪽</button><button type="button" disabled={finished} onClick={()=>move(1)}>오른쪽 →</button><button type="button" onClick={()=>{setPosition(2);setRewards([]);}}>초기화</button></div>
    <p role="status">{terminated ? `실제 종료 · ${position===4 ? "목표 도착" : "실패 칸 도착"}` : truncated ? "외부 시간 제한 · 마지막 상태의 가치는 별도로 연결" : `${rewards.length}/8회 이동 · 현재 칸 ${position}`}</p>
    <label htmlFor="tiny-rl-discount">할인율 {gamma.toFixed(1)}</label><input id="tiny-rl-discount" type="range" min={0} max={1} step={.1} value={gamma} onChange={event=>setGamma(Number(event.target.value))}/>
    <p>보상열: <code>{rewards.length ? rewards.join(", ") : "아직 행동 없음"}</code></p>
    <p>관찰한 구간의 할인 누적 보상: <strong>{rewards.reduce((sum,reward,index)=>sum+gamma**index*reward,0).toFixed(3)}</strong></p>
    <p className="cartpole-footnote">슬라이더는 이미 얻은 보상에 곱할 비중을 바꿉니다. 이 화면은 행동과 계산을 경험하는 환경이며 정책을 학습시키지는 않습니다. 시간 제한 때의 미래 가치도 이 표시 값에는 포함하지 않습니다.</p>
  </div>;
}
