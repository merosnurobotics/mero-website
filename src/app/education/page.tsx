import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { ArrowUpRight } from "@/components/icons";
import { reinforcementLearningPath, objectRecognitionPath } from "@/lib/education/catalog";

export const metadata: Metadata = { title: "교육" };
export default function EducationPage() {
  return <>
    <Breadcrumbs items={[{ label: "교육" }]}/>
    <div className="education-intro"><p className="eyebrow">MERO EDUCATION</p><h1>교육</h1><p>로봇을 만들고 움직이는 데 필요한 지식을 시리즈로 배웁니다.</p></div>
    <section className="education-series-list" aria-label="교육 시리즈">
      <Link href={reinforcementLearningPath} className="education-series-row"><span className="education-series-number">01</span><div><h2>강화학습</h2><p>모션 생성부터 로봇 제어 정책의 학습과 검증까지.</p><span className="education-series-meta">첫 번째 자료 · Kimodo + MuJoCo Warp</span></div><ArrowUpRight size={24}/></Link>
      <Link href={objectRecognitionPath} className="education-series-row"><span className="education-series-number">02</span><div><h2>객체인식</h2><p>사진 대신 직접 만든 데이터로, 형태와 과일을 찾는 모델을 학습합니다.</p><span className="education-series-meta">첫 번째 자료 · 합성 데이터로 시작하기</span></div><ArrowUpRight size={24}/></Link>
    </section>
  </>;
}
