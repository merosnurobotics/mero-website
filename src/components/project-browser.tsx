"use client";
import { useState } from "react";
import { MagnifyingGlass, ArrowRight } from "./icons";
import { ProjectCard } from "./shared";
import type { Project } from "@/lib/types";
export function ProjectBrowser({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState("전체"); const [query, setQuery] = useState("");
  const categories = ["전체", ...new Set(projects.map(item => item.category))];
  const results = projects.filter(item => (category === "전체" || item.category === category) && `${item.title} ${item.english} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="browser-toolbar"><div className="filter-tabs" aria-label="프로젝트 분야">{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={category === item ? "selected" : ""} aria-pressed={category === item}>{item}</button>)}</div><label className="search-field"><MagnifyingGlass size={18}/><input aria-label="프로젝트 검색" placeholder="프로젝트 검색" value={query} onChange={event => setQuery(event.target.value)}/></label></div>
    <p className="results-caption">2026-2학기 프로젝트 {results.length}개</p>
    {results.length ? <div className={`project-grid ${results.length < 3 ? "filtered-grid" : ""}`}>{results.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0} headingLevel={2}/>)}</div> : <div className="empty-state"><MagnifyingGlass size={34}/><h2>찾는 프로젝트가 없어요.</h2><p>다른 이름이나 기술 키워드로 검색해 보세요.</p><button className="text-link" onClick={() => { setQuery(""); setCategory("전체"); }}>전체 프로젝트 보기<ArrowRight size={17}/></button></div>}
  </>;
}
