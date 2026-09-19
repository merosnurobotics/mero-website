"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Lang, LocalizedText } from "@/data/site";

const COOKIE_NAME = "lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  // Convenience: pick the current language out of a { en, ko } value.
  t: (value: LocalizedText) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readCookieLang(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)lang=(en|ko)/);
  return (match?.[1] as Lang) ?? null;
}

function writeCookie(lang: Lang) {
  document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  // Initialize from the client-side preference when available, falling back to
  // the server-provided value (read from the same cookie during SSR). Using a
  // lazy initializer avoids a setState-in-effect and keeps the first client
  // render consistent with the stored choice.
  const [lang, setLangState] = useState<Lang>(() => {
    const stored =
      readCookieLang() ??
      (typeof localStorage !== "undefined"
        ? (localStorage.getItem(COOKIE_NAME) as Lang | null)
        : null);
    return stored ?? initialLang;
  });

  // Keep the <html lang> attribute in sync for accessibility/SEO.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeCookie(next);
    try {
      localStorage.setItem(COOKIE_NAME, next);
    } catch {
      // localStorage may be unavailable (private mode); cookie still works.
    }
    document.documentElement.lang = next;
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "en" ? "ko" : "en");
  }, [lang, setLang]);

  const t = useCallback((value: LocalizedText) => value[lang], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used within a LanguageProvider");
  }
  return ctx;
}
