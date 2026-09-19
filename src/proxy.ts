import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auto-detect the visitor's language on their first visit and remember it in a
// cookie. Korean for visitors in Korea (or with a Korean-language browser),
// English for everyone else. Users can still override this with the toggle in
// the navbar — once a `lang` cookie exists, we leave it alone.
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Already chosen (by the user or a previous visit) — don't override.
  if (request.cookies.has("lang")) {
    return response;
  }

  // 1) Geo: Vercel sets this header in production based on the visitor's IP.
  const country = request.headers.get("x-vercel-ip-country");
  // 2) Fallback: the browser's preferred language (works everywhere, incl. local dev).
  const acceptLanguage = request.headers.get("accept-language") ?? "";

  const isKorea =
    country === "KR" || acceptLanguage.toLowerCase().startsWith("ko");

  const lang = isKorea ? "ko" : "en";

  response.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  // Run on page routes only — skip Next internals, API, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
