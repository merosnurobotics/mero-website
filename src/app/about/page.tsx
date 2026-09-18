import PageShell from "@/components/PageShell";
import { AboutIcon } from "@/components/Icons";
import { about, site } from "@/data/site";

export default function AboutPage() {
  return (
    <PageShell eyebrow="About" title="What we do" description={site.description}>
      <div className="grid gap-6 md:grid-cols-3">
        {about.map((item) => (
          <div key={item.title} className="card rounded-2xl p-7">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 text-accent-2">
              <AboutIcon name={item.icon} className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
