import { demosForLesson } from "@/lib/education/robot-demos";
import { DemoVideoPlayer } from "./demo-video-player";

export function LessonDemos({ path }: { path: string }) {
  const demos = demosForLesson(path);
  if (!demos.length) return null;
  return <section className="education-robot-demos" id="robot-demos" aria-label="실제 로봇 데모">
    <h2>실제 로봇에서는 어떻게 쓰일까요?</h2>
    {demos.map(({demo, focus}) => <figure className="education-robot-demo" key={demo.id}>
      <h3>{demo.title}</h3>
      <p className="education-demo-credit">{demo.publisher} · {demo.year}<br/>{demo.kind}</p>
      <DemoVideoPlayer youtubeId={demo.youtubeId} videoUrl={demo.videoUrl} title={demo.title}/>
      <figcaption>
        <p>{demo.description}</p>
        <p><strong>이 자료와 연결해서 볼 점</strong></p>
        <ul>{focus.map(point => <li key={point}>{point}</li>)}</ul>
        <p className="education-demo-links"><a href={demo.watchUrl} target="_blank" rel="noreferrer">{demo.youtubeId ? "YouTube에서 보기" : "원본 영상 열기"}</a><a href={demo.sourceUrl} target="_blank" rel="noreferrer">제작팀의 연구 설명</a></p>
      </figcaption>
    </figure>)}
  </section>;
}
