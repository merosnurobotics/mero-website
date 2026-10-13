import Link from "next/link";
import { Robot } from "@/components/icons";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
export default async function NotFound() { const locale = await getLocale(); const t = (ko: string, en: string) => tr(locale, ko, en); return <div className="container not-found"><Robot size={48} color="var(--accent)"/><h1>{t("이 페이지는 찾을 수 없어요.", "We couldn't find this page.")}</h1><p>{t("주소를 확인하거나 MERO 홈에서 다시 시작해 주세요.", "Check the address, or start again from the MERO home page.")}</p><Link href="/" className="button">{t("홈으로 돌아가기", "Back to home")}</Link></div>; }
