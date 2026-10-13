import type { Metadata } from "next";
import { Breadcrumbs, JoinBanner, PageIntro } from "@/components/shared";
import { ProjectBrowser } from "@/components/project-browser";
import { getProjects } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "프로젝트", "Projects") }; }
export default async function ProjectsPage() { const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en); return <><div className="container page-content"><Breadcrumbs items={[{ label: t("프로젝트", "Projects") }]}/><PageIntro title={t("아이디어가 움직이는 곳.", "Where ideas start to move.")} description={t("기구를 설계하고, 제어를 실험하고, 로봇의 지능을 만듭니다.", "We design mechanisms, experiment with control, and build robot intelligence.")} label={t("2026-2학기 프로젝트", "2026-2 semester projects")}/><ProjectBrowser projects={getProjects(locale)}/></div><JoinBanner/></>; }
