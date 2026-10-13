import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { AccountForms } from "@/components/account-forms";
import { currentMember } from "@/lib/auth";
import { memberStatusLabel } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "내 계정", "My account"), robots: { index: false } }; }
export default async function AccountPage() {
  const member = await currentMember(); if (!member) redirect("/login?next=%2Faccount");
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  return <div className="container page-content"><Breadcrumbs items={[{ label: t("내 계정", "My account") }]}/><PageIntro title={t("반가워요. 함께 만들어 봐요.", "Welcome. Let's build together.")} description={t("회원 정보를 확인하고 계정 설정을 관리하세요.", "Review your profile and manage your account settings.")}/><div className="account-layout"><aside className="account-card"><div className="account-initials">{member.name.slice(0,2)}</div><h2>{member.name}</h2><p>{member.email}</p><span className={`status-badge ${member.status === "pending" ? "status-building" : "status-ready"}`}>{memberStatusLabel(member.status, locale)}{member.role === "admin" ? t(" / 관리자", " / Admin") : ""}</span><Link href="/robots" className="text-link">{t("로봇 안내 보기", "View robot guides")}</Link>{member.role === "admin" && <Link href="/admin" className="text-link">{t("관리자 페이지", "Admin page")}</Link>}</aside><AccountForms member={member}/></div></div>;
}
