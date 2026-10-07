import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Robot } from "@/components/icons";
import { Breadcrumbs, ExternalLink, RobotArt, StatusBadge } from "@/components/shared";
import { getProject, projects } from "@/lib/content";
import { getRobots } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const project = getProject((await params).slug); return { title: project?.title || "프로젝트" }; }
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug); if (!project) notFound();
  const robots = getRobots().filter(robot => robot.project_id === project.id);
  return <div className="container page-content"><Breadcrumbs items={[{ label: "프로젝트", href: "/projects" }, { label: project.title }]}/>
    <section className="project-detail-hero"><div><div className="tag-row"><span>{project.semester}</span><span>진행 중</span><span>{project.category}</span></div><h1>{project.title}</h1><p className="detail-summary">{project.summary}</p><p className="body-copy">{project.description}</p><div className="tag-row project-detail-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a href="#robot-platforms" className="button">로봇 안내 보기<ArrowRight size={18}/></a></div><figure className="project-detail-art"><RobotArt project={project} priority/><figcaption>{project.imageCredit}</figcaption></figure></section>
    <section className="detail-section"><h2>이번 학기에 탐구하는 것.</h2><div className="goals-grid">{project.goals.map(goal => <article key={goal.title}><h3>{goal.title}</h3><p>{goal.text}</p></article>)}</div></section>
    <section className="detail-section project-roadmap"><div><h2>제작에서 실험까지.</h2><p>프로젝트의 개발 방향입니다.<br/>단계별 진행 상황은 팀의 활동에 따라 업데이트합니다.</p></div><ol>{project.milestones.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol></section>
    <section className="detail-section" id="robot-platforms"><div className="section-heading"><h2>프로젝트의 로봇.</h2><p>QR로 열 수 있는 로봇별 페이지에서 제작 정보와 운용 안내를 확인하세요.</p></div><div className="related-robots">{robots.map(robot => <Link key={robot.id} href={`/robots/${robot.id}`}><Robot size={25}/><div><h3>{robot.name}</h3><span>{robot.platform}</span></div><StatusBadge status={robot.status}/><ArrowRight size={20}/></Link>)}</div>{!robots.length && <div className="empty-state"><Robot size={32}/><p>담당 팀이 로봇을 등록하면 여기에 표시됩니다.</p></div>}</section>
    <section className="detail-section reference-section"><figure><div className="reference-image"><Image src={project.referenceImage!} alt={`${project.title}의 원형 플랫폼 실물 참고 사진`} fill sizes="(max-width: 767px) 100vw, 420px" style={{ objectFit: "contain" }}/></div><figcaption>{project.id === "qdd-quadruped" ? "MIT Mini Cheetah / MIT News" : project.id === "mini-humanoid" ? "Microban / Marc Duclusaud, Rhoban" : "RBY1 / Rainbow Robotics"}. MERO 제작 결과 사진이 아닌 실물 레퍼런스입니다.</figcaption></figure><div><h2>실물에서 시작한 스케치.</h2><p>각 프로젝트의 원형 플랫폼을 참고했습니다. 홈페이지의 연필 스케치는 개발 방향을 소개하는 이미지입니다.</p><div className="reference-links">{project.links.map(link => <ExternalLink href={link.url} key={link.url}><BookOpen size={19}/>{link.title}</ExternalLink>)}</div>{project.id === "mini-humanoid" && <p className="license-note">Microban 원형 하드웨어·문서: CC BY-NC-SA 4.0. 원저자: Marc Duclusaud / Rhoban.</p>}</div></section>
    <div className="other-projects"><h2>다른 프로젝트도 만나보세요.</h2><div>{projects.filter(item => item.id !== project.id).map(item => <Link href={`/projects/${item.id}`} key={item.id}>{item.title}<ArrowUpRightIcon/></Link>)}</div></div>
  </div>;
}
function ArrowUpRightIcon() { return <ArrowRight size={20}/>; }
