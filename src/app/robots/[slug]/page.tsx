import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GearSix, LockKey } from "@/components/icons";
import { Breadcrumbs, RobotArt, StatusBadge } from "@/components/shared";
import { RobotGuide } from "@/components/robot-guide";
import { currentMember } from "@/lib/auth";
import { getRobot } from "@/lib/db";
import { getLocalizedProject, localizeRobot } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { canAccessRobot, canAdmin } from "@/lib/security";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return { title: (await getRobot((await params).slug))?.name || tr(await getLocale(), "로봇 안내", "Robots") }; }
export default async function RobotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const stored = await getRobot(slug); if (!stored) notFound();
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en); const robot = localizeRobot(stored, locale);
  const project = getLocalizedProject(robot.project_id, locale); const member = await currentMember();
  const approved = canAccessRobot(member); const admin = canAdmin(member);
  const period = locale === "en"
    ? `${robot.start_date || "To be announced"}${robot.end_date ? ` – ${robot.end_date}` : robot.start_date ? " – present" : ""}`
    : `${robot.start_date || "등록 예정"}${robot.end_date ? ` ~ ${robot.end_date}` : "부터 진행 중"}`;
  return <div className="container page-content"><Breadcrumbs items={[{ label: t("로봇 안내", "Robots"), href: "/robots" }, { label: robot.name }]}/><section className="robot-detail-header"><div><StatusBadge status={robot.status}/><h1>{robot.name}</h1><p>{robot.description}</p>{project && <Link href={`/projects/${project.id}`} className="text-link">{locale === "en" ? `View the ${project.title} project` : `${project.title} 프로젝트 보기`}</Link>}</div>{project && <RobotArt project={project} priority/>}</section>
    <dl className="robot-meta"><div><dt>{t("제작 / 운영 팀", "Build / operations team")}</dt><dd>{robot.creators.length ? robot.creators.join(", ") : t("담당 팀 등록 예정", "Team to be announced")}</dd></div><div><dt>{t("프로젝트 기간", "Project period")}</dt><dd>{period}</dd></div><div><dt>{t("플랫폼 / 로봇 ID", "Platform / robot ID")}</dt><dd>{robot.platform}<span className="robot-meta-id">{robot.id}</span></dd></div></dl>
    {admin && <p><Link className="text-link" href={`/admin?edit=${robot.id}`}><GearSix size={18}/>{t("로봇 정보 관리", "Manage robot details")}</Link></p>}
    {approved ? <RobotGuide robot={robot} admin={Boolean(admin)} baseUrl={process.env.NEXT_PUBLIC_SITE_URL}/> : <section className="robot-locked"><LockKey size={42}/><div><h2>{member ? t("회원 승인을 기다리고 있어요.", "Your membership is awaiting approval.") : t("로봇 안내를 열어보세요.", "Unlock the robot guide.")}</h2><p>{member ? t("운영진이 회원을 승인하면 접속 명령어, SSH 설정 파일과 제어 설명서를 이용할 수 있습니다.", "Once the club officers approve your membership, you can use the connection commands, SSH config file and control manual.") : t("로그인한 활동 회원에게 SSH 접속 정보와 운용 설명서를 제공합니다. 로그인하면 이 로봇 페이지로 돌아옵니다.", "SSH access details and operating manuals are available to logged-in active members. After you log in, you'll come back to this robot page.")}</p></div><Link href={member ? "/account" : `/login?next=${encodeURIComponent(`/robots/${robot.id}`)}`} className="button">{member ? t("내 계정 보기", "View my account") : t("로그인하고 확인", "Log in to view")}</Link></section>}
  </div>;
}
