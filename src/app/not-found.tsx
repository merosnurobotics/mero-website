import Link from "next/link";
import { ArrowRight, Robot } from "@/components/icons";
export default function NotFound() { return <div className="container not-found"><Robot size={48} style={{ marginInline: "auto", color: "var(--accent)" }}/><h1>이 페이지는 찾을 수 없어요.</h1><p>주소를 확인하거나 MERO 홈에서 다시 시작해 주세요.</p><Link href="/" className="button">홈으로 돌아가기<ArrowRight size={18}/></Link></div>; }
