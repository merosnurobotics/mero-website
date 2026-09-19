"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { equipment, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function EquipmentDetail({ slug }: { slug: string }) {
  const { t } = useLang();
  const item = equipment.find((e) => e.slug === slug);
  if (!item) notFound();

  return (
    <PageShell eyebrow={t(item.tag)} title={t(item.name)} description={t(item.model)}>
      <Link
        href="/equipment"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        {t(ui.equipment.back)}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={t(item.name)}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
              {t(item.tag)}
            </span>
            <span className="font-mono text-sm text-accent-2">
              ×{item.qty} {t(ui.equipment.available)}
            </span>
          </div>
          <p className="mt-5 leading-relaxed text-white/70">{t(item.detail)}</p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-accent-2">
            {t(ui.equipment.specs)}
          </h2>
          <dl className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
            {item.specs.map((s) => (
              <div
                key={s.label.en}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <dt className="text-white/50">{t(s.label)}</dt>
                <dd className="text-white/80">{t(s.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PageShell>
  );
}
