import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { equipment } from "@/data/site";

// Prerender one page per equipment item.
export function generateStaticParams() {
  return equipment.map((e) => ({ slug: e.slug }));
}

export default async function EquipmentDetailPage({
  params,
}: PageProps<"/equipment/[slug]">) {
  const { slug } = await params;
  const item = equipment.find((e) => e.slug === slug);
  if (!item) notFound();

  return (
    <PageShell eyebrow={item.tag} title={item.name} description={item.model}>
      <Link
        href="/equipment"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Back to equipment
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
              {item.tag}
            </span>
            <span className="font-mono text-sm text-accent-2">
              ×{item.qty} available
            </span>
          </div>
          <p className="mt-5 leading-relaxed text-white/70">{item.detail}</p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-accent-2">
            Specs
          </h2>
          <dl className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
            {item.specs.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <dt className="text-white/50">{s.label}</dt>
                <dd className="text-white/80">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PageShell>
  );
}
