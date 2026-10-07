import { NextRequest, NextResponse } from "next/server";
import { educationMembersOnly } from "@/lib/education/settings";
const SESSION_COOKIE = "mero_session";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  // Education media bypasses the shared image optimizer and uses an authenticated route.
  if (url.pathname === "/_next/image") {
    const image = url.searchParams.get("url") || "";
    if (image.includes("/education-assets/")) return new NextResponse(null, {status:404,headers:{"Cache-Control":"private, no-store"}});
    return NextResponse.next();
  }
  if (educationMembersOnly() && !request.cookies.get(SESSION_COOKIE)?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", url.pathname + url.search);
    const response = NextResponse.redirect(login);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  const headers = new Headers(request.headers);
  headers.set("x-mero-education-path",url.pathname+url.search);
  const response = NextResponse.next({request:{headers}});
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher:["/education/:path*", "/_next/image"] };
