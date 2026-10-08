import { requireEducationMember } from "@/lib/education/access";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { ArrowUpRight } from "@/components/icons";
import { educationCurriculum, educationLearningPaths } from "@/lib/education/curriculum";

export const metadata: Metadata = { title: "교육" };
export default async function EducationPage() {
  await requireEducationMember("/education");
  return <>
    <Breadcrumbs items={[{ label: "교육" }]}/>
    <div className="education-intro"><p className="eyebrow">MERO EDUCATION</p><h1>센서에서 판단으로,<br/>판단에서 움직임으로.</h1><p>로봇은 주변을 측정하고, 다음 움직임을 정하고, 실제 결과를 다시 확인합니다. 공통 기초를 읽은 뒤 만들고 싶은 로봇에 맞는 경로를 고릅니다. 모든 하드웨어 실습을 순서대로 끝낼 필요는 없습니다.</p></div>
    <div className="education-reading-intro"><h2>공통 입문에서 프로젝트로</h2><p>좌표·시간·배열·피드백을 이해한 뒤 담당할 과제로 갈라집니다. 교육에서는 입력과 행동의 의미, 움직임의 물리, 학습과 평가를 익힙니다. 과제별 장치 연결과 정책 제작은 프로젝트에서 진행합니다. 좌표계 보충은 ROS 설치 없이 읽을 수 있습니다.</p></div>
    <section className="education-series-list" aria-label="권장 학습 경로">{educationLearningPaths.map((route,index)=><details className="education-series-row education-route" key={route.title}><summary><span className="education-series-number">{index === 0 ? "공통" : String(index).padStart(2,"0")}</span><h2>{route.title}</h2><span className="education-stage-count">{route.steps.length}단계</span></summary><div className="education-stage-content"><p>{route.description}</p><ol className="education-reading-links">{route.steps.map(step=><li key={step.path}><Link href={step.path}>{step.label}<ArrowUpRight size={15}/></Link></li>)}</ol></div></details>)}</section>
    <details className="education-reference-order"><summary>전체 자료 참고 순서</summary><p>분야를 모두 살펴볼 때 쓸 수 있는 순서입니다. 각 프로젝트의 필수 선수 과정은 위 경로와 자료별 선행 링크를 확인하세요.</p>
    <section className="education-series-list" aria-label="교육자료 읽는 순서">
      {educationCurriculum.map((stage,index) => <details key={stage.title} className="education-series-row education-stage">
        <summary><span className="education-series-number">{String(index+1).padStart(2,"0")}</span><h2>{stage.title}</h2><span className="education-stage-count">{stage.lessons.length}개 자료</span></summary>
        <div className="education-stage-content"><p>{stage.description}</p><ol className="education-reading-links">{stage.lessons.map(lesson => <li key={lesson.path}><Link href={lesson.path}>{lesson.shortTitle}<ArrowUpRight size={15}/></Link></li>)}</ol></div>
      </details>)}
    </section>
    </details>
  </>;
}
