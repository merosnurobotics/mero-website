"use client";

import PageShell from "@/components/PageShell";
import { AboutIcon } from "@/components/Icons";
import { about, site, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function AboutPage() {
  const { t } = useLang();
  return (
    <PageShell
      eyebrow={t(ui.about.eyebrow)}
      title={t(ui.about.title)}
      description={t(site.description)}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {about.map((item) => (
          <div key={item.icon} className="card rounded-2xl p-7">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 text-accent-2">
              <AboutIcon name={item.icon} className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold">{t(item.title)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {t(item.desc)}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
