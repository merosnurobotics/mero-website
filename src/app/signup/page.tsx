import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { currentMember } from "@/lib/auth";
export const metadata: Metadata = { title: "회원가입", robots: { index: false } };
export default async function SignupPage() { if (await currentMember()) redirect("/account"); return <AuthLayout signup><AuthForm mode="signup"/></AuthLayout>; }
