import type { ReactNode } from "react";

export function FlowDiagram({ title, steps, note, caption, feedback }: { title: string; steps: { title:string; lines:string[] }[]; note?: string; caption:ReactNode; feedback?:string }) {
  return <figure className="education-native-figure"><div className="education-native-heading">{title}</div><ol className="education-native-flow">{steps.map((step,i)=><li key={step.title}><span className="education-native-step">{String(i+1).padStart(2,"0")}</span><strong>{step.title}</strong>{step.lines.map(line=><span key={line}>{line}</span>)}</li>)}</ol>{feedback && <p className="education-native-feedback">↶ {feedback}</p>}{note && <p className="education-native-note">{note}</p>}<figcaption>{caption}</figcaption></figure>;
}

function wallRange(x:number,y:number,angle:number) {
  const c=Math.cos(angle),s=Math.sin(angle),values:number[]=[];
  if(Math.abs(c)>1e-9) values.push(((c>0?2:-2)-x)/c);
  if(Math.abs(s)>1e-9) values.push(((s>0?2:-2)-y)/s);
  return Math.min(...values);
}
const pose={x:.63,y:-.47,yaw:.35};
const beams=Array.from({length:24},(_,i)=>{const angle=i*Math.PI*2/24;return {angle,range:wallRange(pose.x,pose.y,pose.yaw+angle)};});
function score(x:number,y:number) {
  const residuals=beams.map(b=>Math.min(Math.abs(b.range-wallRange(x,y,pose.yaw+b.angle)),.35)).sort((a,b)=>a-b);
  return residuals.slice(0,17).reduce((a,b)=>a+b,0)/17;
}
function Room({kind}:{kind:"rays"|"wrong"|"score"|"symmetry"}) {
  const coord=(n:number)=>40+(n+2)/4*320;
  const cy=(n:number)=>360-(n+2)/4*320;
  return <svg viewBox="0 0 400 415" role="img" aria-label={kind==="rays"?"로봇에서 벽으로 뻗는 LiDAR 광선":kind==="wrong"?"잘못된 위치에서 지도 벽에 맞지 않는 scan 점":kind==="score"?"고정 방향에서 x y 후보의 거리 오차 점수 지도":"정사각 방의 네 대칭 위치와 방향"}>
    {kind==="score" && Array.from({length:32},(_,j)=>Array.from({length:32},(_,i)=>{
      const x=-2+(i+.5)/8,y=-2+(j+.5)/8;
      const weight=Math.round((1-score(x,y)/.35)*90+6);
      return <rect key={`${i}-${j}`} x={40+i*10} y={350-j*10} width={10.2} height={10.2} style={{fill:`color-mix(in srgb, var(--accent) ${weight}%, var(--surface))`}}/>;
    }))}
    <rect x="40" y="40" width="320" height="320" fill="none" stroke="var(--text)" strokeWidth="3"/>
    {[-2,0,2].map(n=><g key={n}><text x={coord(n)} y="386" textAnchor="middle" className="native-axis">{n}</text><text x="20" y={cy(n)+5} textAnchor="middle" className="native-axis">{n}</text></g>)}
    <text x="200" y="408" textAnchor="middle" className="native-axis">지도 x [m]</text>
    {kind==="rays" && beams.map((b,i)=><line key={i} x1={coord(pose.x)} y1={cy(pose.y)} x2={coord(pose.x+b.range*Math.cos(pose.yaw+b.angle))} y2={cy(pose.y+b.range*Math.sin(pose.yaw+b.angle))} stroke="var(--accent)" strokeWidth="1.5" opacity=".6"/>)}
    {kind==="wrong" && beams.map((b,i)=><circle key={i} cx={coord(-.1+b.range*Math.cos(pose.yaw+b.angle))} cy={cy(.25+b.range*Math.sin(pose.yaw+b.angle))} r="3" fill="var(--accent)"/>)}
    {kind!=="symmetry" && <circle cx={coord(kind==="wrong"?-.1:pose.x)} cy={cy(kind==="wrong"?.25:pose.y)} r="5" fill="var(--text)"/>}
    {kind==="symmetry" && [pose,{x:-pose.y,y:pose.x,yaw:pose.yaw+Math.PI/2},{x:-pose.x,y:-pose.y,yaw:pose.yaw+Math.PI},{x:pose.y,y:-pose.x,yaw:pose.yaw+3*Math.PI/2}].map((p,i)=><g key={i}><circle cx={coord(p.x)} cy={cy(p.y)} r="5" fill="var(--accent)"/><line x1={coord(p.x)} y1={cy(p.y)} x2={coord(p.x+.42*Math.cos(p.yaw))} y2={cy(p.y+.42*Math.sin(p.yaw))} stroke="var(--accent)" strokeWidth="3"/><text x={coord(p.x)-12} y={cy(p.y)-15} className="native-label">{['A','B','C','D'][i]}</text></g>)}
  </svg>;
}
export function LidarDiagram({ kind }: {kind:"scan"|"score"|"symmetry"}) {
  return <figure className="education-native-figure"><div className="education-native-heading">{kind==="scan"?"같은 scan, 다른 위치 가정":kind==="score"?"방향을 고정하고 위치 후보 비교하기":"정사각형의 90° 대칭"}</div>{kind==="scan"?<div className="education-native-plots"><div><p>벽까지 거리 측정</p><Room kind="rays"/></div><div><p>위치 가정이 틀리면</p><Room kind="wrong"/></div></div>:<div className="education-native-room"><Room kind={kind}/></div>}
  <figcaption>{kind==="scan"?"왼쪽은 각 광선의 거리, 오른쪽은 잘못된 위치에서 좌표로 바꾼 점입니다. 같은 측정도 위치 가정이 틀리면 벽과 맞지 않습니다. 설명용 합성 scan입니다.":kind==="score"?"강조색이 뚜렷할수록 예상 거리와 측정 거리가 잘 맞습니다. 작은 점은 합성 scan을 만든 정답 위치입니다. 실제 센서의 정확도 측정이 아닙니다.":"A·B·C·D는 같은 벽 거리 scan을 설명할 수 있는 네 위치·방향입니다. 선은 정면 방향입니다. 초기 방향이나 비대칭 landmark처럼 추가 정보가 필요합니다."}</figcaption></figure>;
}

