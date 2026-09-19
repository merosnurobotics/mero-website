"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import { projects, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function ProjectsPage() {
  const { t } = useLang();
  return (
    <PageShell
      eyebrow={t(ui.projects.eyebrow)}
      title={t(ui.projects.title)}
      description={t(ui.projects.description)}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="card group flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={t(p.title)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.status === "in-progress"
                      ? "bg-accent-2/15 text-accent-2"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {p.status === "in-progress"
                    ? t(ui.projects.inProgress)
                    : t(ui.projects.completed)}
                </span>
                <span className="text-xs text-white/40">{t(p.period)}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{t(p.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {t(p.desc)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
