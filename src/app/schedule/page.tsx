"use client";

import PageShell from "@/components/PageShell";
import { schedule, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function SchedulePage() {
  const { t } = useLang();
  return (
    <PageShell
      eyebrow={t(ui.schedule.eyebrow)}
      title={t(ui.schedule.title)}
      description={t(ui.schedule.description)}
    >
      <div className="space-y-3">
        {schedule.map((s) => (
          <div
            key={s.date}
            className="card flex items-center gap-5 rounded-xl p-5"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 font-mono text-sm font-bold text-white">
              {s.date}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{t(s.title)}</h3>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {t(s.tag)}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
