import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PhotoHero } from "@/components/shared";
import { HistoryTimeline } from "@/components/history-timeline";
import { getProjects } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "활동", "Activities") }; }
export default async function ActivitiesPage() {
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  return <>
    <PhotoHero title={t("우리의 실험은 계속됩니다.", "Our experiments keep going.")} description={t("이번 학기의 프로젝트부터 함께 도전했던 순간까지, MERO의 활동을 만나보세요.", "From this semester's projects to the challenges we took on together, explore what MERO has been up to.")} image="/images/challenge-arena.webp" alt={t("AI 로봇챌린지 경기장에서 로봇이 공을 옮기는 모습", "A robot carrying a ball in the AI Robot Challenge arena")} position="center 55%" breadcrumbs={[{ label: t("활동", "Activities") }]}/>
    <div className="container page-content">
      <HistoryTimeline projects={getProjects(locale)}/>
      <section className="archive-extra"><h2>{t("교류와 새로운 도전.", "Exchanges and new challenges.")}</h2><div className="activity-hub-extras">
        <Link href="/activities/ri-opening"><div className="archive-extra-image"><Image src="/images/ri-opening.webp" alt={t("RI 개소식 로봇 소개 현장", "Introducing our robots at the RI opening ceremony")} fill sizes="(max-width: 560px) 100vw, 480px" style={{ objectFit: "cover" }}/></div><div><h3>{t("RI 개소식", "RI Opening Ceremony")}</h3><p>{t("직접 만든 로봇을 소개하고 시연한 현장.", "Where we introduced and demonstrated robots we built ourselves.")}</p></div></Link>
      </div></section>
    </div>
  </>;
}
