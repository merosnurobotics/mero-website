"use client";
import Link from "next/link";
import { useState } from "react";
import { getLocalizedProject } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import { MagnifyingGlass, Robot } from "./icons";
import { RobotArt, StatusBadge } from "./shared";
import type { PublicRobot } from "@/lib/types";
export function RobotBrowser({ robots }: { robots: PublicRobot[] }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("all"); const { locale } = useLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  const results = robots.filter(robot => (filter === "all" || robot.status === filter) && `${robot.name} ${robot.platform} ${robot.id}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="browser-toolbar"><div className="filter-tabs" aria-label={t("로봇 상태 필터", "Filter robots by status")}>{[{ id: "all", label: t("전체", "All") }, { id: "building", label: t("개발 중", "In development") }, { id: "ready", label: t("사용 가능", "Available") }, { id: "maintenance", label: t("점검 중", "Under maintenance") }, { id: "archived", label: t("보관 중", "Archived") }].map(item => <button key={item.id} aria-pressed={filter === item.id} className={filter === item.id ? "selected" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div><label className="search-field"><MagnifyingGlass size={18}/><input aria-label={t("로봇 검색", "Search robots")} placeholder={t("로봇 이름 또는 ID 검색", "Search by robot name or ID")} value={query} onChange={event => setQuery(event.target.value)}/></label></div><p className="results-caption">{locale === "en" ? `${results.length} registered robot${results.length === 1 ? "" : "s"}` : `등록된 로봇 ${results.length}대`}</p>
    {results.length ? <div className="robot-browser-grid">{results.map(robot => { const project = getLocalizedProject(robot.project_id, locale); return <article className="robot-list-card" key={robot.id}>{project && <RobotArt project={project}/>}<div><StatusBadge status={robot.status}/><h2>{robot.name}</h2><p className="robot-platform">{robot.platform}</p><Link href={`/robots/${robot.id}`} className="text-link">{t("로봇 안내 열기", "Open robot guide")}</Link></div></article>; })}</div> : <div className="empty-state"><Robot size={35}/><h2>{t("조건에 맞는 로봇이 없어요.", "No robots match your search.")}</h2><p>{t("다른 이름이나 상태로 찾아보세요.", "Try a different name or status.")}</p><button className="text-link" onClick={() => { setFilter("all"); setQuery(""); }}>{t("전체 로봇 보기", "Show all robots")}</button></div>}
  </>;
}
