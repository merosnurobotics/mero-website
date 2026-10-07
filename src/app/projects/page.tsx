import type { Metadata } from "next";
import { Breadcrumbs, JoinBanner, PageIntro } from "@/components/shared";
import { ProjectBrowser } from "@/components/project-browser";
import { projects } from "@/lib/content";
export const metadata: Metadata = { title: "프로젝트" };
export default function ProjectsPage() { return <div className="container page-content"><Breadcrumbs items={[{ label: "프로젝트" }]}/><PageIntro title="아이디어가 움직이는 곳." description="기구를 설계하고, 제어를 실험하고, 로봇의 지능을 만듭니다." label="2026-2학기 프로젝트"/><ProjectBrowser projects={projects}/><JoinBanner/></div>; }
