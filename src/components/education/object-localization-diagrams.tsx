function PixelGrid({ depth }: { depth: boolean }) {
  return <svg viewBox="0 0 374 352" role="img" aria-label={depth ? "같은 픽셀의 depth: 배경 3.5 m, 객체 1.5 m, 무효 픽셀 하나" : "원본 픽셀 좌표에 놓인 객체 mask와 하단 대표 픽셀"}>
    {Array.from({length:13},(_,v)=>Array.from({length:17},(_,u)=>{
      const inside=u>=9&&u<=13&&v>=6&&v<=10;
      const missing=depth&&u===11&&v===10;
      return <rect key={`${u}-${v}`} x={17+u*20} y={30+v*20} width="19" height="19" fill={missing?"var(--text)":inside?"var(--accent)":"var(--surface)"} stroke="var(--line)" opacity={inside&&!missing?.8:1}/>;
    }))}
    <text x="17" y="18" className="native-axis">u → 오른쪽</text>
    <text x="17" y="311" className="native-axis">v ↓ 아래</text>
    {!depth && <><circle cx="247" cy="240" r="7" fill="none" stroke="var(--text)" strokeWidth="2"/><text x="185" y="338" className="native-label">대표 픽셀 (11, 10)</text></>}
    {depth && <><text x="18" y="338" className="native-label">객체 1.5 m · 배경 3.5 m · 무효 0</text></>}
  </svg>;
}
export function MaskDepthDiagram() { return <figure className="education-native-figure"><div className="education-native-heading">Mask와 depth는 같은 픽셀을 가리켜야 합니다</div><div className="education-native-plots"><div><h3>객체의 instance mask</h3><PixelGrid depth={false}/></div><div><h3>RGB에 aligned된 depth</h3><PixelGrid depth/></div></div><figcaption>17 × 13 합성 예제의 픽셀 도식입니다. 강조한 mask 안에서 depth를 읽고, 0인 무효값과 mask 밖 배경을 제외합니다. 실제 사진이나 모델 예측이 아닙니다.</figcaption></figure>; }
export function ObjectMapDiagram() {
  const px=(x:number)=>40+(x+2)*80;
  const py=(y:number)=>360-(y+2)*80;
  const rx=px(.5),ry=py(-.5),ox=px(.55625),oy=py(1.12948);
  return <figure className="education-native-figure"><div className="education-native-heading">로봇이 바라보는 앞쪽을 지도 방향으로 회전합니다</div><svg viewBox="0 0 400 430" role="img" aria-label="지도에서 로봇은 0.5, -0.5에 있고 위쪽으로 90도 회전한 상태; 객체 관측점은 0.556, 1.129에 있음" style={{maxWidth:440,display:"block",marginInline:"auto"}}>
    {[-2,-1,0,1,2].map(n=><g key={n}><line x1={px(n)} y1="40" x2={px(n)} y2="360" stroke="var(--line)"/><line x1="40" y1={py(n)} x2="360" y2={py(n)} stroke="var(--line)"/><text x={px(n)} y="386" textAnchor="middle" className="native-axis">{n}</text><text x="22" y={py(n)+5} textAnchor="middle" className="native-axis">{n}</text></g>)}
    <rect x="40" y="40" width="320" height="320" fill="none" stroke="var(--text)"/>
    <line x1={rx} y1={ry} x2={ox} y2={oy} stroke="var(--accent)" strokeDasharray="6 4" strokeWidth="2"/>
    <circle cx={rx} cy={ry} r="6" fill="var(--text)"/><line x1={rx} y1={ry} x2={rx} y2={ry-35} stroke="var(--text)" strokeWidth="3"/><path d={`M${rx-5},${ry-28} L${rx},${ry-35} L${rx+5},${ry-28}`} fill="none" stroke="var(--text)" strokeWidth="2"/>
    <text x={rx-12} y={ry+24} textAnchor="end" className="native-label">로봇 (0.5, −0.5)</text><text x={rx-12} y={ry-24} textAnchor="end" className="native-axis">yaw 90°</text>
    <circle cx={ox} cy={oy} r="6" fill="var(--accent)"/><text x={ox} y={oy-17} textAnchor="middle" className="native-label">객체 (0.556, 1.129)</text>
    <text x="200" y="411" textAnchor="middle" className="native-axis">지도 x [m] → / 지도 y [m] ↑</text>
  </svg><figcaption>합성 코드 결과의 지도 x/y입니다. 카메라에서 본 상대좌표를 로봇의 촬영 당시 yaw로 회전한 뒤 지도 위치를 더합니다. 점은 객체의 보이는 하단 표면을 대표하며 객체 중심이나 ground truth가 아닙니다.</figcaption></figure>;
}
