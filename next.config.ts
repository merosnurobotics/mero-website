import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  devIndicators: false,
  // SQLite and local credentials belong to the running server, not the bundle.
  outputFileTracingExcludes: {
    "/*": ["./data/**/*", "./.local/**/*", "./.env*", "./output/**/*"],
  },
  outputFileTracingIncludes: { "/education-assets/*": ["./private/education-assets/**/*"] },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
    ] }];
  }
};
export default config;
