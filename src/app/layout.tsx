import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { Lang } from "@/data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MERO · Robotics & Maker Club",
  description:
    "MERO is a maker club that takes on projects and competitions across robotics, embedded systems, and software.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read the language chosen by the proxy (or a returning visitor) so the
  // first render already matches, avoiding a flash of the wrong language.
  const cookieStore = await cookies();
  const initialLang = (cookieStore.get("lang")?.value === "ko"
    ? "ko"
    : "en") as Lang;

  return (
    <html
      lang={initialLang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider initialLang={initialLang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
