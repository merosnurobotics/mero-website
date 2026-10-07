"use client";
import { WarningCircle } from "@/components/icons";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container not-found"><WarningCircle size={45} style={{ marginInline: "auto", color: "var(--accent)" }}/><h1>페이지를 불러오지 못했어요.</h1><p>잠시 후 다시 시도해 주세요.</p><button className="button" onClick={reset}>다시 시도</button></div>; }
