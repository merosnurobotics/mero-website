import { requireEducationMember } from "@/lib/education/access";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { ArrowUpRight } from "@/components/icons";
import { educationTopics } from "@/lib/education/catalog";
import { educationCurriculum, educationLearningPaths } from "@/lib/education/curriculum";
import { localizeRoute, localizeTopic } from "@/lib/education/i18n";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "교육", "Education") }; }
export default async function EducationPage() {
  await requireEducationMember("/education");
  const locale = await getLocale(); const en = locale === "en"; const t = (ko: string, english: string) => tr(locale, ko, english);
  return <>
    <Breadcrumbs items={[{ label: t("교육", "Education") }]}/>
    {en
      ? <div className="education-intro"><p className="eyebrow">MERO Education</p><h1>From sensing to deciding,<br/>from deciding to moving.</h1><p>A robot measures its surroundings, decides its next move, and checks the actual result. Read the common foundations first, then pick the path that fits the robot you want to build. You don&apos;t need to finish every hardware lab in order.</p></div>
      : <div className="education-intro"><p className="eyebrow">MERO 교육</p><h1>센서에서 판단으로,<br/>판단에서 움직임으로.</h1><p>로봇은 주변을 측정하고, 다음 움직임을 정하고, 실제 결과를 다시 확인합니다. 공통 기초를 읽은 뒤 만들고 싶은 로봇에 맞는 경로를 고릅니다. 모든 하드웨어 실습을 순서대로 끝낼 필요는 없습니다.</p></div>}
    <nav className="education-topic-links" aria-label={t("분야별 교육자료", "Education by topic")}>{educationTopics.map(topic => <Link href={topic.path} key={topic.path}>{localizeTopic(topic, locale).title}<span>{en ? `${topic.lessons.length} lessons` : `${topic.lessons.length}편`}</span></Link>)}</nav>
    {en
      ? <div className="education-reading-intro"><h2>From common foundations to projects</h2><p>After understanding coordinates, time, arrays and feedback, you branch into the task you will take on. Education covers what inputs and actions mean, the physics of motion, and training and evaluation. Hardware setup and policy building for each task happen in the projects. The coordinate-frame supplement can be read without installing ROS.</p></div>
      : <div className="education-reading-intro"><h2>공통 입문에서 프로젝트로</h2><p>좌표·시간·배열·피드백을 이해한 뒤 담당할 과제로 갈라집니다. 교육에서는 입력과 행동의 의미, 움직임의 물리, 학습과 평가를 익힙니다. 과제별 장치 연결과 정책 제작은 프로젝트에서 진행합니다. 좌표계 보충은 ROS 설치 없이 읽을 수 있습니다.</p></div>}
    <section className="education-series-list" aria-label={t("권장 학습 경로", "Recommended learning paths")}>{educationLearningPaths.map(source => ({ source, route: localizeRoute(source, locale) })).map(({ source, route },index)=><details className="education-series-row education-route" key={source.title}><summary><span className="education-series-number">{index === 0 ? t("공통", "Core") : String(index).padStart(2,"0")}</span><h2>{route.title}</h2><span className="education-stage-count">{en ? `${route.steps.length} steps` : `${route.steps.length}단계`}</span></summary><div className="education-stage-content"><p>{route.description}</p><ol className="education-reading-links">{route.steps.map(step=><li key={step.path}><Link href={step.path}>{step.label}<ArrowUpRight size={15}/></Link></li>)}</ol></div></details>)}</section>
    <details className="education-reference-order"><summary>{t("전체 자료 참고 순서", "Full reading order")}</summary><p>{t("8개 분야에서 입문 → 기초 → 응용 순서로 읽습니다. 각 분야는 독립적으로 시작할 수 있습니다. 각 프로젝트의 필수 선수 과정은 위 경로와 자료별 선행 링크를 확인하세요.", "Across the 8 topics, read from intro → foundations → applied. Each topic can be started on its own. For each project's required prerequisites, check the paths above and the prerequisite links in each lesson.")}</p>
    <section className="education-series-list" aria-label={t("교육자료 읽는 순서", "Lesson reading order")}>
      {educationCurriculum.map((stage,index) => ({ stage, copy: localizeTopic({ ...stage, path: educationTopics[index].path }, locale) })).map(({ stage, copy },index) => <details key={stage.title} className="education-series-row education-stage">
        <summary><span className="education-series-number">{String(index+1).padStart(2,"0")}</span><h2>{copy.title}</h2><span className="education-stage-count">{en ? `${stage.lessons.length} lessons` : `${stage.lessons.length}개 자료`}</span></summary>
        <div className="education-stage-content"><p>{copy.description}</p><ol className="education-reading-links">{stage.lessons.map(lesson => <li key={lesson.path}><Link href={lesson.path}>{lesson.shortTitle}<ArrowUpRight size={15}/></Link></li>)}</ol></div>
      </details>)}
    </section>
    </details>
  </>;
}
