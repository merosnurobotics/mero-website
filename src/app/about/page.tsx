import type { Metadata } from "next";
import Image from "next/image";
import { Circuitry, Code, MapPin, Wrench } from "@/components/icons";
import { Breadcrumbs, ExternalLink, JoinBanner, PageIntro } from "@/components/shared";
export const metadata: Metadata = { title: "동아리 소개" };
export default function AboutPage() { return <div className="container page-content"><Breadcrumbs items={[{ label: "동아리 소개" }]}/><PageIntro title="로봇을 만드는 사람들, MERO." description="서울대학교 기계공학부를 기반으로, 로봇을 좋아하는 사람들이 모여 함께 배우고 만드는 동아리입니다."/>
  <div className="about-photo"><Image src="/images/mero-team.webp" alt="AI 로봇챌린지 현장에서 로봇과 함께 모인 참가자들" fill sizes="(max-width: 767px) 100vw, 1280px" loading="eager" fetchPriority="high" style={{ objectFit: "cover", objectPosition: "center 58%" }}/></div>
  <section className="detail-section about-story"><h2>아이디어를 손으로 만들고,<br/>실험으로 배웁니다.</h2><div><p>설계한 부품이 맞물리고, 작성한 코드가 로봇의 움직임이 되는 순간. MERO는 그 과정을 함께 경험하는 모임입니다.</p><p>로봇에 대한 관심을 바탕으로 기계, 전자와 소프트웨어를 폭넓게 탐구합니다. 프로젝트와 대회, 전시와 교류를 통해 아이디어를 실험하고 서로의 경험을 나눕니다. 처음 배우는 사람도 자신의 역할을 찾아 함께 만들어 갈 수 있는 동아리를 지향합니다.</p></div></section>
  <div className="about-disciplines"><article><Wrench size={28}/><h3>직접 만들고</h3><p>작은 아이디어도 손으로 만들어 보고, 시행착오 속에서 답을 찾아갑니다.</p></article><article><Code size={28}/><h3>함께 배우고</h3><p>각자의 관심과 경험을 나누며 로봇을 이해하는 시야를 넓힙니다.</p></article><article><Circuitry size={28}/><h3>새롭게 도전합니다</h3><p>프로젝트와 대회에서 우리만의 가능성을 실험하고 다음 도전을 준비합니다.</p></article></div>
  <section className="location-panel"><MapPin size={32}/><div><h2>우리는 301동에 있습니다.</h2><p>서울대학교 301동 동아리방. 방문과 활동 참여는 동아리 운영진에게 문의해 주세요.</p></div><ExternalLink href="https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EB%8C%80%ED%95%99%EA%B5%90%20301%EB%8F%99">지도에서 보기</ExternalLink></section><JoinBanner/>
  </div>; }
