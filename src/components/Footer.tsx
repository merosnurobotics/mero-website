import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-white/50 sm:flex-row">
        <div className="flex items-center gap-2 font-mono font-bold">
          <span className="grid h-6 w-6 place-items-center rounded bg-gradient-to-br from-accent to-accent-2 text-xs font-black text-black">
            M
          </span>
          <span className="text-gradient">{site.name}</span>
        </div>
        <p>
          © {new Date().getFullYear()} {site.name}. Build, experiment, together.
        </p>
      </div>
    </footer>
  );
}
