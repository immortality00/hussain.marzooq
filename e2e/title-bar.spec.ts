import { expect, test, type Locator, type Page } from "@playwright/test";
import { E2E } from "./fixtures";

// UX1b: once a page scrolls, its title moves into a bar under the navbar, with the page's search
// row stuck right under it. On a person's page and a tag page Back (and the person's photo) move
// too; on the four main pages only the title does. A person's tags and search share one line,
// and on a phone the search is an icon until tapped.

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

async function scrollPageTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await expect.poll(() => scrollY(page)).toBe(y);
}

const phase = (page: Page) =>
  page.locator(".hm-title-frame").evaluate((el) => (el as HTMLElement).dataset.titleState ?? "page");

async function middle(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("not on screen");
  return box.y + box.height / 2;
}

test.describe("a person's page", () => {
  test("one line of tags and search; once scrolled, Back, photo and name sit in the bar over the stuck search", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/people/seed-person");
    const bar = page.locator(".hm-title-bar");
    const toolbar = page.locator(".hm-sticky-toolbar");
    const search = toolbar.getByRole("textbox", { name: "Search…" });
    const allChip = toolbar.getByRole("button", { name: "All", exact: true });

    await expect(search).toBeVisible();
    expect(Math.abs((await middle(search)) - (await middle(allChip)))).toBeLessThanOrEqual(2);
    await expect(bar.getByText(E2E.personName)).toBeHidden();

    await scrollPageTo(page, 120);
    await expect.poll(() => phase(page)).toBe("bar");
    await expect(bar.getByText(E2E.personName)).toBeVisible();
    await expect(bar.getByRole("link", { name: "Back", exact: true })).toBeVisible();
    // Out of sight, but still the page's heading for a screen reader.
    await expect(page.locator("[data-title-heading]")).toHaveCSS("opacity", "0");
    await expect(page.getByRole("heading", { level: 1 })).toBeAttached();
    await expect(page.getByRole("link", { name: "Back", exact: true })).toHaveCount(1);

    // Further down, the search row sticks right under the bar: navbar 57 + bar 56 + 12.
    const natural = await toolbar.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await scrollPageTo(page, Math.round(natural - 100));
    await expect(toolbar).toHaveAttribute("data-stuck", "");
    expect(Math.round((await toolbar.boundingBox())!.y)).toBe(125);

    await scrollPageTo(page, 0);
    await expect.poll(() => phase(page)).toBe("page");
    await expect(page.locator("[data-title-heading]")).toHaveCSS("opacity", "1");
    await expect(bar.getByText(E2E.personName)).toBeHidden();
    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(page).toHaveURL(/\/people$/);
  });

  test("on a phone the search is an icon that opens to half the row", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/people/seed-person");
    const toolbar = page.locator(".hm-sticky-toolbar");
    const row = toolbar.locator(":scope > div");
    const searchBox = toolbar.locator(".hm-expanding-search");
    const icon = toolbar.getByRole("button", { name: "Search", exact: true });
    const allChip = toolbar.getByRole("button", { name: "All", exact: true });

    await expect(icon).toBeVisible();
    await expect(toolbar.getByRole("textbox", { name: "Search…" })).toBeHidden();
    expect(Math.abs((await middle(icon)) - (await middle(allChip)))).toBeLessThanOrEqual(2);

    await icon.click();
    const input = toolbar.getByRole("textbox", { name: "Search…" });
    await expect(input).toBeFocused();
    const rowWidth = (await row.boundingBox())!.width;
    await expect.poll(async () => Math.round((await searchBox.boundingBox())!.width)).toBe(Math.round(rowWidth / 2));

    await allChip.click();
    await expect(icon).toBeVisible();
    await expect(input).toBeHidden();
  });
});

test("a tag page's title and Back move into the bar once it scrolls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => window.localStorage.setItem("hm.photography.view", "grid"));
  await page.goto("/photography/exhibitions");
  const title = await page.getByRole("heading", { level: 1 }).innerText();
  const bar = page.locator(".hm-title-bar");

  await scrollPageTo(page, 120);
  await expect.poll(() => phase(page)).toBe("bar");
  await expect(bar.getByText(title, { exact: true })).toBeVisible();
  await expect(bar.getByRole("link", { name: "Back", exact: true })).toBeVisible();

  await bar.getByRole("link", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/\/photography$/);
});

for (const path of ["/people", "/photography", "/videography", "/nft"]) {
  test(`${path}: only the title moves, to the middle of the bar`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => window.localStorage.setItem("hm.photography.view", "grid"));
    await page.goto(path);
    const title = await page.getByRole("heading", { level: 1 }).innerText();
    const bar = page.locator(".hm-title-bar");
    const heading = bar.locator("[data-title-bar-heading]");

    await scrollPageTo(page, 120);
    await expect.poll(() => phase(page)).toBe("bar");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(title.replace(/\s+/g, " "));
    await expect(bar.getByRole("link")).toHaveCount(0);
    const box = (await heading.boundingBox())!;
    expect(Math.abs(box.x + box.width / 2 - 195)).toBeLessThanOrEqual(2);

    await scrollPageTo(page, 0);
    await expect.poll(() => phase(page)).toBe("page");
    await expect(page.locator("[data-title-heading]")).toHaveCSS("opacity", "1");
  });
}
