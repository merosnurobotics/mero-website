"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { events, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function EventDetail({ slug }: { slug: string }) {
  const { t } = useLang();
  const event = events.find((ev) => ev.slug === slug);
  if (!event) notFound();

  return (
    <PageShell
      eyebrow={`${event.year} · ${t(event.place)}`}
      title={t(event.name)}
      description={t(event.result)}
    >
      <Link
        href="/events"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        {t(ui.events.back)}
      </Link>

      <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={t(event.name)}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span className="font-mono text-accent-2">{event.year}</span>
          <span>{t(event.place)}</span>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
            {t(event.result)}
          </span>
        </div>
        <p className="mt-5 leading-relaxed text-white/70">{t(event.detail)}</p>
      </div>

      {event.gallery.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent-2">
            {t(ui.events.gallery)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {event.gallery.map((src, i) => (
              <div
                key={src}
                className="aspect-[16/9] overflow-hidden rounded-xl border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${t(event.name)} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
