"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "./icons";
import { RobotArt } from "./shared";
import type { Project } from "@/lib/types";
export function HistoryTimeline({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("전체");
  return <><div className="history-filter"><div className="filter-tabs" aria-label="활동 학기 필터">{["전체", "2026-2", "2026-1"].map(value => <button key={value} className={filter === value ? "selected" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "전체" ? "전체 기록" : `${value}학기`}</button>)}</div></div>
    {filter !== "2026-1" && <section className="timeline-group"><div className="timeline-label"><h2>2026-2</h2><p>이번 학기의 새로운 도전</p><span>프로젝트 진행 중</span></div><div className="timeline-projects">{projects.map(project => <Link key={project.id} href={`/projects/${project.id}`}><RobotArt project={project}/><div><h3>{project.title}</h3><p>{project.summary}</p></div><ArrowUpRight size={21}/></Link>)}</div></section>}
    {filter !== "2026-2" && <section className="timeline-group"><div className="timeline-label"><h2>2026-1</h2><p>함께 만들고 도전한 한 학기</p><span>지난 학기 활동</span></div><article className="timeline-activity"><Link className="timeline-activity-image" href="/activities/ai-robot-challenge" style={{ display: "block" }}><Image src="/images/challenge-cover.webp" alt="AI 로봇챌린지에 함께한 MERO 팀" fill sizes="(max-width: 767px) 100vw, 850px" style={{ objectFit: "cover" }}/></Link><Link className="activity-title" href="/activities/ai-robot-challenge"><h3>AI 로봇챌린지</h3><ArrowUpRight size={23}/></Link><p>현장 사진, 스케치 영상과 관련 기사를 모았습니다.</p></article></section>}
  </>;
}
