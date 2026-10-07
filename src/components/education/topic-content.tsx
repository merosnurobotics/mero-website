import { requireEducationMember } from "@/lib/education/access";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { ArrowRight } from "@/components/icons";
import { educationTopics } from "@/lib/education/catalog";

export async function EducationTopicContent({ topic }: { topic: typeof educationTopics[number] }) {
  await requireEducationMember(topic.path);
  return <>
    <Breadcrumbs items={[{ label: "교육", href: "/education" }, { label: topic.title }]}/>
    <div className="education-intro"><h1>{topic.title}</h1><p>{topic.description}</p></div>
    {topic.lessons.map((lesson, index) => <article className="education-course" key={lesson.path}>
      <p className="education-course-number">{String(index + 1).padStart(2, "0")}. {lesson.shortTitle}</p>
      <h2><Link href={lesson.path}>{lesson.title}</Link></h2><p>{lesson.description}</p><Link className="button" href={lesson.path}>자료 읽기<ArrowRight size={18}/></Link>
      <ol className="education-chapter-preview">{lesson.chapters.map(chapter => <li key={chapter.id}><Link href={`${lesson.path}#${chapter.id}`}>{chapter.label}</Link></li>)}</ol>
    </article>)}
  </>;
}
