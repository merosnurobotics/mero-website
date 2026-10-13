import { requireEducationMember } from "@/lib/education/access";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { ArrowRight } from "@/components/icons";
import { educationTopics } from "@/lib/education/catalog";
import { levelLabel, localizeTopic } from "@/lib/education/i18n";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function EducationTopicContent({ topic }: { topic: typeof educationTopics[number] }) {
  await requireEducationMember(topic.path);
  const locale = await getLocale(); const copy = localizeTopic(topic, locale);
  return <>
    <Breadcrumbs items={[{ label: tr(locale, "교육", "Education"), href: "/education" }, { label: copy.title }]}/>
    <div className="education-intro"><h1>{copy.title}</h1><p>{copy.description}</p><p className="education-series-meta">{tr(locale, `${topic.lessons.length}개 자료 · 입문 → 기초 → 응용`, `${topic.lessons.length} lessons · Intro → Foundations → Applied`)}</p></div>
    {topic.lessons.map((lesson, index) => <article className="education-course" key={lesson.path}>
      <p className="education-course-number">{String("number" in lesson ? lesson.number : index + 1).padStart(2, "0")}. {lesson.shortTitle}</p>
      <p className="concept-meta"><span>{levelLabel(lesson.level, locale)}</span>{lesson.minutes && <span>{tr(locale, `약 ${lesson.minutes}분`, `About ${lesson.minutes} min`)}</span>}</p>
      <h2><Link href={lesson.path}>{lesson.title}</Link></h2><p>{lesson.description}</p><Link className="button" href={lesson.path}>{tr(locale, "자료 읽기", "Read lesson")}<ArrowRight size={18}/></Link>
      <ol className="education-chapter-preview">{lesson.chapters.map(chapter => <li key={chapter.id}><Link href={`${lesson.path}#${chapter.id}`}>{chapter.label}</Link></li>)}</ol>
    </article>)}
  </>;
}
