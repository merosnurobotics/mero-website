"use client";
import Link from "next/link";
import { useState } from "react";
import { getProject } from "@/lib/content";
import { ArrowRight, MagnifyingGlass, Robot } from "./icons";
import { RobotArt, StatusBadge } from "./shared";
import type { PublicRobot } from "@/lib/types";
export function RobotBrowser({ robots }: { robots: PublicRobot[] }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("all");
  const results = robots.filter(robot => (filter === "all" || robot.status === filter) && `${robot.name} ${robot.platform} ${robot.id}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="browser-toolbar"><div className="filter-tabs" aria-label="로봇 상태 필터">{[{ id: "all", label: "전체" }, { id: "building", label: "개발 중" }, { id: "ready", label: "사용 가능" }, { id: "maintenance", label: "점검 중" }, { id: "archived", label: "보관 중" }].map(item => <button key={item.id} aria-pressed={filter === item.id} className={filter === item.id ? "selected" : ""} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div><label className="search-field"><MagnifyingGlass size={18}/><input aria-label="로봇 검색" placeholder="로봇 이름 또는 ID 검색" value={query} onChange={event => setQuery(event.target.value)}/></label></div><p className="results-caption">등록된 로봇 {results.length}대</p>
    {results.length ? <div className="robot-browser-grid">{results.map(robot => { const project = getProject(robot.project_id); return <article className="robot-list-card" key={robot.id}>{project && <RobotArt project={project}/>}<div><StatusBadge status={robot.status}/><h2>{robot.name}</h2><p className="robot-platform">{robot.platform}</p><Link href={`/robots/${robot.id}`} className="text-link">로봇 안내 열기<ArrowRight size={17}/></Link></div></article>; })}</div> : <div className="empty-state"><Robot size={35}/><h2>조건에 맞는 로봇이 없어요.</h2><p>다른 이름이나 상태로 찾아보세요.</p><button className="text-link" onClick={() => { setFilter("all"); setQuery(""); }}>전체 로봇 보기<ArrowRight size={16}/></button></div>}
  </>;
}
