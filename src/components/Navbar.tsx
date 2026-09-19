"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { useLang } from "@/components/LanguageProvider";

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/15 p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "en" ? "bg-white text-black" : "text-white/60 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ko")}
        aria-pressed={lang === "ko"}
        className={`rounded-full px-2.5 py-1 transition-colors ${
          lang === "ko" ? "bg-white text-black" : "text-white/60 hover:text-white"
        }`}
      >
        한국어
      </button>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-background/80 backdrop-blur-lg"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center px-6 py-4">
        {/* Logo — left */}
        <div className="flex-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-lg font-bold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-black text-black">
              M
            </span>
            <span className="text-gradient">{site.name}</span>
          </Link>
        </div>

        {/* Desktop menu — centered in the bar */}
        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm transition-colors ${
                    active ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {t(item.label)}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle — centered on mobile */}
        <button
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 md:hidden"
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>

        {/* Right side — language toggle (desktop), balances the logo to keep the menu centered */}
        <div className="flex flex-1 justify-end">
          <LangToggle className="hidden md:inline-flex" />
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-background/95 px-6 py-4 md:hidden">
          <ul className="flex flex-col items-center gap-4 text-center">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="block text-white/80 hover:text-white"
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <LangToggle />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
