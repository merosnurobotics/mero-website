import type { Metadata } from "next";
import "@radix-ui/themes/styles.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKey } from "@/components/icons";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { AdminDashboard } from "@/components/admin-dashboard";
import { currentMember } from "@/lib/auth";
import { canAdmin } from "@/lib/security";
import { getMembers, getRobots } from "@/lib/db";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "동아리 관리", "Club admin"), robots: { index: false, follow: false } }; }
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const member = await currentMember();
  if (!member) redirect("/login?next=%2Fadmin");
  const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  if (!canAdmin(member)) return <div className="container not-found"><LockKey size={45}/><h1>{t("운영진을 위한 공간입니다.", "This area is for club officers.")}</h1><p>{t("활동 중인 관리자 계정으로 회원과 로봇을 관리할 수 있습니다.", "Members and robots can be managed with an active admin account.")}</p><Link href="/account" className="button">{t("내 계정으로", "Go to my account")}</Link></div>;
  const query = await searchParams;
  return <div className="container page-content"><Breadcrumbs items={[{ label: t("동아리 관리", "Club admin") }]}/><PageIntro title={t("함께 만드는 동아리를 관리합니다.", "Manage the club we build together.")} description={t("신규 회원을 승인하고, 로봇의 정보와 운용 설명서를 관리하세요.", "Approve new members and manage robot details and operating manuals.")}/><AdminDashboard member={member} initialMembers={await getMembers()} initialRobots={await getRobots()} initialEdit={query.edit} baseUrl={process.env.NEXT_PUBLIC_SITE_URL}/></div>;
}
