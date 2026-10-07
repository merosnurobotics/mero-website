import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Newspaper, PlayCircle, WarningCircle } from "@/components/icons";
import { Breadcrumbs, ExternalLink, PageIntro } from "@/components/shared";
import { Gallery } from "@/components/gallery";
import { VideoEmbed } from "@/components/video-embed";
import { club } from "@/lib/content";

const names: Record<string, string> = { "ai-robot-challenge": "AI 로봇챌린지", "ri-opening": "RI 개소식", "tri-response": "TRI-RESPONSE 자체대회" };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return { title: names[(await params).slug] || "활동" }; }
export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; if (!names[slug]) notFound();
  if (slug === "tri-response") return <CompetitionPage/>;
  const challenge = slug === "ai-robot-challenge";
  const photos = challenge ? [ { src: "/images/challenge-team.webp", alt: "AI 로봇챌린지 경기 준비 현장" }, { src: "/images/challenge-arena.webp", alt: "AI 로봇챌린지 경기장과 로봇" }, { src: "/images/challenge-robot.webp", alt: "AI 로봇챌린지에 사용한 로봇" } ] : [ { src: "/images/ri-opening.webp", alt: "RI 개소식에서 로봇을 소개하는 현장" }, { src: "/images/ri-demo.webp", alt: "RI Open Lab의 로봇 시연" } ];
  return <div className="container page-content"><Breadcrumbs items={[{ label: "활동", href: "/activities" }, { label: names[slug] }]}/><PageIntro title={names[slug]} label={challenge ? "2026-1학기 활동" : "활동 사진 아카이브"} description={challenge ? "팀으로 만들고, 현장에서 검증하며 쌓은 경험." : "우리가 만든 로봇과 실험을 더 많은 사람들과 나눴습니다."}/>
    <div className="activity-detail-cover"><Image src={challenge ? "/images/challenge-cover.webp" : "/images/ri-opening.webp"} alt={challenge ? "AI 로봇챌린지에서 기념사진을 찍는 MERO 회원들" : "RI 개소식의 MERO 로봇 소개 현장"} fill sizes="(max-width: 767px) 100vw, 1280px" loading="eager" fetchPriority="high" style={{ objectFit: "cover" }}/></div>
    <section className="article-layout"><article><h2>{challenge ? "만들고, 도전하고, 함께 배운 시간." : "우리의 로봇을 소개하다."}</h2><p>{challenge ? "지난 2026-1학기, MERO는 AI 로봇챌린지 활동을 진행했습니다. 로봇을 준비하고 현장에서 시험하는 과정에서 팀으로 문제를 해결하는 경험을 쌓았습니다." : "RI 개소식에서 로봇을 소개하고 시연하는 모습을 기록했습니다. 직접 만든 로봇을 매개로 우리의 활동과 실험을 나눈 현장입니다."}</p><p>{challenge ? "당시의 현장 사진과 스케치 영상, 관련 기사를 함께 남깁니다. 이 경험은 이번 학기 사족보행, 휴머노이드와 manipulation 프로젝트의 다음 도전으로 이어집니다." : "아래 활동사진을 선택하면 큰 화면으로 볼 수 있습니다."}</p></article><aside className="article-aside"><h3>{challenge ? "영상과 기사" : "함께 보기"}</h3>{challenge ? <><ExternalLink href={club.youtube}><PlayCircle size={18}/>AI 로봇챌린지 스케치</ExternalLink><ExternalLink href={club.article}><Newspaper size={18}/>로봇신문 관련 기사</ExternalLink></> : <Link href="/activities/ai-robot-challenge" className="text-link">AI 로봇챌린지<ArrowRight size={17}/></Link>}</aside></section>
    {challenge && <section className="detail-section"><h2>영상으로 만나는 현장.</h2><VideoEmbed videoId="bwild_6jS2U" title="AI 로봇챌린지 스케치 영상" poster="/images/challenge-video.webp"/><p className="guide-small-note">재생 버튼을 누르면 YouTube 영상이 로드됩니다. <ExternalLink href={club.youtube}>YouTube에서 보기</ExternalLink></p></section>}
    <section className="detail-section"><h2>그날의 기록.</h2><Gallery photos={photos}/></section><Link href="/activities" className="text-link">활동으로 돌아가기<ArrowRight size={17}/></Link>
  </div>;
}
function CompetitionPage() { return <div className="container page-content competition-detail"><Breadcrumbs items={[{ label: "활동", href: "/activities" }, { label: "TRI-RESPONSE" }]}/><section className="competition-detail-hero"><div><span className="plain-label">동아리 자체대회 기획 중</span><h1>TRI-RESPONSE</h1><p className="detail-summary">탐색, 돌파, 정밀 대응.<br/>서로 다른 로봇이 이어가는 하나의 미션.</p><p className="body-copy">바퀴형 플랫폼이 QDD와 Microban을 운반하고, 각 로봇이 자신의 강점을 살려 다음 임무로 연결하는 릴레이를 구상합니다. 서울대학교 301동과 303동 주변을 참고해 경기 코스를 검토하고 있습니다.</p></div><figure><div className="competition-image"><Image src="/images/tri-response.webp" alt="QDD와 Microban을 적재한 바퀴 캐리어의 자체대회 콘셉트" fill sizes="(max-width: 767px) 100vw, 650px" loading="eager" fetchPriority="high" style={{ objectFit: "cover" }}/></div><figcaption>대회 콘셉트 시각화. 실제 경기 사진이 아닙니다.</figcaption></figure></section>
    <section className="detail-section"><h2>하나의 임무, 서로 다른 역할.</h2><ol className="mission-flow"><li><span>바퀴형 플랫폼</span><h3>탐색하고 운반하기</h3><p>공간을 탐색하고 지도와 목표를 기록합니다. QDD와 Microban을 적재해 다음 전개 지점으로 이동하는 역할을 준비합니다.</p></li><li><span>QDD 사족보행</span><h3>지형을 넘어 접근하기</h3><p>경사와 단차를 관측하고 알맞은 이동 전략을 선택합니다. Microban을 운반하며 현장 진입 임무를 잇는 구상입니다.</p></li><li><span>Microban 휴머노이드</span><h3>작은 공간에서 대응하기</h3><p>좁은 구간과 낮은 통로에 맞춰 자세를 전환하고, 지정된 현장에 접근하는 정밀 대응 역할을 연구합니다.</p></li></ol><div className="info-notice"><WarningCircle size={22}/><p>현재는 대회 설계와 개별 로봇 개발 단계입니다. 중첩 운반·전개·임무 인계의 통합 실물 성능은 검증 전이며, 개최 일정과 최종 규칙은 확정 후 안내합니다.</p></div></section>
    <section className="detail-section"><h2>두 프로젝트가 만나는 다음 도전.</h2><p className="body-copy">각 로봇의 제작과 제어를 먼저 검증하고, 협업 구조와 코스를 구체화합니다. 개별 시뮬레이션 실험은 통합 대회 완주와 구분해 기록합니다.</p><div className="other-projects" style={{ border: "none", paddingTop: 25 }}><div><Link href="/projects/qdd-quadruped">QDD 사족보행 프로젝트<ArrowRight size={20}/></Link><Link href="/projects/mini-humanoid">Microban 휴머노이드 프로젝트<ArrowRight size={20}/></Link></div></div></section>
  </div>; }
