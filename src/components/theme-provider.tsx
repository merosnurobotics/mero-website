"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light" as "light" | "dark", toggle: () => {} });
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("mero-theme"); } catch {}
      const selected = saved === "dark" || saved === "light" ? saved : media.matches ? "dark" : "light";
      document.documentElement.dataset.theme = selected; setTheme(selected);
    };
    apply(); media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  const toggle = () => {
    const selected = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = selected; setTheme(selected);
    try { localStorage.setItem("mero-theme", selected); } catch {}
  };
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { return useContext(ThemeContext); }
