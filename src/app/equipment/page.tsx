"use client";

import Link from "next/link";
import PageShell from "@/components/PageShell";
import { equipment, ui } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

export default function EquipmentPage() {
  const { t } = useLang();
  return (
    <PageShell
      eyebrow={t(ui.equipment.eyebrow)}
      title={t(ui.equipment.title)}
      description={t(ui.equipment.description)}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {equipment.map((e) => (
          <Link
            key={e.slug}
            href={`/equipment/${e.slug}`}
            className="card group flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="aspect-[16/10] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.image}
                alt={t(e.name)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
                  {t(e.tag)}
                </span>
                <span className="font-mono text-sm text-accent-2">×{e.qty}</span>
              </div>
              <h3 className="mt-4 font-bold">{t(e.name)}</h3>
              <p className="mt-1 text-xs text-white/50">{t(e.model)}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
