import PageShell from "@/components/PageShell";
import { MailIcon, MapPinIcon } from "@/components/Icons";
import { contact } from "@/data/site";

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Join"
      title="Ready to build with us?"
      description="Whatever your major or year, anyone who loves making things is welcome."
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent/10 via-transparent to-accent-2/10 p-10 text-center sm:p-16">
        <div className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />
        <div className="relative">
          <h2 className="text-2xl font-black sm:text-3xl">
            Get in <span className="text-gradient">touch</span> below
          </h2>

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
    </PageShell>
  );
}
