import { expect, test, type Locator, type Page } from "@playwright/test";
import { E2E } from "./fixtures";

// The popup's previous / next, its people links and its details (UX4).

const popup = (page: Page, name: string) => page.getByRole("dialog", { name });

function card(scope: Page | Locator, title: string) {
  return scope.getByRole("button", { name: new RegExp(`^${title}\\b`) });
}

// The focused element: which item's card it is, and whether a focus ring is drawn on it.
function focusedCard(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const style = getComputedStyle(el);
    return {
      title: el.getAttribute("aria-label") ?? el.querySelector("img")?.getAttribute("alt"),
      ring: style.outlineStyle !== "none" || style.boxShadow !== "none",
    };
  });
}

async function openGridPhoto(page: Page, title: string) {
  await card(page, title).click();
  await expect(popup(page, title)).toBeVisible();
}

// A finger's sideways (or downward) drag on the popup's media, as pointer events.
async function swipe(area: Locator, dx: number, dy = 0) {
  const box = (await area.boundingBox())!;
  const x0 = box.x + box.width / 2 - dx / 2;
  const y0 = box.y + box.height / 2 - dy / 2;
  const at = (share: number) => ({
    pointerType: "touch",
    pointerId: 7,
    isPrimary: true,
    bubbles: true,
    clientX: x0 + dx * share,
    clientY: y0 + dy * share,
  });
  await area.dispatchEvent("pointerdown", at(0));
  for (const share of [0.1, 0.3, 0.6, 1]) await area.dispatchEvent("pointermove", at(share));
  await area.dispatchEvent("pointerup", at(1));
}

test.describe("the photography popup", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("hm.photography.view", "grid"));
    await page.goto("/photography");
  });

  test("links people, shows each line once, and steps through the grid by button and keys", async ({ page }) => {
    await openGridPhoto(page, "Seed Photo 1");
    const first = popup(page, "Seed Photo 1");

    await expect(first.getByRole("link", { name: E2E.personName })).toHaveAttribute("href", "/people/seed-person");
    await expect(first.getByRole("link", { name: "Exhibitions" })).toHaveAttribute("href", "/photography/exhibitions");
    await expect(first.getByText("Details", { exact: true })).toBeVisible();
    await expect(first.getByText("Categories", { exact: true })).toHaveCount(0);
    await expect(first.getByText("2026", { exact: true })).toHaveCount(1);
    await expect(first.getByRole("button", { name: "Close" })).toBeFocused();
    const photo = first.locator("[data-popup-swipe]");
    await expect(photo.getByRole("button", { name: "Next" })).toBeVisible();
    await expect(photo.getByRole("button", { name: "Previous" })).toHaveAttribute("aria-disabled", "true");

    await first.getByRole("button", { name: "Next" }).click();
    await expect(popup(page, "Seed Photo 2")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(popup(page, "Seed Photo 3")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(popup(page, "Seed Photo 2")).toBeVisible();
    await popup(page, "Seed Photo 2").getByRole("button", { name: "Previous" }).click();
    await expect(popup(page, "Seed Photo 1")).toBeVisible();
  });

  test("near the end of the loaded photos the next page loads by itself, so Next moves on", async ({ page }) => {
    const loaded = page.locator("[data-expand-card]");
    await expect(loaded).toHaveCount(30);
    await card(page, "Seed Photo 26").scrollIntoViewIfNeeded();
    await openGridPhoto(page, "Seed Photo 26");
    await expect.poll(() => loaded.count(), { timeout: 20_000 }).toBeGreaterThan(30);

    for (let step = 0; step < 5; step += 1) await page.keyboard.press("ArrowRight");
    await expect(popup(page, "Seed Photo 31")).toBeVisible();
  });

  test("closing after moving returns to the card it ended on", async ({ page }) => {
    await openGridPhoto(page, "Seed Photo 1");
    for (let step = 0; step < 11; step += 1) await page.keyboard.press("ArrowRight");
    await expect(popup(page, "Seed Photo 12")).toBeVisible();
    await expect(card(page, "Seed Photo 12")).not.toBeInViewport();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(card(page, "Seed Photo 12")).toBeInViewport();
    // Focus is back on that card, with no ring: the popup was opened with a click.
    expect(await focusedCard(page)).toEqual({ title: "Seed Photo 12", ring: false });
  });

  test("a person's name opens their profile, and stays a plain name there", async ({ page }) => {
    await openGridPhoto(page, "Seed Photo 1");
    await popup(page, "Seed Photo 1").getByRole("link", { name: E2E.personName }).click();
    await expect(page).toHaveURL(/\/people\/seed-person$/);

    await openGridPhoto(page, "Seed Photo 1");
    const onProfile = popup(page, "Seed Photo 1");
    await expect(onProfile.getByText(E2E.personName, { exact: true })).toBeVisible();
    await expect(onProfile.getByRole("link", { name: E2E.personName })).toHaveCount(0);
  });
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("a sideways swipe moves on; a swipe down, or towards no item, doesn't", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("hm.photography.view", "grid"));
    await page.goto("/photography");
    await openGridPhoto(page, "Seed Photo 1");
    const area = page.getByRole("dialog").locator("[data-popup-swipe]");

    await swipe(area, 160);
    await page.waitForTimeout(400);
    await expect(popup(page, "Seed Photo 1")).toBeVisible();

    await swipe(area, 10, 200);
    await page.waitForTimeout(400);
    await expect(popup(page, "Seed Photo 1")).toBeVisible();

    await swipe(area, -160);
    await expect(popup(page, "Seed Photo 2")).toBeVisible();
    await swipe(area, 160);
    await expect(popup(page, "Seed Photo 1")).toBeVisible();
  });
});

