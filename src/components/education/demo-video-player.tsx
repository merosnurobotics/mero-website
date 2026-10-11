"use client";
import { useState } from "react";

export function DemoVideoPlayer({ youtubeId, videoUrl, title }: { youtubeId?: string; videoUrl?: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return <div className="education-demo-player">
    {loaded ? youtubeId ? <iframe
      src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
      title={title}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    /> : <video src={videoUrl} controls autoPlay playsInline preload="metadata" aria-label={title}>이 브라우저에서는 동영상을 재생할 수 없습니다. 아래 원본 영상 링크를 이용해 주세요.</video> : <button type="button" onClick={() => setLoaded(true)} aria-label={`${title} 영상 불러오기`}>
      <span aria-hidden="true" className="education-demo-play">▶</span>
      <span>공식 데모 영상 보기</span><small>{youtubeId ? "YouTube" : "제작팀 원본 영상"} · 재생할 때 영상을 불러옵니다</small>
    </button>}
  </div>;
}
