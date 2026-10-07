"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "./icons";
import { api } from "@/lib/client-api";
import type { Member } from "@/lib/types";

export function PasswordField({ name, label, autoComplete = "current-password", minLength, required = true }: { name: string; label: string; autoComplete?: string; minLength?: number; required?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="form-field"><label htmlFor={name}>{label}</label><div className="password-input"><input id={name} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} maxLength={128} required={required}/><button type="button" className="icon-button" style={{ fontSize: 11 }} onClick={() => setVisible(!visible)} aria-label={visible ? `${label} 숨기기` : `${label} 보기`} aria-pressed={visible}>{visible ? "숨김" : "보기"}</button></div></div>;
}
export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const signup = mode === "signup"; const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (signup && password !== data.get("confirm-password")) { setError("비밀번호 확인이 일치하지 않습니다."); return; }
    setBusy(true);
    try {
      const result = await api<{ member: Member }>(`/api/auth/${mode}`, "POST", {
        email: String(data.get("email")).trim(), password,
        ...(signup ? { name: data.get("name"), department: data.get("department"), consent: data.get("consent") === "on" } : {}),
      });
      const target = signup ? "/account" : next || (result.member.role === "admin" ? "/admin" : "/account");
      router.push(target); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "다시 시도해 주세요."); setBusy(false); }
  }
  return <div className="auth-form-wrap"><h2>{signup ? "MERO 회원가입" : "로그인"}</h2><p className="auth-form-description">{signup ? "가입 후 운영진의 승인을 거쳐 활동 회원이 됩니다." : next?.startsWith("/education") ? "회원 로그인 후 교육자료를 이어서 볼 수 있습니다." : "교육자료와 로봇 운용 안내를 확인하세요."}</p>
    <form className="auth-form" onSubmit={submit} aria-describedby={error ? "auth-form-error" : undefined}>
      {signup && <><div className="form-field"><label htmlFor="name">이름</label><input id="name" name="name" autoComplete="name" placeholder="이름을 입력해 주세요" minLength={2} maxLength={40} required/></div><div className="form-field"><label htmlFor="department">소속 / 학과 <span style={{ color: "var(--muted)", fontWeight: 400 }}>(선택)</span></label><input id="department" name="department" autoComplete="organization" placeholder="예: 서울대학교 기계공학부" maxLength={80}/></div></>}
      <div className="form-field"><label htmlFor="email">이메일</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required/></div>
      <PasswordField name="password" label="비밀번호" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 10 : undefined}/>
      {signup && <><p className="auth-note" style={{ marginTop: -12 }}>비밀번호는 10자 이상으로 입력해 주세요.</p><PasswordField name="confirm-password" label="비밀번호 확인" autoComplete="new-password" minLength={10}/><label className="checkbox-field"><input type="checkbox" name="consent" required/><span>회원 확인과 관리를 위한 이름·이메일 수집에 동의합니다. <Link href="/privacy" target="_blank">개인정보 안내</Link></span></label></>}
      {error && <p id="auth-form-error" className="form-error" role="alert">{error}</p>}
      <button className="button button-full" type="submit" disabled={busy} aria-busy={busy}>{busy ? signup ? "가입 처리 중…" : "로그인 중…" : signup ? "회원가입" : "로그인"}{!busy && <ArrowRight size={18}/>}</button>
    </form>
    <p className="auth-switch">{signup ? "이미 회원이신가요?" : "아직 MERO 회원이 아니신가요?"}<Link href={signup ? `/login${next ? `?next=${encodeURIComponent(next)}` : ""}` : "/signup"}>{signup ? "로그인" : "회원가입"}</Link></p>
    {!signup && <p className="auth-note">비밀번호를 잊으셨다면 MERO 운영진에게 문의해 주세요.</p>}
  </div>;
}
