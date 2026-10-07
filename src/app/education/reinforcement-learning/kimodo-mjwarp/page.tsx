import { requireEducationMember } from "@/lib/education/access";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shared";
import { LessonInteractions } from "@/components/education/lesson-interactions";
import { kimodoLessonHtml } from "@/lib/education/kimodo-lesson";
import { reinforcementLearningPath } from "@/lib/education/catalog";

export const metadata: Metadata = {
  title: "Kimodo + MuJoCo Warp 모방 강화학습",
  description: "Microban 한 발 서기로 배우는 모방 강화학습. Kimodo 모션 생성, 리타기팅, PPO 학습과 실제 시뮬레이션 검증을 코드와 영상으로 살펴봅니다.",
};
export default async function KimodoLessonPage() {
  await requireEducationMember("/education/reinforcement-learning/kimodo-mjwarp");
  return <>
    <Breadcrumbs items={[{ label: "교육", href: "/education" }, { label: "강화학습", href: reinforcementLearningPath }, { label: "모방 강화학습" }]}/>
    <p className="education-repo-link"><a href="https://github.com/merosnurobotics/meroedu-rl">실습 저장소 · meroedu-rl</a><span>첫 회차 실행 안내와 코드</span></p>
    <article id="kimodo-lesson" className="education-lesson" dangerouslySetInnerHTML={{ __html: kimodoLessonHtml }}/>
    <LessonInteractions/>
  </>;
}
