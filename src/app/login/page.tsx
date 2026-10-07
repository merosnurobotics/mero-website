import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { currentMember } from "@/lib/auth";
import { safeReturnPath } from "@/lib/security";
export const metadata: Metadata = { title: "로그인", robots: { index: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const value = (await searchParams).next; const next = value ? safeReturnPath(value) : undefined;
  const member = await currentMember(); if (member) redirect(next || (member.role === "admin" ? "/admin" : "/account"));
  return <AuthLayout><AuthForm mode="login" next={next}/></AuthLayout>;
}
