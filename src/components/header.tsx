"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, List, Moon, SignOut, Sun, UserCircle, X } from "./icons";
import { useTheme } from "./theme-provider";
import { api } from "@/lib/client-api";
import type { Member } from "@/lib/types";

const navigation = [{ href: "/about", label: "동아리 소개" }, { href: "/activities", label: "활동" }, { href: "/robots", label: "로봇 안내" }];
export function Header({ member }: { member: Member | null }) {
  const path = usePathname(); const router = useRouter(); const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function logout() {
    setBusy(true); setError("");
    try { await api("/api/auth/logout", "POST", {}); setOpen(false); router.push("/"); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "로그아웃하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <header className="site-header">
    <div className="container header-inner">
      <Link href="/" className="brand-lockup" aria-label="MERO SNU ROBOTICS CLUB 홈" onClick={() => setOpen(false)}><span className="mero-brand-mark" aria-hidden="true"/><span className="brand-word">MERO<small>SNU ROBOTICS CLUB</small></span></Link>
      <nav className="desktop-nav" aria-label="주 메뉴">
        {navigation.map(item => { const active = path.startsWith(item.href) || (item.href === "/activities" && path.startsWith("/projects")); return <Link href={item.href} key={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{item.label}</Link>; })}
      </nav>
      <div className="header-actions">
        <button type="button" className="icon-button theme-toggle" onClick={toggle} aria-label={theme === "light" ? "어두운 테마로 전환" : "밝은 테마로 전환"}>{theme === "light" ? <Moon size={19} /> : <Sun size={19} />}</button>
        {member ? <>
          {member.role === "admin" && <Link href="/admin" className="header-admin desktop-only">관리</Link>}
          <Link href="/account" className="header-account" aria-label="내 계정"><span className="desktop-only">{member.name.length > 8 ? member.name.slice(0, 8) : member.name} 님</span><UserCircle className="mobile-only" size={22}/></Link>
          <button className="icon-button desktop-only" onClick={logout} disabled={busy} aria-label="로그아웃"><SignOut size={19}/></button>
        </> : <><Link href="/login" className="header-login">로그인</Link><Link href="/signup" className="button button-small desktop-only">회원가입<ArrowUpRight size={16}/></Link></>}
        <button className="icon-button menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X size={24}/> : <List size={24}/>}</button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-nav container" aria-label="모바일 메뉴">
      {navigation.map(item => <Link href={item.href} key={item.href} onClick={() => setOpen(false)} aria-current={path.startsWith(item.href) || (item.href === "/activities" && path.startsWith("/projects")) ? "page" : undefined}>{item.label}<ArrowUpRight size={19}/></Link>)}
      {member?.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)}>동아리 관리<ArrowUpRight size={19}/></Link>}
      {member ? <button onClick={logout} disabled={busy}>로그아웃<SignOut size={19}/></button> : <Link href="/signup" onClick={() => setOpen(false)}>회원가입<ArrowRightLabel /></Link>}
    </nav>}
    {error && <p className="header-error" role="alert">{error}</p>}
  </header>;
}
function ArrowRightLabel() { return <ArrowUpRight size={19}/>; }
