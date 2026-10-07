"use client";
import { useEffect, useState } from "react";
import { DownloadSimple } from "./icons";
export function QRPanel({ id, name, baseUrl = "" }: { id: string; name: string; baseUrl?: string }) {
  const [origin, setOrigin] = useState(baseUrl); const [error, setError] = useState(false);
  useEffect(() => { if (!baseUrl) setOrigin(window.location.origin); }, [baseUrl]);
  let parsed = ""; let local = false;
  try { const value = new URL(origin); if (["http:", "https:"].includes(value.protocol) && !value.username && !value.password) { parsed = value.origin; local = ["localhost", "127.0.0.1", "0.0.0.0"].includes(value.hostname); } } catch {}
  const source = parsed ? `/api/robots/${id}/qr?origin=${encodeURIComponent(parsed)}` : "";
  return <div className="qr-panel"><div className="qr-preview">{source ? <img src={source} alt={`${name} 안내 페이지 QR 코드`} width={224} height={224} onError={() => setError(true)} onLoad={() => setError(false)}/> : <div className="skeleton" style={{ height: "100%" }}/>}</div><div><h3>로봇 위에 붙이는 안내 페이지.</h3><p>QR에는 로봇의 고유 페이지 주소가 담깁니다. 접속 정보와 제어 설명서는 로그인 및 회원 승인 후에만 열립니다.</p><div className="form-field"><label htmlFor={`qr-origin-${id}`}>QR에 사용할 사이트 주소</label><input id={`qr-origin-${id}`} type="url" value={origin} onChange={event => setOrigin(event.target.value)} placeholder="https://mero.example.com"/><small>{local ? "localhost 주소는 다른 기기에서 열리지 않습니다. QR을 실제로 부착할 때는 운영 도메인이나 같은 네트워크의 서버 주소를 입력해 주세요." : "사이트 주소가 바뀌면 새 QR을 내려받아 사용하세요."}</small></div>{!parsed && origin && <p className="form-error" role="alert">올바른 HTTP 또는 HTTPS 주소를 입력해 주세요.</p>}{error && <p className="form-error" role="alert">QR 이미지를 만들지 못했습니다. 페이지를 새로고침해 주세요.</p>}{parsed && <a className="button button-outline" href={`${source}&download=1`} download><DownloadSimple size={17}/>QR 이미지 다운로드</a>}<div className="qr-address">{parsed ? `${parsed}/robots/${id}` : "사이트 주소를 입력해 주세요."}</div></div></div>;
}
