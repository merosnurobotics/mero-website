import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper, PlayCircle } from "@/components/icons";
import { ExternalLink, PhotoHero } from "@/components/shared";
import { Gallery } from "@/components/gallery";
import { VideoEmbed } from "@/components/video-embed";
import { club } from "@/lib/content";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

const names: Record<string, Record<Locale, string>> = { "ai-robot-challenge": { ko: "AI 로봇챌린지", en: "AI Robot Challenge" }, "ri-opening": { ko: "RI 개소식", en: "RI Opening Ceremony" } };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const locale = await getLocale(); return { title: names[(await params).slug]?.[locale] || tr(locale, "활동", "Activities") }; }
export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!names[slug]) notFound();
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en); const name = names[slug][locale];
  const challenge = slug === "ai-robot-challenge";
  const photos = challenge ? [ { src: "/images/challenge-team.webp", alt: t("AI 로봇챌린지 경기 준비 현장", "Getting ready for a match at the AI Robot Challenge") }, { src: "/images/challenge-arena.webp", alt: t("AI 로봇챌린지 경기장과 로봇", "The AI Robot Challenge arena and robot") }, { src: "/images/challenge-robot.webp", alt: t("AI 로봇챌린지에 사용한 로봇", "The robot we used at the AI Robot Challenge") } ] : [ { src: "/images/ri-opening.webp", alt: t("RI 개소식에서 로봇을 소개하는 현장", "Introducing our robot at the RI opening ceremony") }, { src: "/images/ri-demo.webp", alt: t("RI Open Lab의 로봇 시연", "Robot demo at the RI Open Lab") } ];
  return <>
    <PhotoHero title={name} label={challenge ? t("2026-1학기 활동", "2026-1 semester activity") : t("활동 사진 아카이브", "Activity photo archive")} description={challenge ? t("팀으로 만들고, 현장에서 검증하며 쌓은 경험.", "Experience gained by building as a team and testing it in the arena.") : t("우리가 만든 로봇과 실험을 더 많은 사람들과 나눴습니다.", "We shared the robots and experiments we built with a wider audience.")} image={challenge ? "/images/challenge-cover.webp" : "/images/ri-opening.webp"} alt={challenge ? t("AI 로봇챌린지에서 기념사진을 찍는 MERO 회원들", "MERO members posing for a group photo at the AI Robot Challenge") : t("RI 개소식의 MERO 로봇 소개 현장", "MERO introducing its robots at the RI opening ceremony")} position="center 60%" breadcrumbs={[{ label: t("활동", "Activities"), href: "/activities" }, { label: name }]}/>
    <div className="container page-content">
    <section className="article-layout"><article><h2>{challenge ? t("만들고, 도전하고, 함께 배운 시간.", "Building, competing and learning together.") : t("우리의 로봇을 소개하다.", "Introducing our robots.")}</h2><p>{challenge ? t("지난 2026-1학기, MERO는 AI 로봇챌린지 활동을 진행했습니다. 로봇을 준비하고 현장에서 시험하는 과정에서 팀으로 문제를 해결하는 경험을 쌓았습니다.", "Last semester (2026-1), MERO took part in the AI Robot Challenge. Preparing the robot and testing it on site, we gained experience solving problems as a team.") : t("RI 개소식에서 로봇을 소개하고 시연하는 모습을 기록했습니다. 직접 만든 로봇을 매개로 우리의 활동과 실험을 나눈 현장입니다.", "These photos capture us introducing and demonstrating our robots at the RI opening ceremony, where we shared our activities and experiments through robots we built ourselves.")}</p><p>{challenge ? t("당시의 현장 사진과 스케치 영상, 관련 기사를 함께 남깁니다. 이 경험은 이번 학기 사족보행, 휴머노이드와 manipulation 프로젝트의 다음 도전으로 이어집니다.", "Here are photos from the event, a highlight video and a related news article. That experience carries into this semester's next challenges: our quadruped, humanoid and manipulation projects.") : t("아래 활동사진을 선택하면 큰 화면으로 볼 수 있습니다.", "Select a photo below to view it larger.")}</p></article><aside className="article-aside"><h3>{challenge ? t("영상과 기사", "Video and article") : t("함께 보기", "See also")}</h3>{challenge ? <><ExternalLink href={club.youtube}><PlayCircle size={18}/>{t("AI 로봇챌린지 스케치", "AI Robot Challenge highlights")}</ExternalLink><ExternalLink href={club.article}><Newspaper size={18}/>{t("로봇신문 관련 기사", "Related article in Robot Newspaper (Korean)")}</ExternalLink></> : <Link href="/activities/ai-robot-challenge" className="text-link">{t("AI 로봇챌린지", "AI Robot Challenge")}</Link>}</aside></section>
    {challenge && <section className="detail-section"><h2>{t("영상으로 만나는 현장.", "See it on video.")}</h2><VideoEmbed videoId="bwild_6jS2U" title={t("AI 로봇챌린지 스케치 영상", "AI Robot Challenge highlight video")} poster="/images/challenge-video.webp"/><p className="guide-small-note">{t("재생 버튼을 누르면 YouTube 영상이 로드됩니다.", "The YouTube video loads when you press play.")} <ExternalLink href={club.youtube}>{t("YouTube에서 보기", "Watch on YouTube")}</ExternalLink></p></section>}
    <section className="detail-section"><h2>{t("그날의 기록.", "From the day.")}</h2><Gallery photos={photos}/></section><p className="back-link"><Link href="/activities" className="text-link">{t("활동으로 돌아가기", "Back to activities")}</Link></p>
    </div>
  </>;
}
