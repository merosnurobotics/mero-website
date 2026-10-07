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

    const before = get<HTMLVideoElement>("#before-video");
    const after = get<HTMLVideoElement>("#after-video");
    const play = get<HTMLButtonElement>("#play-compare");
    const status = get<HTMLElement>("#compare-status");
    let starting = false;
    const pause = () => {
      before.pause(); after.pause(); play.textContent = "두 영상 함께 재생";
    };
    play.addEventListener("click", async () => {
      if (starting) return;
      if (!before.paused || !after.paused) { pause(); return; }
      starting = true;
      play.disabled = true;
      play.setAttribute("aria-busy", "true");
      try {
        before.currentTime = after.currentTime = Math.min(before.currentTime, after.currentTime);
        const results = await Promise.allSettled([before.play(), after.play()]);
        if (signal.aborted) { pause(); return; }
        if (results.some(result => result.status === "rejected")) throw new Error("Playback failed");
        play.textContent = "두 영상 일시정지";
        status.textContent = "같은 초기 자세 · 같은 외력 · 18초";
      } catch {
        pause();
        status.textContent = "각 영상의 재생 버튼으로 영상을 열어 주세요.";
      } finally {
        starting = false;
        play.disabled = false;
        play.removeAttribute("aria-busy");
      }
    }, { signal });
    get<HTMLButtonElement>("#reset-compare").addEventListener("click", () => {
      pause(); before.currentTime = after.currentTime = 0;
    }, { signal });
    get<HTMLSelectElement>("#compare-rate").addEventListener("change", event => {
      before.playbackRate = after.playbackRate = Number((event.target as HTMLSelectElement).value);
    }, { signal });
    after.addEventListener("timeupdate", () => {
      if (!after.paused && !before.paused && Math.abs(after.currentTime - before.currentTime) > .12) before.currentTime = after.currentTime;
    }, { signal });
    [before, after].forEach(video => video.addEventListener("ended", pause, { signal }));
    return () => {
      controller.abort();
      timers.forEach(clearTimeout);
      root.querySelectorAll<HTMLVideoElement>("video").forEach(video => video.pause());
    };
  }, []);
  return null;
}
