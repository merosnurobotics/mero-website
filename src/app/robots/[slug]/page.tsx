import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, GearSix, LockKey } from "@/components/icons";
import { Breadcrumbs, RobotArt, StatusBadge } from "@/components/shared";
import { RobotGuide } from "@/components/robot-guide";
import { currentMember } from "@/lib/auth";
import { getRobot } from "@/lib/db";
import { getProject } from "@/lib/content";
import { canAccessRobot, canAdmin } from "@/lib/security";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return { title: getRobot((await params).slug)?.name || "로봇 안내" }; }
export default async function RobotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const robot = getRobot(slug); if (!robot) notFound();
  const project = getProject(robot.project_id); const member = await currentMember();
  const approved = canAccessRobot(member); const admin = canAdmin(member);
  return <div className="container page-content"><Breadcrumbs items={[{ label: "로봇 안내", href: "/robots" }, { label: robot.name }]}/><section className="robot-detail-header"><div><StatusBadge status={robot.status}/><h1>{robot.name}</h1><p>{robot.description}</p>{project && <Link href={`/projects/${project.id}`} className="text-link">{project.title}<ArrowRight size={17}/></Link>}</div>{project && <RobotArt project={project} priority/>}</section>
    <dl className="robot-meta"><div><dt>제작 / 운영 팀</dt><dd>{robot.creators.length ? robot.creators.join(", ") : "담당 팀 등록 예정"}</dd></div><div><dt>프로젝트 기간</dt><dd>{robot.start_date || "등록 예정"}{robot.end_date ? ` ~ ${robot.end_date}` : "부터 진행 중"}</dd></div><div><dt>플랫폼 / 로봇 ID</dt><dd>{robot.platform}<span style={{ display: "block", color: "var(--muted)", fontSize: 11, marginTop: 4 }}>{robot.id}</span></dd></div></dl>
    {admin && <p><Link className="text-link" href={`/admin?edit=${robot.id}`}><GearSix size={18}/>로봇 정보 관리</Link></p>}
    {approved ? <RobotGuide robot={robot} admin={Boolean(admin)} baseUrl={process.env.NEXT_PUBLIC_SITE_URL}/> : <section className="robot-locked"><LockKey size={42}/><div><h2>{member ? "회원 승인을 기다리고 있어요." : "로봇 안내를 열어보세요."}</h2><p>{member ? "운영진이 회원을 승인하면 접속 명령어, SSH 설정 파일과 제어 설명서를 이용할 수 있습니다." : "로그인한 활동 회원에게 SSH 접속 정보와 운용 설명서를 제공합니다. 로그인하면 이 로봇 페이지로 돌아옵니다."}</p></div><Link href={member ? "/account" : `/login?next=${encodeURIComponent(`/robots/${robot.id}`)}`} className="button">{member ? "내 계정 보기" : "로그인하고 확인"}<ArrowRight size={18}/></Link></section>}
  </div>;
}
