import { LessonAuthor } from "@/components/education/lesson-author";
import type { ReactNode } from "react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/shared";
import { requireEducationMember } from "@/lib/education/access";
import { LessonContext, LessonNavigation } from "./lesson-context";

export async function Lesson({ topic, topicPath, path, title, intro, repo, children }: { topic: string; topicPath: string; path: string; title: string; intro: string; repo: string; children: ReactNode }) {
  await requireEducationMember(path);
  return <><Breadcrumbs items={[{label:"교육",href:"/education"},{label:topic,href:topicPath},{label:title}]}/><article className="perception-lesson"><header className="perception-hero"><h1>{title}</h1><p>{intro}</p><LessonAuthor path={path}/><a className="button" href={`https://github.com/merosnurobotics/${repo}`}>실습 저장소 열기</a></header><LessonContext path={path}/>{children}</article><LessonNavigation path={path}/></>;
}
export function Chapter({ id, title, children }: { id: string; title: string; children: ReactNode }) { return <section id={id} className="perception-chapter"><h2>{title}</h2>{children}</section>; }
const dimensions: Record<string,[number,number]> = { "rustdesk-client.png":[874,632], "PID_varyingP.jpg":[591,458], "PID_Compensation_Animated.gif":[400,300] };
export function Figure({ src, alt, caption, width=900, height=560, credit }: { src: string; alt: string; caption: ReactNode; width?: number; height?: number; credit?: ReactNode }) {
  const native = dimensions[src.split("/").pop() || ""];
  return <figure><a href={src} target="_blank" rel="noreferrer" aria-label={`${alt} 크게 보기`}><Image unoptimized src={src} alt={alt} width={native?.[0] || width} height={native?.[1] || height} sizes="(max-width: 767px) 100vw, 900px" style={{width:"100%",height:"auto"}}/></a><figcaption>{caption}{credit && <span className="education-image-credit">{credit}</span>}</figcaption></figure>;
}
export function Check({ children }: { children: ReactNode }) { return <aside className="education-note">{children}</aside>; }
