// Site language. The choice lives in a cookie so URLs stay the same and server pages render in the chosen language.
export type Locale = "ko" | "en";
export const LOCALE_COOKIE = "mero-lang";
export const toLocale = (value: string | undefined | null): Locale => value === "en" ? "en" : "ko";
/** Pick the string for the current locale: `tr(locale, "한국어", "English")`. */
export const tr = <T,>(locale: Locale, ko: T, en: T): T => locale === "en" ? en : ko;
