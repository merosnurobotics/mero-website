import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { currentMember } from "@/lib/auth";
import { safeReturnPath } from "@/lib/security";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "로그인", "Log in"), robots: { index: false } }; }
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const value = (await searchParams).next; const next = value ? safeReturnPath(value) : undefined;
  const member = await currentMember(); if (member) redirect(next || (member.role === "admin" ? "/admin" : "/account"));
  return <AuthLayout><AuthForm mode="login" next={next}/></AuthLayout>;
}
