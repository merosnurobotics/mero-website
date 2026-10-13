import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { AuthLayout } from "@/components/auth-layout";
import { currentMember } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export async function generateMetadata(): Promise<Metadata> { return { title: tr(await getLocale(), "회원가입", "Sign up"), robots: { index: false } }; }
export default async function SignupPage() { if (await currentMember()) redirect("/account"); return <AuthLayout signup><AuthForm mode="signup"/></AuthLayout>; }
