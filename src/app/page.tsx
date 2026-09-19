"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowIcon } from "@/components/Icons";
import { periodRank, projects, site, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function Home() {
  const { t } = useLang();
  // Feature the 3 most recent projects (newest first).
  const featuredProjects = [...projects]
    .sort((a, b) => periodRank(b.period.en) - periodRank(a.period.en))
    .slice(0, 3);

  return (
    <>
      <Navbar />
      <main id="top" className="relative flex-1">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div
            className="glow absolute inset-0"
            style={{ ["--x" as string]: "50%", ["--y" as string]: "10%" }}
          />
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />

          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 text-center">
            <span className="fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-2" />
              {t(ui.hero.badge)}
            </span>

            <h1 className="fade-up mx-auto mt-8 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
              {t(ui.hero.headlineA)}{" "}
              <span className="text-gradient">{t(ui.hero.headlineHighlight)}</span>
              {t(ui.hero.headlineB)}
              <br />
              <span className="text-gradient">{site.name}</span>
            </h1>

            <p className="fade-up mx-auto mt-6 max-w-2xl text-lg text-white/60">
              {t(site.tagline)}
            </p>

            <div className="fade-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/support"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                {t(ui.hero.ctaPrimary)}
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                {t(ui.hero.ctaSecondary)}
              </Link>
            </div>

            {/* Stats */}
            <div className="fade-up mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
              {site.stats.map((s) => (
                <div key={s.value}>
                  <div className="text-3xl font-black text-gradient sm:text-4xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-white/50">{t(s.label)}</div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="fade-up mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card group flex items-center justify-between rounded-xl px-5 py-4 text-left text-sm font-semibold transition-colors hover:border-white/40"
                >
                  {t(item.label)}
                  <ArrowIcon className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FEATURED PROJECTS ================= */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-sm uppercase tracking-widest text-accent-2">
                {t(ui.hero.featuredEyebrow)}
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                {t(ui.hero.featuredTitle)}
              </h2>
            </div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              {t(ui.hero.viewAll)}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredProjects.map((p) => (
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
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
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
                  <h3 className="mt-4 text-lg font-bold">{t(p.title)}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/60">
                    {t(p.desc)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
