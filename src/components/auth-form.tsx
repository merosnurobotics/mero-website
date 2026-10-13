"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { tr } from "@/lib/i18n";
import { useLocale } from "./locale-provider";
import type { Member } from "@/lib/types";

export function PasswordField({ name, label, autoComplete = "current-password", minLength, required = true }: { name: string; label: string; autoComplete?: string; minLength?: number; required?: boolean }) {
  const [visible, setVisible] = useState(false); const { locale } = useLocale();
  return <div className="form-field"><label htmlFor={name}>{label}</label><div className="password-input"><input id={name} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} maxLength={128} required={required}/><button type="button" className="icon-button" style={{ fontSize: 11 }} onClick={() => setVisible(!visible)} aria-label={visible ? tr(locale, `${label} 숨기기`, `Hide ${label.toLowerCase()}`) : tr(locale, `${label} 보기`, `Show ${label.toLowerCase()}`)} aria-pressed={visible}>{visible ? tr(locale, "숨김", "Hide") : tr(locale, "보기", "Show")}</button></div></div>;
}
export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const signup = mode === "signup"; const router = useRouter(); const { locale } = useLocale();
  const t = (ko: string, en: string) => tr(locale, ko, en);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (signup && password !== data.get("confirm-password")) { setError(t("비밀번호 확인이 일치하지 않습니다.", "The passwords do not match.")); return; }
    setBusy(true);
    try {
      const result = await api<{ member: Member }>(`/api/auth/${mode}`, "POST", {
        email: String(data.get("email")).trim(), password,
        ...(signup ? { name: data.get("name"), department: data.get("department"), consent: data.get("consent") === "on" } : {}),
      });
      const target = signup ? "/account" : next || (result.member.role === "admin" ? "/admin" : "/account");
      router.push(target); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : t("다시 시도해 주세요.", "Please try again.")); setBusy(false); }
  }
  return <div className="auth-form-wrap"><h2>{signup ? t("MERO 회원가입", "Join MERO") : t("로그인", "Log in")}</h2><p className="auth-form-description">{signup ? t("가입 후 운영진의 승인을 거쳐 활동 회원이 됩니다.", "After you sign up, you become an active member once the club officers approve your account.") : next?.startsWith("/education") ? t("회원 로그인 후 교육자료를 이어서 볼 수 있습니다.", "Log in as a member to continue with the learning materials.") : t("교육자료와 로봇 운용 안내를 확인하세요.", "Access learning materials and robot operating guides.")}</p>
    <form className="auth-form" onSubmit={submit} aria-describedby={error ? "auth-form-error" : undefined}>
      {signup && <><div className="form-field"><label htmlFor="name">{t("이름", "Name")}</label><input id="name" name="name" autoComplete="name" placeholder={t("이름을 입력해 주세요", "Enter your name")} minLength={2} maxLength={40} required/></div><div className="form-field"><label htmlFor="department">{t("소속 / 학과", "Affiliation / Department")} <span style={{ color: "var(--muted)", fontWeight: 400 }}>{t("(선택)", "(optional)")}</span></label><input id="department" name="department" autoComplete="organization" placeholder={t("예: 서울대학교 기계공학부", "e.g. SNU Department of Mechanical Engineering")} maxLength={80}/></div></>}
      <div className="form-field"><label htmlFor="email">{t("이메일", "Email")}</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required/></div>
      <PasswordField name="password" label={t("비밀번호", "Password")} autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 10 : undefined}/>
      {signup && <><p className="auth-note" style={{ marginTop: -12 }}>{t("비밀번호는 10자 이상으로 입력해 주세요.", "Use at least 10 characters for your password.")}</p><PasswordField name="confirm-password" label={t("비밀번호 확인", "Confirm password")} autoComplete="new-password" minLength={10}/><label className="checkbox-field"><input type="checkbox" name="consent" required/><span>{t("회원 확인과 관리를 위한 이름·이메일 수집에 동의합니다. ", "I agree to the collection of my name and email for member verification and management. ")}<Link href="/privacy" target="_blank">{t("개인정보 안내", "Privacy notice")}</Link></span></label></>}
      {error && <p id="auth-form-error" className="form-error" role="alert">{error}</p>}
      <button className="button button-full" type="submit" disabled={busy} aria-busy={busy}>{busy ? signup ? t("가입 처리 중…", "Signing up…") : t("로그인 중…", "Logging in…") : signup ? t("회원가입", "Sign up") : t("로그인", "Log in")}</button>
    </form>
    <p className="auth-switch">{signup ? t("이미 회원이신가요?", "Already a member?") : t("아직 MERO 회원이 아니신가요?", "Not a MERO member yet?")}<Link href={signup ? `/login${next ? `?next=${encodeURIComponent(next)}` : ""}` : "/signup"}>{signup ? t("로그인", "Log in") : t("회원가입", "Sign up")}</Link></p>
    {!signup && <p className="auth-note">{t("비밀번호를 잊으셨다면 MERO 운영진에게 문의해 주세요.", "Forgot your password? Please contact the MERO officers.")}</p>}
  </div>;
}
