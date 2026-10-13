"use client";
import { useLocale } from "@/components/locale-provider";
import { tr } from "@/lib/i18n";
export default function Loading() { const { locale } = useLocale(); return <div className="container loading-page" aria-label={tr(locale, "페이지를 불러오는 중", "Loading page")} role="status"><div className="skeleton loading-title"/><div className="skeleton loading-subtitle"/><div className="skeleton loading-content"/><span className="sr-only">{tr(locale, "페이지를 불러오고 있습니다.", "Loading the page.")}</span></div>; }
