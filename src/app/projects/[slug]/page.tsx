import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Robot } from "@/components/icons";
import { Breadcrumbs, ExternalLink, RobotArt, StatusBadge } from "@/components/shared";
import { getLocalizedProject, getProjects, localizeRobot } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getRobots } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const locale = await getLocale(); const project = getLocalizedProject((await params).slug, locale); return { title: project?.title || tr(locale, "프로젝트", "Projects") }; }
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  const project = getLocalizedProject((await params).slug, locale); if (!project) notFound();
  const robots = (await getRobots()).filter(robot => robot.project_id === project.id).map(robot => localizeRobot(robot, locale));
  return <div className="container page-content"><Breadcrumbs items={[{ label: t("프로젝트", "Projects"), href: "/projects" }, { label: project.title }]}/>
    <section className="project-detail-hero"><div><div className="tag-row"><span>{project.semester}</span><span>{t("진행 중", "In progress")}</span><span>{project.category}</span></div><h1>{project.title}</h1><p className="detail-summary">{project.summary}</p><p className="body-copy">{project.description}</p><div className="tag-row project-detail-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a href="#robot-platforms" className="button">{t("로봇 안내 보기", "See the robots")}</a></div><figure className="project-detail-art"><RobotArt project={project} priority/><figcaption>{project.imageCredit}</figcaption></figure></section>
    <section className="detail-section"><h2>{t("이번 학기에 탐구하는 것.", "What we are exploring this semester.")}</h2><div className="goals-grid">{project.goals.map(goal => <article key={goal.title}><h3>{goal.title}</h3><p>{goal.text}</p></article>)}</div></section>
    <section className="detail-section project-roadmap"><div><h2>{t("제작에서 실험까지.", "From building to experiments.")}</h2><p>{t("프로젝트의 개발 방향입니다.", "This is the project's development roadmap.")}<br/>{t("단계별 진행 상황은 팀의 활동에 따라 업데이트합니다.", "Progress on each stage is updated as the team works.")}</p></div><ol>{project.milestones.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol></section>
    <section className="detail-section" id="robot-platforms"><div className="section-heading"><h2>{t("프로젝트의 로봇.", "Robots in this project.")}</h2><p>{t("QR로 열 수 있는 로봇별 페이지에서 제작 정보와 운용 안내를 확인하세요.", "See each robot's page for build details and operating guides.")}</p></div><div className="related-robots">{robots.map(robot => <Link key={robot.id} href={`/robots/${robot.id}`}><Robot size={25}/><div><h3>{robot.name}</h3><span>{robot.platform}</span></div><StatusBadge status={robot.status}/></Link>)}</div>{!robots.length && <div className="empty-state"><Robot size={32}/><p>{t("담당 팀이 로봇을 등록하면 여기에 표시됩니다.", "Robots will appear here once the responsible team registers them.")}</p></div>}</section>
    <section className="detail-section reference-section"><figure><div className="reference-image"><Image src={project.referenceImage!} alt={t(`${project.title}의 원형 플랫폼 실물 참고 사진`, `Reference photo of the original platform behind the ${project.title}`)} fill sizes="(max-width: 767px) 100vw, 420px" style={{ objectFit: "contain" }}/></div><figcaption>{project.id === "qdd-quadruped" ? "MIT Mini Cheetah / MIT News" : project.id === "mini-humanoid" ? "Microban / Marc Duclusaud, Rhoban" : "RBY1 / Rainbow Robotics"}{t(". MERO 제작 결과 사진이 아닌 실물 레퍼런스입니다.", ". A real-world reference, not a photo of MERO's build.")}</figcaption></figure><div><h2>{t("실물에서 시작한 스케치.", "Sketches that start from real robots.")}</h2><p>{t("각 프로젝트의 원형 플랫폼을 참고했습니다. 홈페이지의 연필 스케치는 개발 방향을 소개하는 이미지입니다.", "Each project draws on its original platform. The pencil sketches on this site illustrate where our development is headed.")}</p><div className="reference-links">{project.links.map(link => <ExternalLink href={link.url} key={link.url}><BookOpen size={19}/>{link.title}</ExternalLink>)}</div>{project.id === "mini-humanoid" && <p className="license-note">{t("Microban 원형 하드웨어·문서: CC BY-NC-SA 4.0. 원저자: Marc Duclusaud / Rhoban.", "Original Microban hardware and documentation: CC BY-NC-SA 4.0. Original author: Marc Duclusaud / Rhoban.")}</p>}</div></section>
    <div className="other-projects"><h2>{t("다른 프로젝트도 만나보세요.", "Explore our other projects.")}</h2><div>{getProjects(locale).filter(item => item.id !== project.id).map(item => <Link href={`/projects/${item.id}`} key={item.id}>{item.title}</Link>)}</div></div>
  </div>;
}
