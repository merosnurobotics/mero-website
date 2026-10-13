import type { Metadata } from "next";
import { LockKey } from "@/components/icons";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { RobotBrowser } from "@/components/robot-browser";
import { localizeRobot } from "@/lib/content";
import { getRobots, publicRobot } from "@/lib/db";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "로봇 안내", "Robots") }; }
export default async function RobotsPage() {
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  return <div className="container page-content"><Breadcrumbs items={[{ label: t("로봇 안내", "Robots") }]}/><PageIntro title={t("로봇의 모든 정보를, 한곳에.", "Everything about our robots, in one place.")} description={t("제작 정보, 연결 방법과 제어 설명서.", "Build details, how to connect, and control manuals.")}/><RobotBrowser robots={(await getRobots()).map(robot => localizeRobot(publicRobot(robot), locale))}/><div className="info-notice"><LockKey size={21}/><p>{t("프로젝트와 제작 정보는 누구나 볼 수 있습니다. SSH 접속 정보와 운용 설명서는 로그인 및 운영진의 회원 승인 후 이용할 수 있습니다.", "Anyone can view project and build information. SSH access details and operating manuals are available after you log in and the club officers approve your membership.")}</p></div></div>;
}
