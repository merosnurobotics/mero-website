import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CaretRight } from "./icons";
import { projects, robotStatusLabels } from "@/lib/content";
import type { Project, RobotStatus } from "@/lib/types";

// Header already carries the main navigation and sign-up, so the footer keeps only the remaining links.
// onPhoto renders it inside the closing photo band; the layout's own footer then hides itself (see globals.css).
export function Footer({ onPhoto = false }: { onPhoto?: boolean }) {
  return <footer className={`site-footer${onPhoto ? " footer-on-photo" : ""}`} role={onPhoto ? "contentinfo" : undefined}><div className="container">
    <div className="footer-logos">
      <Link href="/" className="footer-mark" aria-label="MERO 홈"><span className="mero-brand-mark" aria-hidden="true"/></Link>
      <a href="https://www.snu.ac.kr/" target="_blank" rel="noopener noreferrer" aria-label="서울대학교 홈페이지 (새 탭)"><Image className="snu-seal" src="/brand/snu-seal.png" alt="서울대학교 정장" width={56} height={58}/></a>
      <a href="https://me.snu.ac.kr/" target="_blank" rel="noopener noreferrer" aria-label="서울대학교 기계공학부 홈페이지 (새 탭)"><Image className="department-logo department-logo-light" src="/brand/mechanical-engineering-transparent.png" alt="서울대학교 기계공학부 로고" width={868} height={230} sizes="240px"/><Image className="department-logo department-logo-dark" src="/brand/mechanical-engineering-dark.png" alt="서울대학교 기계공학부 로고" width={868} height={230} sizes="240px"/></a>
    </div>
    <div className="footer-bottom">
      <nav className="footer-links" aria-label="기타 링크"><Link href="/account">내 계정</Link><Link href="/admin">관리자</Link><Link href="/privacy">개인정보 안내</Link></nav>
      <p className="footer-copy">© 2026 MERO. Seoul National University Robotics Club.</p>
    </div>
  </div></footer>;
}
export function ExternalLink({ href, children, className = "text-link" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<ArrowUpRight size={16}/><span className="sr-only"> (새 탭에서 열림)</span></a>;
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="breadcrumbs" aria-label="현재 위치"><Link href="/">홈</Link>{items.map((item, index) => <span key={index}><CaretRight size={12}/>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
export function PageIntro({ title, description, label, children }: { title: string; description: string; label?: string; children?: React.ReactNode }) {
  return <div className="page-intro">{label && <p className="eyebrow">{label}</p>}<h1>{title}</h1><p className="intro-description">{description}</p>{children}</div>;
}
/** Full-bleed photo header for the photo-led pages. The site header floats over it. */
export function PhotoHero({ title, description, label, image, alt, position = "center", breadcrumbs }: { title: string; description?: string; label?: string; image: string; alt: string; position?: string; breadcrumbs?: { label: string; href?: string }[] }) {
  return <section className="photo-hero page-hero" data-photo-hero>
    <div className="photo-hero-media"><Image src={image} alt={alt} fill sizes="100vw" loading="eager" fetchPriority="high" style={{ objectFit: "cover", objectPosition: position }}/></div>
    <div className="container page-hero-inner">{breadcrumbs && <Breadcrumbs items={breadcrumbs}/>}{label && <p className="page-hero-label">{label}</p>}<h1>{title}</h1>{description && <p className="page-hero-description">{description}</p>}</div>
  </section>;
}
export function RobotArt({ project, className = "", priority = false }: { project: Project; className?: string; priority?: boolean }) {
  const index = projects.findIndex(item => item.id === project.id);
  return <div className={`robot-art ${className}`}><Image src={project.image} alt={`${project.title} 실물 레퍼런스를 참고한 연필 스케치`} fill sizes="(max-width: 767px) 340px, 460px" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} style={{ objectFit: "cover", objectPosition: `${index * 50}% 50%` }}/></div>;
}
export function ProjectCard({ project, headingLevel = 3 }: { project: Project; featured?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <Link href={`/projects/${project.id}`} className="project-card">
    <div className="project-card-content"><div className="project-card-meta"><span>{project.category}</span><span className="status-label">진행 중</span></div><Heading>{project.title}</Heading><p>{project.summary}</p><div className="tag-row">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
    <div className="project-card-media"><RobotArt project={project}/></div>
  </Link>;
}
export function ProjectGrid() { return <div className="project-grid">{projects.map(project => <ProjectCard project={project} key={project.id}/>)}</div>; }
export function StatusBadge({ status }: { status: RobotStatus }) { return <span className={`status-badge status-${status}`}>{robotStatusLabels[status]}</span>; }
/** Closing photo band that runs behind the footer. Sign-up does not make someone a member, so it carries no sign-up button. */
export function JoinBanner() {
  return <div className="photo-closing">
    <div className="photo-hero-media"><Image src="/images/ri-opening.webp" alt="RI 개소식에서 관람객들이 MERO 로봇 시연을 지켜보는 모습" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 60%" }}/></div>
    <section className="join-banner" aria-labelledby="join-banner-title"><div className="join-banner-inner"><h2 id="join-banner-title">로봇을 좋아한다면,<br/>함께 만들어 봐요.</h2></div></section>
    <Footer onPhoto/>
  </div>;
}
