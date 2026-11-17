import { expect, test, type Page } from "@playwright/test";
import { E2E } from "./fixtures";

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

async function scrollPageTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await expect.poll(() => scrollY(page)).toBe(y);
}

test.describe("the way back", () => {
  test("Back on a profile returns to the same place on People", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 640 });
    await page.goto("/people");
    await expect(page.getByRole("link", { name: "Open profile" }).first()).toBeVisible();

    await scrollPageTo(page, 200);
    await page.getByRole("link", { name: "Open profile" }).first().click();
    await expect(page).toHaveURL(/\/people\/seed-person$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(E2E.personName.split(" ")[0]);

    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(page).toHaveURL(/\/people$/);
    await expect.poll(() => scrollY(page)).toBe(200);
  });

  test("a profile opened directly goes Back to People", async ({ page }) => {
    await page.goto("/people/seed-person");
    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(page).toHaveURL(/\/people$/);
    await expect(page.getByRole("textbox", { name: "Search people..." })).toBeVisible();
  });

  test("the People search waits 500 ms and is still there after Back", async ({ page }) => {
    await page.goto("/people");
    const box = page.getByRole("textbox", { name: "Search people..." });

    await box.fill("seed");
    await expect(page.getByText("1 result", { exact: true })).toBeVisible();
    await box.fill("nobody-by-this-name");
    await expect(page.getByText("1 result", { exact: true })).toBeVisible();
    await expect(page.getByText("No people match this search.")).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(box).toHaveValue("");
    await expect(page.getByText("1 result", { exact: true })).toBeVisible();

    await box.fill("seed");
    await page.getByRole("link", { name: "Open profile" }).first().click();
    await expect(page).toHaveURL(/\/people\/seed-person$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/people$/);
    await expect(box).toHaveValue("seed");
  });

  test("Back from a tag page brings back the photos loaded and the place in them", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("hm.photography.view", "grid"));
    await page.goto("/photography");

    const cards = page.getByRole("button", { name: /^Seed Photo \d+/ });
    await expect(cards.first()).toBeVisible();
    const firstPage = await cards.count();
    await page.getByRole("button", { name: "Load more" }).click();
    await expect.poll(() => cards.count(), { timeout: 20_000 }).toBeGreaterThan(firstPage);
    const loaded = await cards.count();

    const target = page.getByRole("button", { name: /^Seed Photo 31\b/ });
    await target.scrollIntoViewIfNeeded();
    const place = await scrollY(page);
    expect(place).toBeGreaterThan(0);

    await target.click();
    await page.getByRole("dialog").getByRole("link", { name: "Exhibitions" }).click();
    await expect(page).toHaveURL(/\/photography\/exhibitions$/);

    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(page).toHaveURL(/\/photography$/);
    await expect(cards).toHaveCount(loaded);
    await expect.poll(() => scrollY(page)).toBe(place);
  });

  test("the tag row starts with All", async ({ page }) => {
    await page.goto("/photography");
    await expect(page.getByRole("link", { name: "All", exact: true })).toHaveAttribute("aria-current", "page");

    await page.goto("/photography/exhibitions");
    const all = page.getByRole("link", { name: "All", exact: true });
    await expect(all).toHaveAttribute("href", "/photography");
    await expect(all).not.toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "Exhibitions", exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("Back to top appears once the page scrolls and takes it to the top", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 640 });
    await page.goto("/people");
    const toTop = page.getByRole("button", { name: "Back to top" });
    const holder = page.locator(".hm-to-top");
    await expect(holder).toHaveAttribute("inert", "");
    await expect(holder).toHaveCSS("opacity", "0");

    await scrollPageTo(page, 600);
    await expect(holder).not.toHaveAttribute("inert", "");
    await expect(holder).toHaveCSS("opacity", "1");
    await toTop.click();
    await expect.poll(() => scrollY(page), { timeout: 5_000 }).toBe(0);
  });
});
