import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { Breadcrumbs, PageIntro } from "@/components/shared";
import { AccountForms } from "@/components/account-forms";
import { currentMember } from "@/lib/auth";
import { memberStatusLabels } from "@/lib/content";
export const metadata: Metadata = { title: "내 계정", robots: { index: false } };
export default async function AccountPage() {
  const member = await currentMember(); if (!member) redirect("/login?next=%2Faccount");
  return <div className="container page-content"><Breadcrumbs items={[{ label: "내 계정" }]}/><PageIntro title="반가워요. 함께 만들어 봐요." description="회원 정보를 확인하고 계정 설정을 관리하세요."/><div className="account-layout"><aside className="account-card"><div className="account-initials">{member.name.slice(0,2)}</div><h2>{member.name}</h2><p>{member.email}</p><span className={`status-badge ${member.status === "pending" ? "status-building" : "status-ready"}`}>{memberStatusLabels[member.status]}{member.role === "admin" ? " / 관리자" : ""}</span><Link href="/robots" className="text-link">로봇 안내 보기<ArrowRight size={17}/></Link>{member.role === "admin" && <Link href="/admin" className="text-link">관리자 페이지<ArrowRight size={17}/></Link>}</aside><AccountForms member={member}/></div></div>;
}
