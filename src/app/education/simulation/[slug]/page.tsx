import { CartpoleTuner } from "@/components/education/cartpole-tuner";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared";
import { LessonContext, LessonNavigation } from "@/components/education/lesson-context";
import { SourceNotices } from "@/components/education/source-notices";
import { requireEducationMember } from "@/lib/education/access";
import { simulationLessons, simulationPath } from "@/lib/education/simulation-catalog";
import generated from "@/lib/education/generated/deepml.json";

type Props = { params: Promise<{ slug: string }> };
function getLesson(slug: string) { return simulationLessons.find(lesson => lesson.slug === slug); }
export function generateStaticParams() { return simulationLessons.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  return { title: lesson.title, description: lesson.description };
}
export default async function SimulationLessonPage({ params }: Props) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  await requireEducationMember(lesson.path);
  const chapters = generated[lesson.slug as keyof typeof generated];
  return <>
    <Breadcrumbs items={[{label:"교육",href:"/education"},{label:"로보틱스 · MuJoCo",href:simulationPath},{label:lesson.shortTitle}]}/>
    <article className="perception-lesson deepml-lesson">
      <header className="perception-hero"><p className="eyebrow">로보틱스 · 시뮬레이션</p><h1>{lesson.title}</h1><p>{lesson.description}</p></header>
      <LessonContext path={lesson.path}/>
      {chapters.map((chapter,index)=><section className="perception-chapter" id={chapter.id} key={chapter.id}><h2>{index+1}. {chapter.title}</h2><div className="deepml-content" data-am-theme="shadcn" data-am-mode="light" dangerouslySetInnerHTML={{__html:chapter.html}}/>{chapter.id === "cartpole" && <CartpoleTuner/>}</section>)}
      <footer className="education-sources"><h2>원문과 참고 자료</h2><p><a href="https://mujoco.readthedocs.io/en/stable/overview.html">MuJoCo 개요</a> · <a href="https://mujoco.readthedocs.io/en/stable/python.html">MuJoCo Python</a> · <a href="https://gymnasium.farama.org/introduction/basic_usage/">Gymnasium 입문</a></p>{lesson.slug === "robot-models" && <p>개념 참고: Kevin M. Lynch · Frank C. Park, <a href="https://modernrobotics.org/">Modern Robotics: Mechanics, Planning, and Control</a> (2017), 2·3·4·6·11장. 관련 개념을 MERO의 예제로 설명했습니다. 본문·교재 그림의 번역 복제본이 아니며, 계산 예제에 사용한 NxRLab 코드의 MIT 라이선스는 아래에 보존합니다.</p>}<SourceNotices sources={lesson.slug === "robot-models" ? ["ros2-docs","mujoco","modernrobotics"] : lesson.slug === "rl-environments" ? ["gymnasium","mujoco"] : ["mujoco"]}/></footer>
    </article><LessonNavigation path={lesson.path}/>
  </>;
}
