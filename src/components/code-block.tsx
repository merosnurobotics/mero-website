"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { highlightCode } from "@/lib/highlight";
import { Check, Copy } from "./icons";
import { tr } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
export function CodeBlock({ code, label: labelProp, language }: { code: string; label?: string; language?: string }) {
  const { locale } = useLocale(); const t = (ko: string, en: string) => tr(locale, ko, en); const label = labelProp ?? t("터미널 명령어", "Terminal command");
  const highlighted = useMemo(() => highlightCode(code, language, label), [code, language, label]);
  const [copied, setCopied] = useState(false); const [error, setError] = useState(""); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    setError("");
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(code);
      else {
        const field = document.createElement("textarea"); field.value = code; field.style.position = "fixed"; field.style.opacity = "0"; document.body.append(field); field.select();
        const ok = document.execCommand("copy"); field.remove(); if (!ok) throw new Error("copy unavailable");
      }
      setCopied(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 2000);
    } catch { setError(t("자동 복사를 사용할 수 없습니다. 명령어를 직접 선택해 복사해 주세요.", "Automatic copy isn't available. Please select and copy the command manually.")); }
  }
  return <div className="code-block"><div className="code-header"><span>{label}</span><button className="icon-button" onClick={copy} aria-label={t(`${label} 복사`, `Copy ${label}`)}>{copied ? <Check size={14}/> : <Copy size={14}/>}<span role="status">{copied ? t("복사됨", "Copied") : t("복사", "Copy")}</span></button></div><pre><code className={`hljs language-${highlighted.language}`} dangerouslySetInnerHTML={{ __html: highlighted.html }}/></pre>{error && <p className="code-copy-error" role="alert">{error}</p>}</div>;
}
