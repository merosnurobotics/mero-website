import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { projects } from "@/data/site";

// Prerender one page per project.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <PageShell
      eyebrow={project.period}
      title={project.title}
      description={project.desc}
    >
      <Link
        href="/projects"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        ← Back to projects
      </Link>

      <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
              project.status === "In progress"
                ? "bg-accent-2/15 text-accent-2"
                : "bg-white/10 text-white/60"
            }`}
          >
            {project.status}
          </span>
          <p className="mt-5 leading-relaxed text-white/70">{project.detail}</p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-accent-2">
            Highlights
          </h2>
          <ul className="mt-4 space-y-2">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-white/70">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="card rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-white/40">
              Team
            </h3>
            <p className="mt-2 text-sm text-white/80">{project.team}</p>
          </div>
          <div className="card rounded-2xl p-5">
            <h3 className="text-xs uppercase tracking-widest text-white/40">
              Tech
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
