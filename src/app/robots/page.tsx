import type { Metadata } from "next";
import { LockKey } from "@/components/icons";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { RobotBrowser } from "@/components/robot-browser";
import { getRobots, publicRobot } from "@/lib/db";
export const metadata: Metadata = { title: "로봇 안내" };
export default function RobotsPage() { return <div className="container page-content"><Breadcrumbs items={[{ label: "로봇 안내" }]}/><PageIntro title="로봇의 모든 정보를, 한곳에." description="제작 정보, 연결 방법과 제어 설명서. 로봇에 붙은 QR로도 바로 열 수 있습니다."/><RobotBrowser robots={getRobots().map(publicRobot)}/><div className="info-notice"><LockKey size={21}/><p>프로젝트와 제작 정보는 누구나 볼 수 있습니다. SSH 접속 정보와 운용 설명서는 로그인 및 운영진의 회원 승인 후 이용할 수 있습니다.</p></div></div>; }
