import { educationTopics } from "@/lib/education/catalog";

export function LessonAuthor({ path }: { path: string }) {
  const author = educationTopics.flatMap((topic) => topic.lessons).find((lesson) => lesson.path === path)?.author;
  if (!author) return null;
  return <div className="education-author" aria-label="작성자 정보"><span>작성자 <strong>{author.name}</strong></span><a href={`mailto:${author.email}`}>{author.email}</a></div>;
}
