import Link from "next/link";
import { educationReadingOrder, lessonConnection } from "@/lib/education/curriculum";

export function LessonContext({ path }: { path: string }) {
  const connection = lessonConnection(path);
  if (!connection) return null;
  return <aside className="education-connection" aria-label="다른 자료와의 연결"><p>{connection}</p></aside>;
}

export function LessonNavigation({ path }: { path: string }) {
  const index = educationReadingOrder.findIndex(lesson => lesson.path === path);
  if (index < 0) return null;
  const previous = educationReadingOrder[index - 1];
  const next = educationReadingOrder[index + 1];
  return <nav className="education-reading-nav" aria-label="교육자료 읽는 순서">
    <Link href={previous?.path || "/education"}><span>{previous ? "이전 자료" : "전체 자료"}</span>{previous?.shortTitle || "교육자료 목록"}</Link>
    <Link href={next?.path || "/education"}><span>{next ? "다음 자료" : "전체 자료"}</span>{next?.shortTitle || "교육자료 목록"}</Link>
  </nav>;
}
