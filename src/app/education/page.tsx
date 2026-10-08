import { requireEducationMember } from "@/lib/education/access";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { ArrowUpRight } from "@/components/icons";
import { educationCurriculum } from "@/lib/education/curriculum";

export const metadata: Metadata = { title: "교육" };
export default async function EducationPage() {
  await requireEducationMember("/education");
  return <>
    <Breadcrumbs items={[{ label: "교육" }]}/>
    <div className="education-intro"><p className="eyebrow">MERO EDUCATION</p><h1>센서에서 판단으로,<br/>판단에서 움직임으로.</h1><p>로봇은 주변을 측정하고, 다음 움직임을 정하고, 실제 결과를 다시 확인합니다. 아래 자료를 순서대로 읽으며 이 흐름을 구성하는 기술을 익힙니다.</p></div>
    <div className="education-reading-intro"><h2>교육자료 읽는 순서</h2><p>제어와 통신부터 시작해 DeepML에서 학습의 기본 개념을 익힌 뒤, 인식·위치 추정·강화학습으로 이어집니다. 코드 실습에서는 Python의 변수·함수·리스트를 사용합니다.</p></div>
    <section className="education-series-list" aria-label="교육자료 읽는 순서">
      {educationCurriculum.map((stage,index) => <details key={stage.title} className="education-series-row education-stage">
        <summary><span className="education-series-number">{String(index+1).padStart(2,"0")}</span><h2>{stage.title}</h2><span className="education-stage-count">{stage.lessons.length}개 자료</span></summary>
        <div className="education-stage-content"><p>{stage.description}</p><ol className="education-reading-links">{stage.lessons.map(lesson => <li key={lesson.path}><Link href={lesson.path}>{lesson.shortTitle}<ArrowUpRight size={15}/></Link></li>)}</ol></div>
      </details>)}
    </section>
  </>;
}
