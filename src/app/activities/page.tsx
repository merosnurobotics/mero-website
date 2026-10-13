import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PhotoHero } from "@/components/shared";
import { HistoryTimeline } from "@/components/history-timeline";
import { projects } from "@/lib/content";

export const metadata: Metadata = { title: "활동" };
export default function ActivitiesPage() {
  return <>
    <PhotoHero title="우리의 실험은 계속됩니다." description="이번 학기의 프로젝트부터 함께 도전했던 순간까지, MERO의 활동을 만나보세요." image="/images/challenge-arena.webp" alt="AI 로봇챌린지 경기장에서 로봇이 공을 옮기는 모습" position="center 55%" breadcrumbs={[{ label: "활동" }]}/>
    <div className="container page-content">
      <HistoryTimeline projects={projects}/>
      <section className="archive-extra"><h2>교류와 새로운 도전.</h2><div className="activity-hub-extras">
        <Link href="/activities/ri-opening"><div className="archive-extra-image"><Image src="/images/ri-opening.webp" alt="RI 개소식 로봇 소개 현장" fill sizes="(max-width: 560px) 100vw, 480px" style={{ objectFit: "cover" }}/></div><div><h3>RI 개소식</h3><p>직접 만든 로봇을 소개하고 시연한 현장.</p></div></Link>
      </div></section>
    </div>
  </>;
}
