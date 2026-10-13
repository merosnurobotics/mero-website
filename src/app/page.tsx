import Image from "next/image";
import Link from "next/link";
import { JoinBanner } from "@/components/shared";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function Home() {
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  return <>
    <section className="photo-hero home-hero" data-photo-hero aria-labelledby="home-title">
      <div className="photo-hero-media"><Image src="/images/mero-team.webp" alt={t("AI 로봇챌린지 현장에서 로봇과 함께 기념사진을 찍는 MERO 회원들", "MERO members posing with their robot at the AI Robot Challenge")} fill sizes="100vw" loading="eager" fetchPriority="high" style={{ objectFit: "cover", objectPosition: "center 70%" }}/></div>
      <div className="home-hero-title">
        <h1 id="home-title"><span className="home-hero-name"><span>MERO</span></span><small>SNU Robotics</small></h1>
        <Link href="/about" className="more-link">More</Link>
      </div>
    </section>
    <section className="home-intro" aria-labelledby="home-intro-title">
      <div className="home-intro-media"><Image src="/images/ri-demo.webp" alt={t("RI 개소식 오픈랩에서 MERO 회원들이 로봇을 시연하는 모습", "MERO members demonstrating a robot at the RI opening open lab")} fill sizes="(max-width: 860px) 100vw, 50vw" style={{ objectFit: "cover", objectPosition: "30% center" }}/></div>
      <div className="home-intro-text">
        <h2 id="home-intro-title">{locale === "en" ? <>The robots we imagine,<br/>built start to finish by our own hands.</> : <>상상한 로봇을<br/>처음부터 끝까지, 우리 손으로.</>}</h2>
        <p className="lead">{t("MERO는 상상을 현실로 만드는 로봇 동아리입니다. 아이디어 스케치에서 시작해 기구 설계, 부품 제작, 회로와 코드를 거쳐 로봇이 실제로 움직이는 순간까지 모든 과정을 직접 해냅니다.", "MERO is a robotics club that turns imagination into reality. From the first idea sketch through mechanical design, part fabrication, circuits and code, to the moment the robot actually moves, we do every step ourselves.")}</p>
        <p>{t("막히는 부분은 함께 고민하고, 창의공학설계의 정신으로 한 대의 로봇을 직접 처음부터 끝까지 완성합니다.", "We work through the hard parts together and, in the spirit of Creative Engineering Design, build each robot ourselves from start to finish.")}</p>
      </div>
    </section>
    <JoinBanner/>
  </>;
}
