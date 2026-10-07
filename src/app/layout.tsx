import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/shared";
import { currentMember } from "@/lib/auth";

const siteFont = localFont({ src: "../../public/fonts/MeroSiteSans.woff2", display: "swap", variable: "--font-pretendard", weight: "100 900", adjustFontFallback: false });
const fallbackFont = localFont({ src: "../../public/fonts/PretendardVariable.woff2", display: "swap", variable: "--font-pretendard-fallback", weight: "100 900", preload: false });
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  title: { default: "MERO | 서울대학교 로봇 동아리", template: "%s | MERO" },
  description: "서울대학교 301동에서 함께 배우고 직접 만드는 로봇. MERO의 QDD 사족보행, Microban 휴머노이드, RBY1 VLA 프로젝트와 활동을 만나보세요.",
  icons: { icon: { url: "/brand/mero.svg", type: "image/svg+xml" } },
  openGraph: { title: "MERO | 서울대학교 로봇 동아리", description: "상상을 설계하고, 로봇으로 실현하다.", locale: "ko_KR", type: "website", images: [{ url: "/images/mero-team.webp", width: 1920, height: 1280 }] },
};
const themeScript = `(function(){try{var t=localStorage.getItem('mero-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}})()`;
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const member = await currentMember();
  return <html lang="ko" className={`${siteFont.variable} ${fallbackFont.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head><body><ThemeProvider><a className="skip-link" href="#main-content">본문으로 바로가기</a><Header member={member}/><main id="main-content">{children}</main><Footer/></ThemeProvider></body></html>;
}
