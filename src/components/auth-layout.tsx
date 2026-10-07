import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "./icons";
export function AuthLayout({ children, signup = false }: { children: React.ReactNode; signup?: boolean }) { return <div className="container auth-layout"><aside className="auth-aside"><p className="eyebrow">MERO MEMBERS</p><h1>{signup ? <>함께 만들면,<br/>더 멀리 갈 수 있으니까.</> : <>로봇을 만드는 여정,<br/>여기서 이어가세요.</>}</h1><p>서울대학교 301동에서 시작하는 로보틱스.<br/>기구와 제어, 인공지능을 함께 탐구합니다.</p><div className="auth-sketch"><Image src="/images/robot-sketches.webp" alt="Mini Cheetah, Microban과 RBY1의 연필 스케치" fill sizes="(max-width: 767px) 100vw, 580px" loading="eager" fetchPriority="high"/></div><Link className="text-link" href="/about">MERO 알아보기<ArrowUpRight size={17}/></Link></aside>{children}</div>; }
