"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import { events, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function EventsPage() {
  const { t } = useLang();
  // Show the most recent events first (sorted by year, newest on top).
  const sortedEvents = [...events].sort((a, b) => Number(b.year) - Number(a.year));
  return (
    <PageShell
      eyebrow={t(ui.events.eyebrow)}
      title={t(ui.events.title)}
      description={t(ui.events.description)}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {sortedEvents.map((ev) => (
          <Link
            key={ev.slug}
            href={`/events/${ev.slug}`}
            className="card group flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ev.image}
                alt={t(ev.name)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 font-mono text-xs text-accent-2 backdrop-blur">
                {ev.year}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-semibold">{t(ev.name)}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span>{t(ev.place)}</span>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                  {t(ev.result)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
