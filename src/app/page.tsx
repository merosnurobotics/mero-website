import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { JoinBanner } from "@/components/shared";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return <>
    <section className="container hero">
      <div className="hero-copy"><p className="eyebrow hero-enter">서울대학교 로봇 동아리 MERO</p><h1 className="hero-enter">상상을 설계하고,<br/><span>로봇으로 실현하다.</span></h1><p className="hero-description hero-enter">직접 만들고, 함께 배우고, 새로운 가능성을 실험합니다.<br className="desktop-only"/> 서울대학교 301동에서 시작하는 우리들의 로보틱스.</p><div className="hero-buttons hero-enter"><Link href="/about" className="button">MERO 알아보기<ArrowRight size={18}/></Link><Link href="/activities" className="button button-outline">활동 보기<ArrowUpRight size={18}/></Link></div></div>
      <div className="hero-photo hero-enter"><Image src="/images/mero-team.webp" alt="AI 로봇챌린지 현장에서 로봇과 함께 기념사진을 찍는 참가자들" fill sizes="(max-width: 767px) 100vw, 600px" loading="eager" fetchPriority="high" style={{ objectFit: "cover", objectPosition: "center 58%" }}/></div>
    </section>
    <section className="container home-introduction"><Reveal className="home-introduction-inner"><h2>호기심에서 출발해,<br/>우리 손으로 만드는 경험.</h2><div><p>로봇을 좋아하는 마음이 모이면 새로운 움직임이 시작됩니다. MERO는 설계와 제작, 코드와 실험을 오가며 아이디어를 현실로 만드는 사람들의 모임입니다.</p><p>함께 배우는 과정과 작은 발견들을 나눕니다. 각자의 관심을 더해, 혼자서는 만들 수 없었던 가능성을 찾아갑니다.</p><Link href="/about" className="text-link">우리의 이야기<ArrowRight size={18}/></Link></div></Reveal></section>
    <div className="container"><Reveal><JoinBanner/></Reveal></div>
  </>;
}
