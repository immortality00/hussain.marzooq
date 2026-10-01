import { expect, test, type Browser, type Page } from "@playwright/test";
import { E2E } from "./fixtures";

async function signIn(page: Page) {
  await page.goto("/admin");
  await page.getByPlaceholder("Password").fill(E2E.adminPassword);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
}

function cacheable(cacheControl: string | undefined) {
  return !(cacheControl ?? "").includes("no-store") && !(cacheControl ?? "").includes("private");
}

async function otherDevice(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page);
  return { context, page };
}

test.describe("admin speed", () => {
  test("serves the sign-in page and every admin screen pre-built and cacheable", async ({ page }) => {
    const signInPage = await page.request.get("/admin");
    expect(signInPage.status()).toBe(200);
    expect(cacheable(signInPage.headers()["cache-control"])).toBe(true);
    expect(signInPage.headers()["x-robots-tag"]).toContain("noindex");

    await signIn(page);
    for (const path of ["/admin/dashboard", "/admin/inquiries", "/admin/media/list", "/admin/blog/edit"]) {
      const screen = await page.request.get(path);
      expect(screen.status(), path).toBe(200);
      expect(cacheable(screen.headers()["cache-control"]), path).toBe(true);
    }

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
  });

  test("a screen never visited before shows its data without waiting for the server", async ({ page }) => {
    await signIn(page);
    await expect(page.getByText("New inquiries")).toBeVisible();
    await page.waitForLoadState("networkidle");

    await page.route(/\/api\//, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      await route.continue();
    });

    await page.locator("aside").getByRole("link", { name: "Media", exact: true }).click();
    await expect(page.getByText(/Seed Photo \d+/).first()).toBeVisible({ timeout: 2_000 });
  });

  test("a change made on another device shows when the screen is opened", async ({ page, browser }) => {
    await signIn(page);
    await page.locator("aside").getByRole("link", { name: "Services", exact: true }).click();
    await expect(page.getByText(E2E.serviceName).first()).toBeVisible();

    const other = await otherDevice(browser);
    const renamed = await other.page.evaluate(async () => {
      const list = await (await fetch("/api/admin/snapshot")).json();
      const service = list.data.services[0] as { id: string };
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Renamed On Another Device" }),
      });
      return res.ok;
    });
    await other.context.close();
    expect(renamed).toBe(true);

    await page.locator("aside").getByRole("link", { name: /^Dashboard/ }).click();
    await page.locator("aside").getByRole("link", { name: "Services", exact: true }).click();
    await expect(page.getByText("Renamed On Another Device").first()).toBeVisible({ timeout: 10_000 });
  });
});
