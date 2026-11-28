import { expect, test, type Page } from "@playwright/test";
import { signIn } from "./admin-helpers";

async function signInPageSaved(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          await navigator.serviceWorker.ready;
          return Boolean(await (await caches.open("hm-admin-launch-v1")).match("/admin/sign-in"));
        }),
      { timeout: 15_000 }
    )
    .toBe(true);
}

async function logOut(page: Page) {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/admin\/sign-in\?loggedout=1$/);
  await expect(page.getByText("Logged out.")).toBeVisible();
}

test.describe("admin sign-in and logout", () => {
  test("logout lands on the sign-in page and the session is gone", async ({ page }) => {
    await signIn(page);
    await logOut(page);
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/sign-in\?next=%2Fadmin%2Fdashboard$/);
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  // In Playwright's WebKit (local runs; CI runs Chrome) this fails at the offline page.goto with "WebKit
  // encountered an internal error". Not a site bug and not a security issue — proven 2026-11-28: Playwright's
  // offline switch in WebKit stops every request before the service worker can answer (an offline fetch of a
  // file the worker holds fails in WebKit and works in Chrome), and with the server really stopped WebKit opens
  // the saved sign-in page. See CLAUDE.md "Testing & CI". Do not investigate it again.
  test("signed out and offline, the sign-in page still opens from the phone", async ({ page, context }) => {
    await signIn(page);
    await signInPageSaved(page);
    await logOut(page);

    await context.setOffline(true);
    await page.goto("/admin/sign-in");
    await expect(page.getByRole("button", { name: "Login" })).toBeEnabled();

    const coldOpen = await context.newPage();
    await coldOpen.goto("/admin/dashboard");
    await expect(coldOpen).toHaveURL(/\/admin\/sign-in\?next=%2Fadmin%2Fdashboard$/);
    await expect(coldOpen.getByRole("button", { name: "Login" })).toBeVisible();
    await context.setOffline(false);
  });
});