test.describe("the globe's city window", () => {
  // Reduced motion: the homepage preloader shows nothing, so the city list can be pressed at once.
  test.use({ reducedMotion: "reduce" });

  test("steps through the city's works, and Escape closes only the window on top", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Paris/ }).click();
    const city = popup(page, "Exhibited works in Paris, France");
    await expect(city).toBeVisible();

    await card(city, "Seed Photo 1").click();
    await expect(popup(page, "Seed Photo 1")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(popup(page, "Seed Photo 1")).toHaveCount(0);
    await expect(city).toBeVisible();

    await card(city, "Seed Photo 1").click();
    await expect(popup(page, "Seed Photo 1")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(popup(page, "Seed Photo 2")).toBeVisible();
    await expect(popup(page, "Seed Photo 2").getByText("Seed Exhibition")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(popup(page, "Seed Photo 2")).toHaveCount(0);
    await expect(city).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(city).toHaveCount(0);
  });
});

test("the NFT popup shows its status on the artwork, its details once, and steps through the collection", async ({
  page,
}) => {
  await page.goto("/nft");
  await page.getByRole("button", { name: "View Seed Collectible" }).click();
  const first = popup(page, "Seed Collectible");
  await expect(first).toBeVisible();
  await expect(first.locator("[data-expand-target]").getByText("Available")).toBeVisible();
  await expect(first.getByText("Available", { exact: true })).toHaveCount(1);
  await expect(first.getByText("Currency", { exact: true })).toBeVisible();
  await expect(first.getByText("ETH", { exact: true })).toHaveCount(1);
  await expect(first.getByText("2026", { exact: true })).toHaveCount(1);
  await expect(first.getByRole("link", { name: "Exhibitions" })).toHaveAttribute("href", "/photography/exhibitions");
  await expect(first.getByText(/^Categories/)).toHaveCount(0);

  await first.getByRole("button", { name: "Next" }).click();
  await expect(popup(page, "Seed Edition")).toBeVisible();
  await expect(popup(page, "Seed Edition").getByRole("button", { name: "Next" })).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(popup(page, "Seed Collectible")).toBeVisible();
});

test("an NFT card gets focus back without a ring after Escape, unless it was opened from the keyboard", async ({
  page,
}) => {
  await page.goto("/nft");
  const collectible = page.getByRole("button", { name: "View Seed Collectible" });

  await collectible.click();
  await expect(popup(page, "Seed Collectible")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await focusedCard(page)).toEqual({ title: "View Seed Collectible", ring: false });

  // From the keyboard: Tab onto the card, Enter, Escape — the ring belongs there.
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(popup(page, "Seed Collectible")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await focusedCard(page)).toEqual({ title: "View Seed Collectible", ring: true });
});
