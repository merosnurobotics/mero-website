"use client";

import PageShell from "@/components/PageShell";
import Calendar from "@/components/Calendar";
import { ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function SchedulePage() {
  const { t } = useLang();

  return (
    <PageShell
      eyebrow={t(ui.schedule.eyebrow)}
      title={t(ui.schedule.title)}
      description={t(ui.schedule.description)}
    >
      <Calendar />
    </PageShell>
  );
}
