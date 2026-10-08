import { LessonAuthor } from "@/components/education/lesson-author";
import { requireEducationMember } from "@/lib/education/access";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared";
import { LessonInteractions } from "@/components/education/lesson-interactions";
import { kimodoLessonHtml } from "@/lib/education/kimodo-lesson";
import { kimodoTopicPath } from "@/lib/education/catalog";
import { LessonContext, LessonNavigation } from "@/components/education/lesson-context";
import { ExecutionResult } from "@/components/education/execution-result";

const validation = kimodoLessonHtml.match(/<section id="validation" class="chapter wrap">([\s\S]*?)<\/section>/);
if (!validation || validation.index === undefined) throw new Error("The authored lesson is missing its validation section.");
const beforeValidation = kimodoLessonHtml.slice(0, validation.index);
const validationBody = validation[1];
const afterValidation = kimodoLessonHtml.slice(validation.index + validation[0].length);

export const metadata: Metadata = {
  title: "Kimodo + MuJoCo Warp 모방 강화학습",
  description: "Microban 한 발 서기로 배우는 모방 강화학습. Kimodo 모션 생성, 리타기팅, PPO 학습과 실제 시뮬레이션 검증을 코드와 영상으로 살펴봅니다.",
};
export default async function KimodoLessonPage() {
  await requireEducationMember("/education/reinforcement-learning/kimodo-mjwarp");
  return <>
    <Breadcrumbs items={[{ label: "교육", href: "/education" }, { label: "강화학습", href: kimodoTopicPath }, { label: "모방 강화학습" }]}/>
    <LessonAuthor path="/education/reinforcement-learning/kimodo-mjwarp"/>
    <p className="education-repo-link"><a href="https://github.com/merosnurobotics/meroedu-rl">실습 저장소 · meroedu-rl</a><span>첫 회차 실행 안내와 코드</span></p>
    <LessonContext path="/education/reinforcement-learning/kimodo-mjwarp"/>
    <article id="kimodo-lesson" className="education-lesson">
      <div dangerouslySetInnerHTML={{ __html: beforeValidation }}/>
      <section id="validation" className="chapter wrap">
        <div dangerouslySetInnerHTML={{ __html: validationBody }}/>
        <h3>CPU에서 정책 재실행</h3>
        <p>저장된 정책을 Native MuJoCo에서 18초간 실행했습니다. 초기 상태는 하나이며(시드 75501), 외력 없이 한 발 서기를 유지합니다.</p>
        <div className="education-execution-triptych">
          <ExecutionResult id="microban-0001" alt="0.02초 시점의 Microban 양발 지지 자세">0.02초 · 양발 지지</ExecutionResult>
          <ExecutionResult id="microban-0225" alt="4.50초 시점의 Microban 왼발 지지 자세">4.50초 · 오른발 높이 19.27 mm</ExecutionResult>
          <ExecutionResult id="microban-0675" alt="13.50초 시점의 Microban 왼발 지지 자세">13.50초 · 오른발 높이 19.04 mm</ExecutionResult>
        </div>
        <ExecutionResult id="microban-trace" alt="18초 동안의 오른발 지면 간격과 몸통 기울기">50 Hz · 900스텝 · 초기 상태 1개</ExecutionResult>
        <ExecutionResult id="microban-terminal" alt="정책 재실행의 설정과 시점별 측정값"/>
      </section>
      <div dangerouslySetInnerHTML={{ __html: afterValidation }}/>
    </article>
    <LessonNavigation path="/education/reinforcement-learning/kimodo-mjwarp"/>
    <LessonInteractions/>
  </>;
}
