import Navbar from "@/components/Navbar";
import { AboutIcon, ArrowIcon, MailIcon, MapPinIcon } from "@/components/Icons";
import {
  about,
  contact,
  equipment,
  events,
  projects,
  schedule,
  site,
} from "@/data/site";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="top" className="relative">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="glow absolute inset-0" style={{ ["--x" as string]: "50%", ["--y" as string]: "10%" }} />
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />

          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 text-center">
            <span className="fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-2" />
              신입 부원 모집 중 · {site.stats[3].value}년부터 함께
            </span>

            <h1 className="fade-up mx-auto mt-8 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
              아이디어를 <span className="text-gradient">현실</span>로<br />
              만드는 사람들, <span className="text-gradient">{site.name}</span>
            </h1>

            <p className="fade-up mx-auto mt-6 max-w-2xl text-lg text-white/60">
              {site.tagline}
            </p>

            <div className="fade-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                동아리 가입하기
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                프로젝트 둘러보기
              </a>
            </div>

            {/* 통계 */}
            <div className="fade-up mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-black text-gradient sm:text-4xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-white/50">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <Section id="about" eyebrow="소개" title="우리가 하는 일">
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
          <p className="mx-auto mt-10 max-w-3xl text-center text-white/60">
            {site.description}
          </p>
        </Section>

        {/* ================= EQUIPMENT ================= */}
        <Section id="equipment" eyebrow="보유 장비" title="무엇이든 만들 수 있는 환경">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {equipment.map((e) => (
              <div key={e.name} className="card rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
                    {e.tag}
                  </span>
                  <span className="font-mono text-sm text-accent-2">×{e.qty}</span>
                </div>
                <h3 className="mt-4 font-bold">{e.name}</h3>
                <p className="mt-1 text-xs text-white/50">{e.model}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ================= PROJECTS ================= */}
        <Section id="projects" eyebrow="프로젝트" title="지금 만들고 있는 것들">
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((p) => (
              <div key={p.title} className="card group rounded-2xl p-7">
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      p.status === "진행 중"
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
            ))}
          </div>
        </Section>

        {/* ================= EVENTS ================= */}
        <Section id="events" eyebrow="행사 · 대회" title="우리가 도전한 무대">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {events.map((ev, i) => (
              <div
                key={ev.name}
                className={`flex flex-col gap-2 px-6 py-5 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between ${
                  i !== events.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-accent-2">{ev.year}</span>
                  <span className="font-semibold">{ev.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{ev.place}</span>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                    {ev.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ================= SCHEDULE ================= */}
        <Section id="schedule" eyebrow="일정" title="다가오는 활동">
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
        </Section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl font-black sm:text-4xl">
                함께 만들 <span className="text-gradient">준비</span>됐나요?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/60">
                전공, 학년 상관없이 만드는 걸 좋아하는 사람이라면 누구나 환영합니다.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
                >
                  <MailIcon className="h-4 w-4" />
                  {contact.email}
                </a>
                <span className="inline-flex items-center gap-2 text-sm text-white/60">
                  <MapPinIcon className="h-4 w-4 text-accent-2" />
                  {contact.location}
                </span>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                {contact.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-white/50 sm:flex-row">
          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="grid h-6 w-6 place-items-center rounded bg-gradient-to-br from-accent to-accent-2 text-xs font-black text-black">
              M
            </span>
            <span className="text-gradient">{site.name}</span>
          </div>
          <p>© {new Date().getFullYear()} {site.name}. 만들고 실험하고 함께.</p>
        </div>
      </footer>
    </>
  );
}

// 섹션 공통 래퍼
function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
      <div className="mb-12 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-accent-2">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}
