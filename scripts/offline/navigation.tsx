import { useSyncExternalStore } from "react";

let lastRoute = "/";
export function currentRoute() {
  const value = decodeURI(window.location.hash.slice(1));
  if (value.startsWith("/")) lastRoute = value;
  return lastRoute;
}
function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("mero:refresh", callback);
  return () => { window.removeEventListener("hashchange", callback); window.removeEventListener("mero:refresh", callback); };
}
export function useRoute() { return useSyncExternalStore(subscribe, currentRoute, () => "/"); }
export function usePathname() { return currentRoute().split("?")[0]; }
export function navigate(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return;
  lastRoute = path;
  if (window.location.hash.slice(1) === path) window.dispatchEvent(new Event("mero:refresh"));
  else window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "instant" });
}
const router = { push: navigate, replace: navigate, refresh: () => window.dispatchEvent(new Event("mero:refresh")), back: () => history.back() };
export function useRouter() { return router; }
export function notFound(): never { throw new Error("요청한 미리보기 페이지를 찾을 수 없습니다."); }
export function redirect(path: string): never { throw { meroRedirect: path }; }
