import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { requireEducationMember } from "@/lib/education/access";
import { educationTopics } from "@/lib/education/catalog";
import type { ConceptLesson } from "@/lib/education/concepts/types";
import { LessonNavigation } from "./lesson-context";
import { ConceptReferenceImages, ConceptVisual } from "./concept-visuals";

export async function ConceptLessonContent({ lesson, topicSlug }: { lesson: ConceptLesson; topicSlug: string }) {
  const topicPath = `/education/${topicSlug}`;
  const path = `${topicPath}/${lesson.slug}`;
  await requireEducationMember(path);
  const topic = educationTopics.find(item => item.path === topicPath)!;
  const allLessons = educationTopics.flatMap(item => item.lessons);
  const number = topic.lessons.findIndex(item => item.path === path) + 1;
  return <>
    <Breadcrumbs items={[{ label: "교육", href: "/education" }, { label: topic.title, href: topicPath }, { label: lesson.shortTitle }]}/>
    <article className="perception-lesson concept-lesson">
      <header className="perception-hero">
        <p className="eyebrow">{topic.title} · {String(number).padStart(2, "0")}</p>
        <h1>{lesson.title}</h1><p>{lesson.description}</p>
        <p className="concept-meta"><span>{lesson.level}</span><span>약 {lesson.minutes}분</span><span>한국어 개념 해설</span></p>
      </header>
      <aside className="education-connection" aria-label="학습 목표와 선행 자료">
        <p className="education-format">이 자료를 읽고 설명할 수 있는 것</p>
        <ul>{lesson.goals.map(goal => <li key={goal}>{goal}</li>)}</ul>
        <p>먼저 읽으면 좋은 자료: {lesson.prerequisites.length ? lesson.prerequisites.map((prerequisite, index) => <span key={prerequisite}>{index > 0 && " · "}<Link href={prerequisite}>{allLessons.find(item => item.path === prerequisite.split("#")[0])?.shortTitle || "기초 개념"}</Link></span>) : "별도 선수 자료 없이 시작할 수 있습니다."}</p>
      </aside>
      {lesson.sections.map((section, index) => <section className="perception-chapter" id={section.id} key={section.id}>
        <h2>{index + 1}. {section.title}</h2>
        {section.summary && <p className="concept-section-summary">{section.summary}</p>}
        <ConceptReferenceImages path={path} sectionId={section.id}/>
        {section.paragraphs[0] && <p>{section.paragraphs[0]}</p>}
        <ConceptVisual path={path} sectionId={section.id}/>
        {section.paragraphs.slice(1).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        {section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
        {section.comparison && <div className="education-table-wrap" tabIndex={0} role="region" aria-label={`${section.title} 비교표`}><table>
          <caption>{section.title} 비교</caption>
          <thead><tr>{section.comparison.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
          <tbody>{section.comparison.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
        </table></div>}
      </section>)}
      <section className="perception-chapter" id="worked-example">
        <h2>로봇 사례 · {lesson.example.title}</h2><p>{lesson.example.situation}</p>
        <ol className="education-process">{lesson.example.walkthrough.map((step, i) => <li key={i}>{step}</li>)}</ol>
        <aside className="education-note"><p>{lesson.example.takeaway}</p></aside>
      </section>
      <section className="perception-chapter" id="misconceptions"><h2>자주 하는 오해</h2>
        {lesson.misconceptions.map(item => <div key={item.claim}><h3>{item.claim}</h3><p>{item.correction}</p></div>)}
      </section>
      <section className="perception-chapter" id="self-check"><h2>이해 확인</h2><p>먼저 자신의 말로 설명한 뒤 해설을 펼쳐 보세요.</p>
        {lesson.questions.map((question, i) => <details className="education-check" key={question.prompt}><summary>{i + 1}. {question.prompt}</summary><p>{question.answer}</p></details>)}
      </section>
      <footer className="education-sources" id="sources"><h2>원문과 참고 자료</h2>
        <p>공식 문서와 연구 자료의 핵심 용어를 한국어로 풀고, MERO의 로봇 사례와 해설을 더했습니다. 각 링크에서 원문의 정의와 적용 범위를 함께 확인할 수 있습니다.</p>
        <ul>{lesson.sources.map(source => <li key={source.url}><a href={source.url}>{source.title}</a><p>{source.note}</p></li>)}</ul>
        <p>자료 검토: <time dateTime={lesson.updatedAt}>{lesson.updatedAt}</time> · 사례의 수치와 상황은 별도 표시가 없으면 개념을 설명하기 위한 예시입니다.</p>
      </footer>
    </article><LessonNavigation path={path}/>
  </>;
}
