import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/shared";
import { currentMember } from "@/lib/auth";
import { LocaleProvider } from "@/components/locale-provider";
import { getLocale } from "@/lib/locale";

const siteFont = localFont({ src: "../../public/fonts/MeroSiteSans.woff2", display: "swap", variable: "--font-pretendard", weight: "100 900", adjustFontFallback: false });
const fallbackFont = localFont({ src: "../../public/fonts/PretendardVariable.woff2", display: "swap", variable: "--font-pretendard-fallback", weight: "100 900", preload: false });
export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === "en";
  const title = en ? "MERO | Seoul National University Robotics Club" : "MERO | 서울대학교 로봇 동아리";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
    title: { default: title, template: "%s | MERO" },
    description: en ? "Robots we learn about and build together in Building 301 at Seoul National University. Explore MERO's QDD quadruped, Microban humanoid and RBY1 VLA projects and activities." : "서울대학교 301동에서 함께 배우고 직접 만드는 로봇. MERO의 QDD 사족보행, Microban 휴머노이드, RBY1 VLA 프로젝트와 활동을 만나보세요.",
    icons: { icon: { url: "/brand/mero.svg", type: "image/svg+xml" } },
    openGraph: { title, description: en ? "Designing imagination, building it into robots." : "상상을 설계하고, 로봇으로 실현하다.", locale: en ? "en_US" : "ko_KR", type: "website", images: [{ url: "/images/mero-team.webp", width: 1920, height: 1280 }] },
  };
}
const themeScript = `(function(){try{var t=localStorage.getItem('mero-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}})()`;
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [member, locale] = await Promise.all([currentMember(), getLocale()]);
  return <html lang={locale} data-scroll-behavior="smooth" className={`${siteFont.variable} ${fallbackFont.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head><body><ThemeProvider><LocaleProvider locale={locale}><a className="skip-link" href="#main-content">{locale === "en" ? "Skip to main content" : "본문으로 바로가기"}</a><Header member={member}/><main id="main-content">{children}</main><Footer/></LocaleProvider></ThemeProvider></body></html>;
}
