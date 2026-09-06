import { defineConfig, devices } from "@playwright/test";
import { E2E } from "./e2e/fixtures";

const baseURL = `http://127.0.0.1:${E2E.port}`;

// The suite only ever talks to the seeded end-to-end database. MONGODB_URI is
// inherited (a local cluster or the CI service container); the database name is
// forced here so a stray .env.local can never point the run at real content.
const serverEnv = {
  MONGODB_DB_NAME: E2E.dbName,
  ADMIN_PASSWORD_HASH: E2E.adminPasswordHash,
  ADMIN_COOKIE_SECRET: E2E.adminCookieSecret,
  PRIVATE_GALLERY_COOKIE_SECRET: E2E.galleryCookieSecret,
  PERSON_GATE_COOKIE_SECRET: E2E.galleryCookieSecret,
  RESEND_API_KEY: "e2e_resend_key",
  NEXT_PUBLIC_SITE_URL: baseURL,
};

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
    // Falls back to the machine's installed Chrome when Playwright's own
    // browser download is unavailable; PLAYWRIGHT_CHANNEL is unset in CI, where
    // `playwright install --with-deps chromium` provides the bundled build.
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  },
  webServer: {
    command: `npm run build && npx next start -p ${E2E.port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: serverEnv,
  },
});
