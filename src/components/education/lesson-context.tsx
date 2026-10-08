import Link from "next/link";
import { educationReadingOrder, lessonConnection, lessonPreparation, educationLearningPaths } from "@/lib/education/curriculum";

export function LessonContext({ path }: { path: string }) {
  const connection = lessonConnection(path);
  const preparation=lessonPreparation(path);
  if (!connection || !preparation) return null;
  return <aside className="education-connection" aria-label="학습 목표와 선행 자료">
    <p className="education-format">{preparation.kind}</p><p>{connection}</p>
    <details className="education-preparation"><summary>학습 목표 · 선수지식 · 실행 환경</summary>
      <ul>{preparation.goals.map(goal=><li key={goal}>{goal}</li>)}</ul>
      <p>선행 자료: {preparation.prerequisites.length ? preparation.prerequisites.map((item,index)=><span key={item.path}>{index>0 && " · "}<Link href={item.path}>{item.label}</Link></span>) : "별도 실습 선수 과정 없음 · 로컬 실행부터 시작"}</p>
      <p>{preparation.environment}</p>
    </details>
  </aside>;
}

export function LessonNavigation({ path }: { path: string }) {
  const index = educationReadingOrder.findIndex(lesson => lesson.path === path);
  if (index < 0) return null;
  const previous = educationReadingOrder[index - 1];
  const next = educationReadingOrder[index + 1];
  const routes=educationLearningPaths.slice(1).flatMap(route=>{
    const position=route.steps.findIndex(step=>step.path.split("#")[0]===path);
    return position>=0 && route.steps[position+1] ? [{title:route.title,next:route.steps[position+1]}] : [];
  });
  return <><div className="education-route-next">{routes.map(route=><p key={route.title}>{route.title} 경로의 다음 단계: <Link href={route.next.path}>{route.next.label}</Link></p>)}<Link href="/education">학습 경로 선택으로 돌아가기</Link></div>
  <nav className="education-reading-nav" aria-label="교육자료 읽는 순서">
    <Link href={previous?.path || "/education"}><span>{previous ? "참고 순서 · 이전 자료" : "전체 자료"}</span>{previous?.shortTitle || "교육자료 목록"}</Link>
    <Link href={next?.path || "/education"}><span>{next ? "참고 순서 · 다음 자료" : "전체 자료"}</span>{next?.shortTitle || "교육자료 목록"}</Link>
  </nav></>;
}
