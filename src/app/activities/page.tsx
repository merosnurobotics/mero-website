import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { HistoryTimeline } from "@/components/history-timeline";
import { projects } from "@/lib/content";

export const metadata: Metadata = { title: "활동" };
export default function ActivitiesPage() {
  return <div className="container page-content">
    <Breadcrumbs items={[{ label: "활동" }]}/>
    <PageIntro title="우리의 실험은 계속됩니다." description="이번 학기의 프로젝트부터 함께 도전했던 순간까지, MERO의 활동을 만나보세요."/>
    <HistoryTimeline projects={projects}/>
    <section className="archive-extra"><h2>교류와 새로운 도전.</h2><div className="activity-hub-extras">
      <Link href="/activities/ri-opening"><div className="archive-extra-image"><Image src="/images/ri-opening.webp" alt="RI 개소식 로봇 소개 현장" fill sizes="200px" style={{ objectFit: "cover" }}/></div><div><h3>RI 개소식</h3></div><ArrowUpRight size={23}/></Link>
    </div></section>
  </div>;
}
