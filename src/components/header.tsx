"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { List, Moon, SignOut, Sun, UserCircle, X } from "./icons";
import { useTheme } from "./theme-provider";
import { api } from "@/lib/client-api";
import type { Member } from "@/lib/types";

const navigation = [{ href: "/about", label: "동아리 소개" }, { href: "/activities", label: "활동" }, { href: "/education", label: "교육" }, { href: "/robots", label: "로봇 안내" }];
// Pages that open with a full-bleed photo hero; the header floats over it until it scrolls away.
const photoHeroPath = (path: string) => path === "/" || path === "/about" || path.startsWith("/activities");
// On the home page the header stays out of the way until the visitor scrolls a little.
const revealOnScrollPath = (path: string) => path === "/";
const REVEAL_SCROLL_Y = 80;
const isActive = (path: string, href: string) => path.startsWith(href) || (href === "/activities" && path.startsWith("/projects"));

export function Header({ member }: { member: Member | null }) {
  const path = usePathname(); const router = useRouter(); const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [overPhoto, setOverPhoto] = useState(() => photoHeroPath(path));
  useEffect(() => {
    const hero = document.querySelector("[data-photo-hero]");
    if (!hero || !("IntersectionObserver" in window)) { setOverPhoto(false); return; }
    const height = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 68;
    const observer = new IntersectionObserver(([entry]) => setOverPhoto(entry.isIntersecting), { rootMargin: `-${height}px 0px 0px 0px` });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [path]);
  const [hiddenAtTop, setHiddenAtTop] = useState(() => revealOnScrollPath(path));
  useEffect(() => {
    if (!revealOnScrollPath(path)) { setHiddenAtTop(false); return; }
    const update = () => setHiddenAtTop(window.scrollY < REVEAL_SCROLL_Y);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [path]);
  async function logout() {
    setBusy(true); setError("");
    try { await api("/api/auth/logout", "POST", {}); setOpen(false); router.push("/"); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "로그아웃하지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <header className={`site-header${overPhoto && !open ? " over-photo" : ""}${hiddenAtTop && !open ? " hidden-at-top" : ""}`}>
    <div className="container header-inner">
      <Link href="/" className="brand-lockup" aria-label="MERO 홈" onClick={() => setOpen(false)}><span className="mero-brand-mark" aria-hidden="true"/><span className="brand-word">MERO</span></Link>
      <nav className="desktop-nav" aria-label="주 메뉴">
        {navigation.map(item => { const active = isActive(path, item.href); return <Link href={item.href} key={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>{item.label}</Link>; })}
      </nav>
      <div className="header-actions">
        <button type="button" className="icon-button theme-toggle" onClick={toggle} aria-label={theme === "light" ? "어두운 테마로 전환" : "밝은 테마로 전환"}>{theme === "light" ? <Moon size={20}/> : <Sun size={20}/>}</button>
        {member ? <>
          {member.role === "admin" && <Link href="/admin" className="header-admin desktop-only">관리</Link>}
          <Link href="/account" className="header-account" aria-label="내 계정"><span className="desktop-only">{member.name.length > 8 ? member.name.slice(0, 8) : member.name} 님</span><UserCircle className="mobile-only" size={22}/></Link>
          <button className="icon-button desktop-only" onClick={logout} disabled={busy} aria-label="로그아웃"><SignOut size={20}/></button>
        </> : <><Link href="/login" className="header-login">로그인</Link><Link href="/signup" className="button button-small desktop-only">회원가입</Link></>}
        <button className="icon-button menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X size={24}/> : <List size={24}/>}</button>
      </div>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-nav container" aria-label="모바일 메뉴">
      {navigation.map(item => <Link href={item.href} key={item.href} onClick={() => setOpen(false)} aria-current={isActive(path, item.href) ? "page" : undefined}>{item.label}</Link>)}
      {member?.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)}>동아리 관리</Link>}
      {member ? <button onClick={logout} disabled={busy}>로그아웃<SignOut size={19}/></button> : <Link href="/signup" onClick={() => setOpen(false)}>회원가입</Link>}
    </nav>}
    {error && <p className="header-error" role="alert">{error}</p>}
  </header>;
}
