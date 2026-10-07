import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DownloadSimple } from "../../src/components/icons";
export function QRPanel({ id, name }: { id: string; name: string; baseUrl?: string }) {
  const [origin, setOrigin] = useState("https://mero.example.com"); const [image, setImage] = useState(""); const [error, setError] = useState("");
  let target = "";
  try { const parsed = new URL(origin); if (["http:","https:"].includes(parsed.protocol) && !parsed.username && !parsed.password) target = `${parsed.origin}/robots/${id}`; } catch {}
  useEffect(() => {
    let active = true; setError(""); setImage("");
    if (target) QRCode.toDataURL(target, { width: 720, margin: 3, errorCorrectionLevel: "M", color: { dark: "#183889", light: "#ffffff" } }).then(value => { if (active) setImage(value); }).catch(() => { if (active) setError("QR 이미지를 만들지 못했습니다."); });
    return () => { active = false; };
  }, [target]);
  return <div className="qr-panel"><div className="qr-preview">{image ? <img src={image} alt={`${name} 안내 페이지 QR 코드`} width={224} height={224}/> : <div className="skeleton" style={{height:"100%"}}/>}</div><div><h3>로봇 위에 붙이는 안내 페이지.</h3><p>QR 제작 화면을 체험해 보세요. 아래 주소는 예시이며, 실제 운영 도메인을 확정한 뒤 사용할 수 있습니다.</p><div className="form-field"><label htmlFor={`qr-origin-${id}`}>QR에 사용할 사이트 주소</label><input id={`qr-origin-${id}`} type="url" value={origin} onChange={event => setOrigin(event.target.value)}/><small>이 HTML 초안에서는 실제 로봇 접속이나 회원 인증이 제공되지 않습니다.</small></div>{!target && <p className="form-error" role="alert">올바른 HTTP 또는 HTTPS 주소를 입력해 주세요.</p>}{error && <p className="form-error" role="alert">{error}</p>}{image && <a className="button button-outline" href={image} download={`mero-${id}-qr.png`}><DownloadSimple size={17}/>QR 이미지 다운로드</a>}<div className="qr-address">{target || "사이트 주소를 입력해 주세요."}</div></div></div>;
}
