"use strict";
const $ = (selector) => document.querySelector(selector);
let savedTheme;
try { savedTheme = localStorage.getItem("microban-lesson-theme"); } catch (_) {}
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
function updateThemeLabel() {
  const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme:dark)").matches);
  $("#theme").textContent = "테마";
  $("#theme").setAttribute("aria-label", dark ? "테마: 밝게" : "테마: 어둡게");
}
updateThemeLabel();
$("#theme").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme:dark)").matches);
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("microban-lesson-theme", dark ? "light" : "dark"); } catch (_) {}
  updateThemeLabel();
});
const reference = $("#reference-video");
const slider = $("#reference-frame");
let pendingSeek = false;
let desiredFrame = 0;
const seekableLoads = new WeakMap();
async function ensureSeekable(video) {
  if (!Number.isFinite(video.duration)) {
    await new Promise((resolve, reject) => {
      video.addEventListener("loadedmetadata", resolve, {once: true});
      video.addEventListener("error", reject, {once: true});
    });
  }
  if (!location.protocol.startsWith("http") || (video.seekable.length && video.seekable.end(video.seekable.length - 1) > 0)) return;
  if (!seekableLoads.has(video)) {
    seekableLoads.set(video, (async () => {
      const response = await fetch(video.currentSrc);
      if (!response.ok) throw new Error("media unavailable");
      const blob = await response.blob();
      const loaded = new Promise((resolve, reject) => {
        video.addEventListener("loadedmetadata", resolve, {once: true});
        video.addEventListener("error", reject, {once: true});
      });
      video.src = URL.createObjectURL(blob);
      video.load();
      await loaded;
    })());
  }
  await seekableLoads.get(video);
}
slider.addEventListener("input", async () => {
  desiredFrame = Number(slider.value);
  reference.pause();
  pendingSeek = true;
  $("#reference-frame-label").textContent = desiredFrame + " / 179";
  try {
    await ensureSeekable(reference);
    reference.currentTime = Math.min(desiredFrame / 30, reference.duration - .01);
  } catch (_) { pendingSeek = false; }
});
reference.addEventListener("timeupdate", () => {
  if (pendingSeek) return;
  slider.value = Math.min(179, Math.round(reference.currentTime * 30));
  $("#reference-frame-label").textContent = slider.value + " / 179";
});
reference.addEventListener("seeked", () => {
  pendingSeek = false;
  slider.value = Math.min(179, Math.round(reference.currentTime * 30));
  $("#reference-frame-label").textContent = slider.value + " / 179";
});
document.querySelectorAll("[data-copy]").forEach((button) => {
  const originalLabel = button.textContent;
  button.setAttribute("aria-label", originalLabel);
  button.addEventListener("click", async () => {
    const value = document.getElementById(button.dataset.copy).textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const area = document.createElement("textarea");
        area.value = value; area.style.position = "fixed"; area.style.left = "-9999px";
        document.body.append(area); area.select();
        if (!document.execCommand("copy")) throw new Error("copy unavailable");
        area.remove(); button.focus();
      }
      button.textContent = "Copied";
    } catch (_) { button.textContent = "코드 선택 후 복사"; }
    button.setAttribute("aria-label", button.textContent);
    setTimeout(() => { button.textContent = originalLabel; button.setAttribute("aria-label", originalLabel); }, 1800);
  });
});
$("#print").addEventListener("click", () => window.print());
document.querySelectorAll("video").forEach((video) => video.addEventListener("error", () => {
  if (video.parentElement.querySelector(".media-error")) return;
  const message = document.createElement("p"); message.className = "media-error caption";
  message.textContent = "media 폴더를 HTML과 함께 유지해 주세요."; video.after(message);
}));

function comparisons() {
  const before = $("#before-video"), after = $("#after-video");
  const status = $("#compare-status"), play = $("#play-compare");
  let loading = false;
  const pause = () => {
    before.pause(); after.pause(); play.textContent = "두 영상 함께 재생";
  };
  play.addEventListener("click", async () => {
    if (loading) return;
    if (!before.paused || !after.paused) { pause(); return; }
    loading = true;
    play.disabled = true;
    try {
      await Promise.all([ensureSeekable(before), ensureSeekable(after)]);
      before.currentTime = after.currentTime = Math.min(before.currentTime, after.currentTime);
      const played = await Promise.allSettled([before.play(), after.play()]);
      if (played.some(r => r.status === "rejected")) throw new Error("play unavailable");
      play.textContent = "두 영상 일시정지";
      status.textContent = "같은 초기 자세 · 같은 외력 · 18초";
    } catch (_) {
      pause();
      status.textContent = "각 영상의 재생 버튼으로 영상을 열어 주세요.";
    } finally { loading = false; play.disabled = false; }
  });
  $("#reset-compare").addEventListener("click", async () => {
    pause();
    try {
      await Promise.all([ensureSeekable(before), ensureSeekable(after)]);
      before.currentTime = after.currentTime = 0;
    } catch (_) { status.textContent = "각 영상의 재생 버튼으로 영상을 열어 주세요."; }
  });
  $("#compare-rate").addEventListener("change", () => {
    before.playbackRate = after.playbackRate = Number($("#compare-rate").value);
  });
  after.addEventListener("timeupdate", () => {
    if (!after.paused && !before.paused && Math.abs(after.currentTime - before.currentTime) > .12) before.currentTime = after.currentTime;
  });
  [before, after].forEach(video => video.addEventListener("ended", pause));
}
if ($("#before-video") && $("#after-video")) comparisons();
