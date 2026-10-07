"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordField } from "./auth-form";
import { api } from "@/lib/client-api";
import { Clock, ShieldCheck } from "./icons";
import type { Member } from "@/lib/types";
export function AccountForms({ member }: { member: Member }) {
  const router = useRouter(); const [busy, setBusy] = useState(""); const [feedback, setFeedback] = useState<{ kind: string; error?: string; success?: string }>({ kind: "" });
  async function submit(event: React.FormEvent<HTMLFormElement>, kind: "profile" | "password") {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setFeedback({ kind });
    if (kind === "password" && data.get("new-password") !== data.get("confirm-new-password")) { setFeedback({ kind, error: "새 비밀번호 확인이 일치하지 않습니다." }); return; }
    setBusy(kind);
    try {
      await api(kind === "profile" ? "/api/me" : "/api/auth/password", kind === "profile" ? "PATCH" : "POST", kind === "profile" ? { name: data.get("profile-name"), department: data.get("profile-department") } : { current: data.get("current-password"), password: data.get("new-password") });
      setFeedback({ kind, success: kind === "profile" ? "회원 정보를 저장했습니다." : "비밀번호를 변경했습니다. 다른 기기의 로그인은 해제됩니다." });
      if (kind === "password") form.reset(); router.refresh();
    } catch (err) { setFeedback({ kind, error: err instanceof Error ? err.message : "다시 시도해 주세요." }); }
    finally { setBusy(""); }
  }
  function message(kind: string) { return feedback.kind === kind && (feedback.error ? <p className="form-error" role="alert">{feedback.error}</p> : feedback.success ? <p className="form-success" role="status">{feedback.success}</p> : null); }
  return <div className="account-forms"><div className="info-notice">{member.status === "pending" ? <Clock size={22}/> : <ShieldCheck size={22}/>}<p>{member.status === "pending" ? "가입이 완료되었습니다. 운영진이 회원을 승인하면 로봇별 접속 설정과 운용 설명서를 이용할 수 있습니다." : "활동 회원으로 승인되었습니다. QR 안내 페이지에서 SSH 접속 설정과 로봇 운용 설명서를 확인할 수 있습니다."}</p></div>
    <form className="account-form-section" onSubmit={event => submit(event, "profile")}><h2>회원 정보</h2><div className="form-grid"><div className="form-field"><label htmlFor="profile-name">이름</label><input id="profile-name" name="profile-name" defaultValue={member.name} autoComplete="name" required minLength={2} maxLength={40}/></div><div className="form-field"><label htmlFor="profile-department">소속 / 학과</label><input id="profile-department" name="profile-department" defaultValue={member.department} maxLength={80}/></div><div className="form-field full-width"><label htmlFor="profile-email">이메일</label><input id="profile-email" value={member.email} disabled/><small>로그인 이메일 변경은 동아리 운영진에게 문의해 주세요.</small></div></div><div style={{ marginTop: 20 }}>{message("profile")}</div><div className="form-actions"><button className="button button-small" type="submit" disabled={Boolean(busy)}>{busy === "profile" ? "저장 중…" : "회원 정보 저장"}</button></div></form>
    <form className="account-form-section" onSubmit={event => submit(event, "password")}><h2>비밀번호 변경</h2><div className="form-grid"><div className="full-width"><PasswordField name="current-password" label="현재 비밀번호"/></div><PasswordField name="new-password" label="새 비밀번호" autoComplete="new-password" minLength={10}/><PasswordField name="confirm-new-password" label="새 비밀번호 확인" autoComplete="new-password" minLength={10}/></div><p className="auth-note">새 비밀번호는 10자 이상으로 입력해 주세요.</p><div style={{ marginTop: 20 }}>{message("password")}</div><div className="form-actions"><button className="button button-small" type="submit" disabled={Boolean(busy)}>{busy === "password" ? "변경 중…" : "비밀번호 변경"}</button></div></form>
  </div>;
}
