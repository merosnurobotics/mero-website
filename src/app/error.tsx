"use client";
import { WarningCircle } from "@/components/icons";
import { useLocale } from "@/components/locale-provider";
import { tr } from "@/lib/i18n";
export default function ErrorPage({ reset }: { reset: () => void }) { const { locale } = useLocale(); const t = (ko: string, en: string) => tr(locale, ko, en); return <div className="container not-found"><WarningCircle size={45} color="var(--accent)"/><h1>{t("페이지를 불러오지 못했어요.", "We couldn't load this page.")}</h1><p>{t("잠시 후 다시 시도해 주세요.", "Please try again in a moment.")}</p><button className="button" onClick={reset}>{t("다시 시도", "Try again")}</button></div>; }
