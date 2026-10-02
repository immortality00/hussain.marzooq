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
