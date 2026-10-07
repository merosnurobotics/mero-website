import { requireEducationMember } from "@/lib/education/access";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared";
import { ArrowUpRight } from "@/components/icons";
import { educationTopics } from "@/lib/education/catalog";

export const metadata: Metadata = { title: "교육" };
export default async function EducationPage() {
  await requireEducationMember("/education");
  return <>
    <Breadcrumbs items={[{ label: "교육" }]}/>
    <div className="education-intro"><p className="eyebrow">MERO EDUCATION</p><h1>교육</h1><p>로봇을 만들고 움직이는 데 필요한 지식을 시리즈로 배웁니다.</p></div>
    <section className="education-series-list" aria-label="교육 시리즈">
      {educationTopics.map((topic,index) => <Link key={topic.path} href={topic.path} className="education-series-row"><span className="education-series-number">{String(index+1).padStart(2,"0")}</span><div><h2>{topic.title}</h2><p>{topic.description}</p><span className="education-series-meta">첫 번째 자료 · {topic.lessons[0].shortTitle}</span></div><ArrowUpRight size={24}/></Link>)}
    </section>
  </>;
}
