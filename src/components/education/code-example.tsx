"use client";
import { useMemo, useState } from "react";
import { highlightCode } from "@/lib/highlight";

export function CodeExample({ code, label, download, language }: { code: string; label: string; download?: string; language?: string }) {
  const [status, setStatus] = useState("");
  const highlighted = useMemo(() => highlightCode(code, language, label), [code, language, label]);
  async function copy() {
    try { await navigator.clipboard.writeText(code); setStatus("복사했습니다."); }
    catch { setStatus("코드를 선택해 직접 복사해주세요."); }
  }
  return <div className="education-code"><div className="education-code-toolbar"><span>{label}</span><div>{download && <a href={download} download>파일 다운로드</a>}<button type="button" onClick={copy} aria-label={`${label} 복사`}>복사</button></div></div><pre><code className={`hljs language-${highlighted.language}`} dangerouslySetInnerHTML={{ __html: highlighted.html }}/></pre><span className="education-copy-status" role="status">{status}</span></div>;
}
