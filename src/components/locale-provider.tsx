"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; pending: boolean }>({ locale: "ko", setLocale: () => {}, pending: false });
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  const setLocale = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    startTransition(() => router.refresh());
  };
  return <LocaleContext.Provider value={{ locale, setLocale, pending }}>{children}</LocaleContext.Provider>;
}
export function useLocale() { return useContext(LocaleContext); }
