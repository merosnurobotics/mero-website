import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CaretRight, MapPin } from "./icons";
import { projects, robotStatusLabels } from "@/lib/content";
import type { Project, RobotStatus } from "@/lib/types";

export function Footer() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-main"><div><Link href="/" className="footer-brand" aria-label="MERO 홈"><span className="mero-brand-mark" aria-hidden="true"/><span>MERO</span></Link><p>함께 배우고, 직접 만드는 로봇.</p><span className="footer-location"><MapPin size={16}/>서울대학교 301동</span></div>
      <div className="footer-links"><Link href="/about">동아리 소개</Link><Link href="/activities">활동</Link><Link href="/robots">로봇 안내</Link></div>
      <div className="footer-links"><Link href="/signup">회원가입</Link><Link href="/account">내 계정</Link><Link href="/admin">관리자</Link><Link href="/privacy">개인정보 안내</Link></div>
    </div><div className="affiliation-logos" aria-label="서울대학교 기계공학부"><a href="https://www.snu.ac.kr/" target="_blank" rel="noopener noreferrer" aria-label="서울대학교 홈페이지 (새 탭)"><Image src="/brand/snu-seal.png" alt="서울대학교 정장" width={56} height={58}/></a><a href="https://me.snu.ac.kr/" target="_blank" rel="noopener noreferrer" aria-label="서울대학교 기계공학부 홈페이지 (새 탭)"><span className="department-logo-stack"><Image className="department-logo department-logo-light" src="/brand/mechanical-engineering-transparent.png" alt="서울대학교 기계공학부 로고" width={868} height={230} sizes="(max-width: 767px) 240px, 300px"/><Image className="department-logo department-logo-dark" src="/brand/mechanical-engineering-dark.png" alt="서울대학교 기계공학부 로고" width={868} height={230} sizes="(max-width: 767px) 240px, 300px"/></span></a></div><div className="footer-bottom"><span>© 2026 MERO. Seoul National University Robotics Club.</span><span>Made by people who make robots.</span></div>
  </div></footer>;
}
export function ExternalLink({ href, children, className = "text-link" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<ArrowUpRight size={17}/><span className="sr-only"> (새 탭에서 열림)</span></a>;
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="breadcrumbs" aria-label="현재 위치"><Link href="/">홈</Link>{items.map((item, index) => <span key={index}><CaretRight size={13}/>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
export function PageIntro({ title, description, label, children }: { title: string; description: string; label?: string; children?: React.ReactNode }) {
  return <div className="page-intro">{label && <p className="eyebrow">{label}</p>}<h1>{title}</h1><p className="intro-description">{description}</p>{children}</div>;
}
export function RobotArt({ project, className = "", priority = false }: { project: Project; className?: string; priority?: boolean }) {
  const index = projects.findIndex(item => item.id === project.id);
  return <div className={`robot-art ${className}`}><Image src={project.image} alt={`${project.title} 실물 레퍼런스를 참고한 연필 스케치`} fill sizes="(max-width: 767px) 340px, 460px" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} style={{ objectFit: "cover", objectPosition: `${index * 50}% 50%` }}/></div>;
}
export function ProjectCard({ project, featured = false, headingLevel = 3 }: { project: Project; featured?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <Link href={`/projects/${project.id}`} className={`project-card ${featured ? "project-card-featured" : "project-card-compact"}`}>
    <div className="project-card-content"><div className="project-card-meta"><span>{project.category}</span><span className="status-label">진행 중</span></div><Heading>{project.title}</Heading><p>{project.summary}</p><div className="tag-row">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
    <div className="project-card-media"><RobotArt project={project}/></div><span className="project-card-arrow" aria-hidden="true"><ArrowUpRight size={21}/></span>
  </Link>;
}
export function ProjectGrid() { return <div className="project-grid">{projects.map((project, index) => <ProjectCard project={project} key={project.id} featured={index === 0}/>)}</div>; }
export function StatusBadge({ status }: { status: RobotStatus }) { return <span className={`status-badge status-${status}`}>{robotStatusLabels[status]}</span>; }
export function JoinBanner() { return <section className="join-banner"><div><h2>로봇을 좋아한다면,<br className="mobile-only"/> 함께 만들어 봐요.</h2><p>전공보다 호기심, 경험보다 함께 배우려는 마음.</p></div><Link href="/signup" className="button">MERO 회원가입<ArrowRight size={18}/></Link></section>; }
