"use client";

import PageShell from "@/components/PageShell";
import { MailIcon, MapPinIcon } from "@/components/Icons";
import { contact, sponsors, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function SupportPage() {
  const { t } = useLang();
  return (
    <PageShell
      eyebrow={t(ui.support.eyebrow)}
      title={t(ui.support.title)}
      description={t(ui.support.description)}
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 p-10 text-center sm:p-16">
        <div className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />
        <div className="relative">
          <h2 className="text-2xl font-black sm:text-3xl">
            {t(ui.support.getInTouchA)}{" "}
            <span className="text-gradient">{t(ui.support.getInTouchHighlight)}</span>{" "}
            {t(ui.support.getInTouchB)}
          </h2>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              <MailIcon className="h-4 w-4" />
              {contact.email}
            </a>
            <span className="inline-flex items-center gap-2 text-sm text-white/60">
              <MapPinIcon className="h-4 w-4 text-accent-2" />
              {t(contact.location)}
            </span>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            {contact.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Honor & Sponsors */}
      <section className="mt-16">
        <div className="text-center">
          <h2 className="text-xl font-black sm:text-2xl">
            {t(ui.support.sponsorsTitle)}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">
            {t(ui.support.sponsorsDesc)}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {sponsors.map((s) => {
            const inner = (
              <div className="card flex h-24 items-center justify-center rounded-2xl p-5 transition-colors group-hover:border-white/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.logo}
                  alt={s.name}
                  className="max-h-12 w-auto max-w-full opacity-80 transition-opacity group-hover:opacity-100"
                />
              </div>
            );
            return s.href ? (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group block"
              >
                {inner}
              </a>
            ) : (
              <div key={s.name} className="group">
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
