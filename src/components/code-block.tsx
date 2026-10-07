"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "./icons";
export function CodeBlock({ code, label = "터미널 명령어" }: { code: string; label?: string }) {
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
    } catch { setError("자동 복사를 사용할 수 없습니다. 명령어를 직접 선택해 복사해 주세요."); }
  }
  return <div className="code-block"><div className="code-header"><span>{label}</span><button className="icon-button" onClick={copy} aria-label={`${label} 복사`}>{copied ? <Check size={14}/> : <Copy size={14}/>}<span role="status">{copied ? "복사됨" : "복사"}</span></button></div><pre><code>{code}</code></pre>{error && <p className="code-copy-error" role="alert">{error}</p>}</div>;
}
