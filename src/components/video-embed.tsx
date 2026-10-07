"use client";
import { useState } from "react";
import Image from "next/image";
import { Play } from "./icons";
export function VideoEmbed({ videoId, title, poster = "/images/challenge-cover.webp" }: { videoId: string; title: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  return <div className="video-embed">{playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/> : <button className="video-poster" onClick={() => setPlaying(true)} aria-label={`${title} 재생`}><Image src={poster} alt={title} fill sizes="(max-width: 767px) 100vw, 900px"/><span className="video-play"><Play size={24} weight="fill"/></span></button>}</div>;
}
