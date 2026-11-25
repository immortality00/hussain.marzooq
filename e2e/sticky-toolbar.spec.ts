import { expect, test, type Page } from "@playwright/test";
import { openScreen, signIn } from "./admin-helpers";

// The public navbar is 57px (h-14 + hairline); every bar keeps a 12px gap under
// whatever sits above it. On Photography the page's title bar (56px, UX1b) sits between.
const GAP = 12;
const NAV = 57;
const TITLE_BAR = 56;

async function scrollPage(page: Page, y: number) {
  await page.evaluate((top) => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (y: number, o: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
    else window.scrollTo(0, top);
  }, y);
}

const barTop = (page: Page) =>
  page.locator(".hm-sticky-toolbar").first().evaluate((el) => Math.round(el.getBoundingClientRect().top));

test("the photography filter bar stays under the title bar while the grid scrolls", async ({ page }) => {
  await page.goto("/photography");
  await page.getByRole("button", { name: "Grid" }).first().click();
  await expect(page.getByRole("button", { name: /^Seed Photo \d+/ }).first()).toBeVisible();

  const bar = page.locator(".hm-sticky-toolbar").first();
  await expect(bar).not.toHaveAttribute("data-stuck");
  const resting = await barTop(page);
  expect(resting).toBeGreaterThan(NAV + TITLE_BAR + GAP);

  await scrollPage(page, 1500);
  await expect.poll(() => barTop(page)).toBe(NAV + TITLE_BAR + GAP);
  await expect(bar).toHaveAttribute("data-stuck", "");

  await scrollPage(page, 0);
  await expect.poll(() => barTop(page)).toBe(resting);
  await expect(bar).not.toHaveAttribute("data-stuck");
});

test("the admin media filters stick at the top and move under the bulk bar", async ({ page }) => {
  await signIn(page);
  await openScreen(page, "Media");
  await expect(page.getByRole("checkbox", { name: /^Select / }).nth(1)).toBeVisible();

  const bar = page.locator(".hm-sticky-toolbar").first();
  await scrollPage(page, 1500);
  await expect.poll(() => barTop(page)).toBe(GAP);
  await expect(bar).toHaveAttribute("data-stuck", "");

  // Checking scrolls the page back to the checkbox, so scroll down again after.
  await page.getByRole("checkbox", { name: "Select all media" }).check();
  await expect(page.getByText(/\d+ selected/)).toBeVisible();
  await scrollPage(page, 1500);

  const covered = await page.evaluate(() =>
    Math.ceil(document.getElementById("admin-sticky-region")!.getBoundingClientRect().bottom),
  );
  expect(covered).toBeGreaterThan(GAP);
  await expect.poll(() => barTop(page)).toBe(covered + GAP);

  await page.getByRole("button", { name: "Clear selection" }).click();
  await expect.poll(() => barTop(page)).toBe(GAP);
});
