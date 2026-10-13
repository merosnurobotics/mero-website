"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RobotArt } from "./shared";
import type { Project } from "@/lib/types";
export function HistoryTimeline({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("전체");
  return <><div className="history-filter"><div className="filter-tabs" aria-label="활동 학기 필터">{["전체", "2026-2", "2026-1"].map(value => <button key={value} className={filter === value ? "selected" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "전체" ? "전체 기록" : `${value}학기`}</button>)}</div></div>
    {filter !== "2026-1" && <section className="timeline-group"><div className="timeline-label"><h2>2026-2</h2><span>프로젝트 진행 중</span></div><div className="timeline-projects">{projects.map(project => <Link key={project.id} href={`/projects/${project.id}`}><RobotArt project={project}/><div><h3>{project.title}</h3><p>{project.summary}</p></div></Link>)}</div></section>}
    {filter !== "2026-2" && <section className="timeline-group"><div className="timeline-label"><h2>2026-1</h2><span>지난 학기 활동</span></div><article className="timeline-activity"><Link className="timeline-activity-image" href="/activities/ai-robot-challenge" tabIndex={-1} aria-hidden="true"><Image src="/images/challenge-cover.webp" alt="" fill sizes="(max-width: 1080px) 100vw, 900px" style={{ objectFit: "cover", objectPosition: "center 60%" }}/></Link><Link className="activity-title" href="/activities/ai-robot-challenge"><h3>AI 로봇챌린지</h3></Link><p>팀으로 만들고, 현장에서 검증하며 쌓은 경험.</p></article></section>}
  </>;
}
