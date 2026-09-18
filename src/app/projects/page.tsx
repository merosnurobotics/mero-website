import Link from "next/link";
import PageShell from "@/components/PageShell";
import { projects } from "@/data/site";

export default function ProjectsPage() {
  return (
    <PageShell
      eyebrow="Projects"
      title="What we're building now"
      description="Every semester we form teams and turn ideas into working results."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="card group flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.status === "In progress"
                      ? "bg-accent-2/15 text-accent-2"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-xs text-white/40">{p.period}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {p.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
