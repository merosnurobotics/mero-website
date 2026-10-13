"use client";
import { useState } from "react";
import { MagnifyingGlass } from "./icons";
import { ProjectCard } from "./shared";
import { useLocale } from "./locale-provider";
import { tr } from "@/lib/i18n";
import type { Project } from "@/lib/types";
export function ProjectBrowser({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState(""); const [query, setQuery] = useState("");
  const { locale } = useLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  const categories = ["", ...new Set(projects.map(item => item.category))];
  const results = projects.filter(item => (category === "" || item.category === category) && `${item.title} ${item.english} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="browser-toolbar"><div className="filter-tabs" aria-label={t("프로젝트 분야", "Project area")}>{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={category === item ? "selected" : ""} aria-pressed={category === item}>{item || t("전체", "All")}</button>)}</div><label className="search-field"><MagnifyingGlass size={18}/><input aria-label={t("프로젝트 검색", "Search projects")} placeholder={t("프로젝트 검색", "Search projects")} value={query} onChange={event => setQuery(event.target.value)}/></label></div>
    <p className="results-caption">{t(`2026-2학기 프로젝트 ${results.length}개`, `${results.length} ${results.length === 1 ? "project" : "projects"} in the 2026-2 semester`)}</p>
    {results.length ? <div className={`project-grid ${results.length < 3 ? "filtered-grid" : ""}`}>{results.map(project => <ProjectCard key={project.id} project={project} headingLevel={2}/>)}</div> : <div className="empty-state"><MagnifyingGlass size={34}/><h2>{t("찾는 프로젝트가 없어요.", "No matching projects.")}</h2><p>{t("다른 이름이나 기술 키워드로 검색해 보세요.", "Try another name or technical keyword.")}</p><button className="text-link" onClick={() => { setQuery(""); setCategory(""); }}>{t("전체 프로젝트 보기", "Show all projects")}</button></div>}
  </>;
}
