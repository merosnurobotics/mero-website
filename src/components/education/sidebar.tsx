"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CaretDown } from "@/components/icons";
import { educationTopics } from "@/lib/education/catalog";
import { localizeTopic } from "@/lib/education/i18n";
import { tr } from "@/lib/i18n";
import { useLocale } from "@/components/locale-provider";

export function EducationSidebar() {
  const path = usePathname();
  const [hash, setHash] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale } = useLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => { window.removeEventListener("hashchange", update); window.removeEventListener("popstate", update); };
  }, [path]);
  return <aside className="education-sidebar">
    <button className="education-catalog-toggle" type="button" aria-controls="education-catalog" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{t("교육자료 목록", "Education contents")}<CaretDown size={17}/></button>
    <nav id="education-catalog" className={mobileOpen ? "" : "education-mobile-collapsed"} aria-label={t("교육자료 목록", "Education contents")}>
      <Link className="education-index-link" href="/education" aria-current={path === "/education" ? "page" : undefined}>{t("권장 학습 경로", "Recommended path")}</Link>
      <p className="education-browse-label">{t("분야별 찾아보기 · 입문에서 응용까지", "Browse by topic · intro to applied")}</p>
      {educationTopics.map(topic => {
        return <details open={path === topic.path || topic.lessons.some(lesson => path === lesson.path)} className="education-topic-tree" key={`${topic.path}:${path}`}>
          <summary>{localizeTopic(topic, locale).title}<span>{String(topic.lessons.length).padStart(2, "0")}</span></summary>
          <div className="education-tree-content">
            <Link href={topic.path} aria-current={path === topic.path ? "page" : undefined}>{t("시리즈 소개", "Series overview")}</Link>
            {topic.lessons.map((lesson, lessonIndex) => {
              const inLesson = path === lesson.path;
              return <details open={inLesson} className="education-lesson-tree" key={`${lesson.path}:${inLesson}`}>
                <summary>{String("number" in lesson ? lesson.number : lessonIndex + 1).padStart(2, "0")}. {lesson.shortTitle}</summary>
                <Link href={lesson.path} onClick={() => setHash("")} aria-current={inLesson && !hash ? "page" : undefined}>{lesson.label}</Link>
                <ol>{lesson.chapters.map((chapter, index) => <li key={chapter.id}><Link href={`${lesson.path}#${chapter.id}`} onClick={() => setHash(`#${chapter.id}`)} aria-current={inLesson && hash === `#${chapter.id}` ? "location" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{chapter.label}</Link></li>)}</ol>
              </details>;
            })}
          </div>
        </details>;
      })}
    </nav>
  </aside>;
}

/** Lesson bodies are Korean only for now; English readers get a short notice on every page except the landing page. */
export function EducationLanguageNotice() {
  const path = usePathname(); const { locale } = useLocale();
  if (locale !== "en" || path === "/education") return null;
  return <p className="education-language-notice">This material is currently available in Korean only.</p>;
}
