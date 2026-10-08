import { TinyRLEnvironment } from "@/components/education/tiny-rl-environment";
import { FoundationChapter } from "@/components/education/foundation-chapter";
import { SourceNotices } from "@/components/education/source-notices";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/shared";
import { LessonContext, LessonNavigation } from "@/components/education/lesson-context";
import { requireEducationMember } from "@/lib/education/access";
import { deepMLLessons, deepMLPath } from "@/lib/education/deepml-catalog";
import generated from "@/lib/education/generated/deepml.json";
import license from "@/lib/education/generated/spinningup-license.json";

type Props = { params: Promise<{ slug: string }> };
function getLesson(slug: string) { return deepMLLessons.find(lesson => lesson.slug === slug); }
export function generateStaticParams() { return deepMLLessons.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  return { title: lesson.title, description: lesson.description };
}

export default async function DeepMLLessonPage({ params }: Props) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();
  await requireEducationMember(lesson.path);
  const chapters = generated[lesson.slug as keyof typeof generated];
  const isRL = ["reinforcement-learning", "policy-and-robot"].includes(lesson.slug);
  return <>
    <Breadcrumbs items={[{ label: "교육", href: "/education" }, { label: isRL ? "강화학습" : "DeepML", href: isRL ? "/education/reinforcement-learning" : deepMLPath }, { label: lesson.shortTitle }]}/>
    <article className="perception-lesson deepml-lesson">
      <header className="perception-hero"><p className="eyebrow">{isRL ? "강화학습" : "DeepML"} · {String(deepMLLessons.indexOf(lesson) + 1 - (isRL ? 3 : 0)).padStart(2, "0")}</p><h1>{lesson.title}</h1><p>{lesson.description}</p></header>
      <LessonContext path={lesson.path}/>
      {lesson.slug === "data-and-models" && <FoundationChapter id="arrays"/>}
      {chapters.map((chapter, index) => <section className="perception-chapter" id={chapter.id} key={chapter.id}>
        <h2>{index + 1}. {chapter.title}</h2>
        {lesson.slug === "neural-networks" && chapter.id === "loss" && <picture className="deepml-network-animation"><source media="(prefers-reduced-motion: reduce)" srcSet="/education-assets/deepml/neural-network.png"/><img src="/education-assets/deepml/neural-network.gif" width="960" height="540" loading="lazy" alt="신경망의 순전파·역전파·가중치 수정 흐름"/></picture>}
        <div className="deepml-content" data-am-theme="shadcn" data-am-mode="light" dangerouslySetInnerHTML={{ __html: chapter.html }}/>
        {chapter.id === "tiny-environment" && <TinyRLEnvironment/>}
      </section>)}
      <footer className="education-sources">
        <h2>원문과 참고 자료</h2>
        {isRL ? <>
          <p>OpenAI Spinning Up과 Hugging Face Deep RL Course의 입문 개념을 선별 번역·편집하고, MERO의 로봇 사례를 더했습니다.</p>
          <p><a href="https://spinningup.openai.com/en/latest/spinningup/rl_intro.html">RL 핵심 개념</a> · <a href="https://spinningup.openai.com/en/latest/spinningup/rl_intro2.html">RL 알고리즘의 구분</a> · <a href="https://spinningup.openai.com/en/latest/algorithms/ppo.html">PPO 원문</a></p>
          <p><a href="https://huggingface.co/learn/deep-rl-course/en/unit1/rl-framework">Hugging Face · 강화학습 과정</a></p>
          {lesson.slug === "reinforcement-learning" && <p>에이전트·환경 그림: <a href="https://gymnasium.farama.org/introduction/basic_usage/">Gymnasium</a> · OpenAI / Farama Foundation · MIT · 원본 유지.</p>}
          <SourceNotices sources={lesson.slug === "reinforcement-learning" ? ["huggingface","gymnasium"] : ["huggingface"]}/>
          <details className="education-recipe"><summary>저작권과 번역 범위</summary><p>원문: OpenAI · 한국어 번역·편집: MERO. 수학적 증명과 고급 알고리즘 설명을 덜어낸 입문 자료이며 원문 전체 번역은 아닙니다. 원문 버전: <code>{license.upstream.slice(0, 7)}</code>.</p><pre className="deepml-license">{license.license}</pre></details>
        </> : <>
          <p>MERO의 딥러닝 입문 보충 자료입니다. 객체인식과 센서 예제로 학습·평가의 기본 흐름을 설명합니다.</p>
          <p><a href="https://docs.pytorch.org/tutorials/beginner/basics/intro.html">PyTorch 공식 입문</a> · <a href="https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html">손실과 파라미터 수정</a></p>
        </>}
        {lesson.slug === "neural-networks" && <><p>신경망 시각화: MERO 제작 · <a href="https://github.com/helblazer811/ManimML">ManimML</a> 사용.</p><SourceNotices sources={["manimml"]}/></>}
      </footer>
    </article>
    <LessonNavigation path={lesson.path}/>
  </>;
}
