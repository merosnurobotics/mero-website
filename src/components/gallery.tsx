"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { CaretLeft, CaretRight, X } from "./icons";
import { useLocale } from "./locale-provider";
import { tr } from "@/lib/i18n";
export function Gallery({ photos }: { photos: { src: string; alt: string }[] }) {
  const [selected, setSelected] = useState(0); const dialog = useRef<HTMLDialogElement>(null);
  const { locale } = useLocale(); const t = (ko: string, en: string) => tr(locale, ko, en);
  function move(by: number) { setSelected(value => (value + by + photos.length) % photos.length); }
  return <><div className="photo-gallery">{photos.map((photo, index) => <button key={photo.src} onClick={() => { setSelected(index); dialog.current?.showModal(); }} aria-label={t(`${photo.alt} 크게 보기`, `View larger: ${photo.alt}`)}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 767px) 50vw, 400px"/></button>)}</div>
    <dialog ref={dialog} className="gallery-dialog" aria-label={t("활동사진 크게 보기", "Activity photo viewer")} onKeyDown={event => { if (event.key === "ArrowRight") move(1); if (event.key === "ArrowLeft") move(-1); }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button className="gallery-close icon-button" onClick={() => dialog.current?.close()} aria-label={t("사진 닫기", "Close photo")}><X size={26}/></button>
      <button className="gallery-prev icon-button" onClick={() => move(-1)} aria-label={t("이전 사진", "Previous photo")}><CaretLeft size={30}/></button>
      <div className="gallery-full-image"><Image src={photos[selected].src} alt={photos[selected].alt} fill sizes="90vw" style={{ objectFit: "contain" }}/></div>
      <button className="gallery-next icon-button" onClick={() => move(1)} aria-label={t("다음 사진", "Next photo")}><CaretRight size={30}/></button><p>{photos[selected].alt}</p>
    </dialog></>;
}
