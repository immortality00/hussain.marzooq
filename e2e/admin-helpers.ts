import { expect, type Browser, type Page } from "@playwright/test";
import { E2E } from "./fixtures";
import { resetSiteSignInLimit } from "./security-db";

export async function signIn(page: Page) {
  await resetSiteSignInLimit();
  await page.goto("/admin");
  await page.getByPlaceholder("Password").fill(E2E.adminPassword);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
}

export async function otherDevice(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page);
  return { context, page };
}

export async function openScreen(page: Page, name: string | RegExp) {
  const link = page.locator("aside").getByRole("link", { name: typeof name === "string" ? new RegExp(`^${name}`) : name });
  const href = await link.first().getAttribute("href");
  await link.first().click();
  if (href) await page.waitForURL((url) => url.pathname === href);
}

export async function freshLoad(page: Page) {
  await page.reload();
  await expect(page.locator("aside").first()).toBeVisible();
  await expect(page.getByText("Loading", { exact: true })).toHaveCount(0);
}

export async function mediaIdByTitle(page: Page, title: string) {
  return page.evaluate(async (title) => {
    const res = await fetch(`/api/media/admin-list?q=${encodeURIComponent(title)}`, { cache: "no-store" });
    const items = (await res.json()).items as { id: string; title: string }[];
    return items.find((item) => item.title === title)!.id;
  }, title);
}

export async function renameMedia(page: Page, id: string, title: string) {
  return page.evaluate(
    async ({ id, title }) => {
      const item = (await (await fetch(`/api/media/${id}`)).json()).item;
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, title }),
      });
      return res.status;
    },
    { id, title }
  );
}

export const snapshot = (page: Page) =>
  page.evaluate(async () => (await (await fetch("/api/admin/snapshot", { cache: "no-store" })).json()).data);

export async function patchJson(page: Page, url: string, body: unknown) {
  return page.evaluate(
    async ({ url, body }) => {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.status;
    },
    { url, body }
  );
}

export const fieldAfter = (page: Page, label: string) =>
  page
    .locator("label", { hasText: new RegExp(`^\\s*${label}\\s*$`) })
    .first()
    .locator("xpath=following::*[self::input or self::textarea][1]");

export async function hasInputValue(page: Page, value: string) {
  return page.locator("input, textarea").evaluateAll(
    (elements, wanted) => elements.some((element) => (element as HTMLInputElement).value === wanted),
    value
  );
}
