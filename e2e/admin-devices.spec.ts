import { expect, test, type Page } from "@playwright/test";
import { openScreen, otherDevice, signIn } from "./admin-helpers";

const LAST_PHOTO = "Seed Photo 65";
const renamed: { id: string; title: string }[] = [];

async function mediaIdByTitle(page: Page, title: string) {
  return page.evaluate(async (title) => {
    const res = await fetch(`/api/media/admin-list?q=${encodeURIComponent(title)}`, { cache: "no-store" });
    const items = (await res.json()).items as { id: string; title: string }[];
    return items.find((item) => item.title === title)!.id;
  }, title);
}

async function renameMedia(page: Page, id: string, title: string) {
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

async function renameElsewhere(browser: import("@playwright/test").Browser, id: string, from: string, to: string) {
  const other = await otherDevice(browser);
  renamed.push({ id, title: from });
  expect(await renameMedia(other.page, id, to)).toBe(200);
  await other.context.close();
}

test.afterEach(async ({ browser }) => {
  if (renamed.length === 0) return;
  const other = await otherDevice(browser);
  for (const { id, title } of renamed.splice(0)) await renameMedia(other.page, id, title);
  await other.context.close();
});

async function openDetails(page: Page, id: string) {
  await page.locator(`a[href="/admin/media?edit=${id}"]`).first().click();
  await page.getByRole("button", { name: /Details/ }).click();
  return page.locator("input").first();
}

test.describe("admin on two devices", () => {
  test("an item past the first 60, changed on another device, shows and opens with the new values", async ({
    page,
    browser,
  }) => {
    await signIn(page);
    await openScreen(page, "Media");
    await page.getByRole("button", { name: "Load more" }).click();
    await expect(page.getByText(LAST_PHOTO, { exact: true })).toBeVisible();
    const id = await mediaIdByTitle(page, LAST_PHOTO);

    await renameElsewhere(browser, id, LAST_PHOTO, "Renamed Far Down");

    await openScreen(page, "Tags");
    await openScreen(page, "Media");
    await expect(page.getByText("Renamed Far Down", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[aria-label="Select media item"]')).toHaveCount(71);

    await expect(await openDetails(page, id)).toHaveValue("Renamed Far Down");
  });

  test("saving over a change made on another device asks first, and can load the newer version", async ({
    page,
    browser,
  }) => {
    await signIn(page);
    await openScreen(page, "Media");
    const id = await mediaIdByTitle(page, "Seed Photo 1");
    const title = await openDetails(page, id);

    await renameElsewhere(browser, id, "Seed Photo 1", "Changed Elsewhere");

    await title.fill("Changed Here");
    await page.getByRole("button", { name: /Review/ }).click();
    await page.getByRole("button", { name: "Update" }).click();

    const dialog = page.getByRole("dialog", { name: "Changed on another device since you opened it." });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Load the newer version" }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.locator("input").first()).toHaveValue("Changed Elsewhere");
  });

  test("a screen never visited before shows its data with every server request held", async ({ page }) => {
    await signIn(page);
    await expect(page.getByText("New inquiries")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.route(/\/api\//, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      await route.continue();
    });
    await openScreen(page, "Testimonials");
    await expect(page.getByText("Seed Reviewer").first()).toBeVisible({ timeout: 2_000 });
  });
});
