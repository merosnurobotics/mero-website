import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="relative flex-1">
        {/* Page header */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[130px]" />
          <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-36 text-center">
            <p className="fade-up font-mono text-sm uppercase tracking-widest text-accent-2">
              {eyebrow}
            </p>
            <h1 className="fade-up mt-3 text-4xl font-black sm:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="fade-up mx-auto mt-4 max-w-2xl text-white/60">
                {description}
              </p>
            )}
          </div>
        </section>

        {/* Page body */}
        <div className="mx-auto max-w-6xl px-6 py-16">{children}</div>
      </main>
      <Footer />
    </>
  );
}
