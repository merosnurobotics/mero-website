"use client";

import { useEffect } from "react";

// Enhance the authored HTML without replacing the server-rendered lesson.
export function LessonInteractions() {
  useEffect(() => {
    const root = document.getElementById("kimodo-lesson");
    if (!root) return;
    const controller = new AbortController();
    const { signal } = controller;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const get = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
    const reference = get<HTMLVideoElement>("#reference-video");
    const slider = get<HTMLInputElement>("#reference-frame");
    const frameLabel = get<HTMLOutputElement>("#reference-frame-label");
    let pendingFrame: number | null = null;

    const seekFrame = () => {
      if (pendingFrame === null || !Number.isFinite(reference.duration)) return;
      reference.currentTime = Math.min(pendingFrame / 30, Math.max(0, reference.duration - .01));
    };
    slider.addEventListener("input", () => {
      reference.pause();
      pendingFrame = Number(slider.value);
      frameLabel.textContent = `${pendingFrame} / 179`;
      seekFrame();
    }, { signal });
    reference.addEventListener("loadedmetadata", seekFrame, { signal });
    const updateFrame = () => {
      if (pendingFrame !== null) return;
      slider.value = String(Math.min(179, Math.round(reference.currentTime * 30)));
      frameLabel.textContent = `${slider.value} / 179`;
    };
    reference.addEventListener("timeupdate", updateFrame, { signal });
    reference.addEventListener("seeked", () => { pendingFrame = null; updateFrame(); }, { signal });

    root.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach(button => {
      const label = button.textContent;
      button.addEventListener("click", async () => {
        const text = root.querySelector<HTMLElement>(`#${button.dataset.copy}`)?.textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          if (signal.aborted) return;
          button.textContent = "복사 완료";
        } catch {
          if (signal.aborted) return;
          button.textContent = "코드를 선택해 복사하세요";
        }
        const timer = setTimeout(() => { button.textContent = label; timers.delete(timer); }, 1800);
        timers.add(timer);
      }, { signal });
    });
    get<HTMLButtonElement>("#print").addEventListener("click", () => window.print(), { signal });
    root.querySelectorAll<HTMLVideoElement>("video").forEach(video => {
      video.addEventListener("error", () => {
        if (video.nextElementSibling?.classList.contains("media-error")) return;
        const message = document.createElement("p");
        message.className = "media-error caption";
        message.textContent = "영상을 불러오지 못했습니다. 페이지를 새로고침하거나 전체 자료를 다운로드해 주세요.";
        video.after(message);
      }, { signal });
    });

    return () => {
      controller.abort();
      timers.forEach(clearTimeout);
      root.querySelectorAll<HTMLVideoElement>("video").forEach(video => video.pause());
    };
  }, []);
  return null;
}
