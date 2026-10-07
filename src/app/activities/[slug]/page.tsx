import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Newspaper, PlayCircle } from "@/components/icons";
import { Breadcrumbs, ExternalLink, PageIntro } from "@/components/shared";
import { Gallery } from "@/components/gallery";
import { VideoEmbed } from "@/components/video-embed";
import { club } from "@/lib/content";

const names: Record<string, string> = { "ai-robot-challenge": "AI 로봇챌린지", "ri-opening": "RI 개소식" };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return { title: names[(await params).slug] || "활동" }; }
export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!names[slug]) notFound();
  const challenge = slug === "ai-robot-challenge";
  const photos = challenge ? [ { src: "/images/challenge-team.webp", alt: "AI 로봇챌린지 경기 준비 현장" }, { src: "/images/challenge-arena.webp", alt: "AI 로봇챌린지 경기장과 로봇" }, { src: "/images/challenge-robot.webp", alt: "AI 로봇챌린지에 사용한 로봇" } ] : [ { src: "/images/ri-opening.webp", alt: "RI 개소식에서 로봇을 소개하는 현장" }, { src: "/images/ri-demo.webp", alt: "RI Open Lab의 로봇 시연" } ];
  return <div className="container page-content"><Breadcrumbs items={[{ label: "활동", href: "/activities" }, { label: names[slug] }]}/><PageIntro title={names[slug]} label={challenge ? "2026-1학기 활동" : "활동 사진 아카이브"} description={challenge ? "팀으로 만들고, 현장에서 검증하며 쌓은 경험." : "우리가 만든 로봇과 실험을 더 많은 사람들과 나눴습니다."}/>
    <div className="activity-detail-cover"><Image src={challenge ? "/images/challenge-cover.webp" : "/images/ri-opening.webp"} alt={challenge ? "AI 로봇챌린지에서 기념사진을 찍는 MERO 회원들" : "RI 개소식의 MERO 로봇 소개 현장"} fill sizes="(max-width: 767px) 100vw, 1280px" loading="eager" fetchPriority="high" style={{ objectFit: "cover" }}/></div>
    <section className="article-layout"><article><h2>{challenge ? "만들고, 도전하고, 함께 배운 시간." : "우리의 로봇을 소개하다."}</h2><p>{challenge ? "지난 2026-1학기, MERO는 AI 로봇챌린지 활동을 진행했습니다. 로봇을 준비하고 현장에서 시험하는 과정에서 팀으로 문제를 해결하는 경험을 쌓았습니다." : "RI 개소식에서 로봇을 소개하고 시연하는 모습을 기록했습니다. 직접 만든 로봇을 매개로 우리의 활동과 실험을 나눈 현장입니다."}</p><p>{challenge ? "당시의 현장 사진과 스케치 영상, 관련 기사를 함께 남깁니다. 이 경험은 이번 학기 사족보행, 휴머노이드와 manipulation 프로젝트의 다음 도전으로 이어집니다." : "아래 활동사진을 선택하면 큰 화면으로 볼 수 있습니다."}</p></article><aside className="article-aside"><h3>{challenge ? "영상과 기사" : "함께 보기"}</h3>{challenge ? <><ExternalLink href={club.youtube}><PlayCircle size={18}/>AI 로봇챌린지 스케치</ExternalLink><ExternalLink href={club.article}><Newspaper size={18}/>로봇신문 관련 기사</ExternalLink></> : <Link href="/activities/ai-robot-challenge" className="text-link">AI 로봇챌린지<ArrowRight size={17}/></Link>}</aside></section>
    {challenge && <section className="detail-section"><h2>영상으로 만나는 현장.</h2><VideoEmbed videoId="bwild_6jS2U" title="AI 로봇챌린지 스케치 영상" poster="/images/challenge-video.webp"/><p className="guide-small-note">재생 버튼을 누르면 YouTube 영상이 로드됩니다. <ExternalLink href={club.youtube}>YouTube에서 보기</ExternalLink></p></section>}
    <section className="detail-section"><h2>그날의 기록.</h2><Gallery photos={photos}/></section><Link href="/activities" className="text-link">활동으로 돌아가기<ArrowRight size={17}/></Link>
  </div>;
}
