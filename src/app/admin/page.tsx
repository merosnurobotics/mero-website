import type { Metadata } from "next";
import "@radix-ui/themes/styles.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LockKey } from "@/components/icons";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { AdminDashboard } from "@/components/admin-dashboard";
import { currentMember } from "@/lib/auth";
import { canAdmin } from "@/lib/security";
import { getMembers, getRobots } from "@/lib/db";

export const metadata: Metadata = { title: "동아리 관리", robots: { index: false, follow: false } };
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const member = await currentMember();
  if (!member) redirect("/login?next=%2Fadmin");
  if (!canAdmin(member)) return <div className="container not-found"><LockKey size={45}/><h1>운영진을 위한 공간입니다.</h1><p>활동 중인 관리자 계정으로 회원과 로봇을 관리할 수 있습니다.</p><Link href="/account" className="button">내 계정으로<ArrowRight size={18}/></Link></div>;
  const query = await searchParams;
  return <div className="container page-content"><Breadcrumbs items={[{ label: "동아리 관리" }]}/><PageIntro title="함께 만드는 동아리를 관리합니다." description="신규 회원을 승인하고, 로봇의 정보와 운용 설명서를 관리하세요."/><AdminDashboard member={member} initialMembers={await getMembers()} initialRobots={await getRobots()} initialEdit={query.edit} baseUrl={process.env.NEXT_PUBLIC_SITE_URL}/></div>;
}
