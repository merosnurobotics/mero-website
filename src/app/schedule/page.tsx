import PageShell from "@/components/PageShell";
import { schedule } from "@/data/site";

export default function SchedulePage() {
  return (
    <PageShell
      eyebrow="Schedule"
      title="Upcoming activities"
      description="From workshops to competition prep, check out this semester's key dates."
    >
      <div className="space-y-3">
        {schedule.map((s) => (
          <div
            key={s.title}
            className="card flex items-center gap-5 rounded-xl p-5"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20 font-mono text-sm font-bold text-white">
              {s.date}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{s.title}</h3>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {s.tag}
            </span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
