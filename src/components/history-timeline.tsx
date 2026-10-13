"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RobotArt } from "./shared";
import { useLocale } from "./locale-provider";
import { tr } from "@/lib/i18n";
import type { Project } from "@/lib/types";
export function HistoryTimeline({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("all"); const { locale } = useLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  return <><div className="history-filter"><div className="filter-tabs" aria-label={t("활동 학기 필터", "Filter activities by semester")}>{["all", "2026-2", "2026-1"].map(value => <button key={value} className={filter === value ? "selected" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? t("전체 기록", "All") : t(`${value}학기`, `${value} semester`)}</button>)}</div></div>
    {filter !== "2026-1" && <section className="timeline-group"><div className="timeline-label"><h2>2026-2</h2><span>{t("프로젝트 진행 중", "Projects in progress")}</span></div><div className="timeline-projects">{projects.map(project => <Link key={project.id} href={`/projects/${project.id}`}><RobotArt project={project}/><div><h3>{project.title}</h3><p>{project.summary}</p></div></Link>)}</div></section>}
    {filter !== "2026-2" && <section className="timeline-group"><div className="timeline-label"><h2>2026-1</h2><span>{t("지난 학기 활동", "Last semester")}</span></div><article className="timeline-activity"><Link className="timeline-activity-image" href="/activities/ai-robot-challenge" tabIndex={-1} aria-hidden="true"><Image src="/images/challenge-cover.webp" alt="" fill sizes="(max-width: 1080px) 100vw, 900px" style={{ objectFit: "cover", objectPosition: "center 60%" }}/></Link><Link className="activity-title" href="/activities/ai-robot-challenge"><h3>{t("AI 로봇챌린지", "AI Robot Challenge")}</h3></Link><p>{t("팀으로 만들고, 현장에서 검증하며 쌓은 경험.", "Experience gained by building as a team and testing it in the arena.")}</p></article></section>}
  </>;
}
