import { defineConfig } from "@playwright/test";

const baseURL = process.env.MERO_LIVE_E2E_BASE_URL || "http://localhost:3100";
const origin = new URL(baseURL);
if (origin.hostname !== "localhost" || origin.protocol !== "http:") {
  throw new Error("Live E2E tests must use an isolated HTTP server on localhost.");
}
if (!process.env.MERO_LIVE_E2E_ADMIN_EMAIL || !process.env.MERO_LIVE_E2E_ADMIN_PASSWORD) {
  throw new Error("Set MERO_LIVE_E2E_ADMIN_EMAIL and MERO_LIVE_E2E_ADMIN_PASSWORD for the throwaway test database.");
}
process.env.MERO_LIVE_E2E_BASE_URL = origin.origin;

export default defineConfig({
  testDir: "./tests",
  testMatch: "live-site.spec.ts",
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  outputDir: ".local/live-e2e-results",
  use: {
    baseURL: origin.origin,
    browserName: "chromium",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    reducedMotion: "reduce",
    actionTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
