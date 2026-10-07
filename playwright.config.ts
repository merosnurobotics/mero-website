import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  workers: 1,
  timeout: 30000,
  reporter: "list",
  use: { browserName: "chromium", headless: true, viewport: { width: 1440, height: 1000 }, colorScheme: "light", reducedMotion: "reduce" },
});
