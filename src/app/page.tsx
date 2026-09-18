import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowIcon } from "@/components/Icons";
import { site } from "@/data/site";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="top" className="relative flex-1">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div
            className="glow absolute inset-0"
            style={{ ["--x" as string]: "50%", ["--y" as string]: "10%" }}
          />
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]" />

          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 text-center">
            <span className="fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent-2" />
              Now recruiting new members · together since {site.stats[3].value}
            </span>

            <h1 className="fade-up mx-auto mt-8 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
              People who turn ideas into <span className="text-gradient">reality</span>,<br />
              this is <span className="text-gradient">{site.name}</span>
            </h1>

            <p className="fade-up mx-auto mt-6 max-w-2xl text-lg text-white/60">
              {site.tagline}
            </p>

            <div className="fade-up mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                Join the club
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                Browse projects
              </Link>
            </div>

            {/* Stats */}
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

            {/* Quick links */}
            <div className="fade-up mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
              {site.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="card group flex items-center justify-between rounded-xl px-5 py-4 text-left text-sm font-semibold transition-colors hover:border-white/40"
                >
                  {item.label}
                  <ArrowIcon className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
