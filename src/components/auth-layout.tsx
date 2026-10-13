import Image from "next/image";
import Link from "next/link";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export async function AuthLayout({ children, signup = false }: { children: React.ReactNode; signup?: boolean }) {
  const locale = await getLocale(); const en = locale === "en"; const t = (ko: string, en: string) => tr(locale, ko, en);
  return <div className="container auth-layout"><aside className="auth-aside"><p className="eyebrow">{t("MERO 회원", "MERO Members")}</p><h1>{en ? signup ? <>Build together,<br/>and we can go further.</> : <>Your journey building robots<br/>continues here.</> : signup ? <>함께 만들면,<br/>더 멀리 갈 수 있으니까.</> : <>로봇을 만드는 여정,<br/>여기서 이어가세요.</>}</h1><p>{en ? <>Robotics that starts in Building 301 at Seoul National University.<br/>We explore mechanisms, control and AI together.</> : <>서울대학교 301동에서 시작하는 로보틱스.<br/>기구와 제어, 인공지능을 함께 탐구합니다.</>}</p><div className="auth-sketch"><Image src="/images/robot-sketches.webp" alt={t("Mini Cheetah, Microban과 RBY1의 연필 스케치", "Pencil sketches of Mini Cheetah, Microban and RBY1")} fill sizes="(max-width: 767px) 100vw, 580px" loading="eager" fetchPriority="high"/></div><Link className="text-link" href="/about">{t("MERO 알아보기", "Learn about MERO")}</Link></aside>{children}</div>;
}
