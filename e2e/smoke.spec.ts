import { expect, test } from "@playwright/test";
import { E2E } from "./fixtures";

test.describe("public site", () => {
  test("homepage renders the hero, the work and the footer", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("link", { name: "See the work" }).first()).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("a bad URL renders the branded 404, not Next's default screen", async ({ page }) => {
    const response = await page.goto("/definitely-not-a-real-page");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back home" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("This page could not be found");
  });

  test("videography loads its seeded films", async ({ page }) => {
    await page.goto("/videography");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("button", { name: /Seed Film 1/ }).first()).toBeVisible();
  });
});

test.describe("photography", () => {
  test("loads the first page and paginates past 60", async ({ page }) => {
    await page.goto("/photography");

    // Only the grid view carries Load more; the viewer may have remembered another.
    await page.getByRole("button", { name: "Grid" }).first().click();

    const cards = page.getByRole("button", { name: /^Seed Photo \d+/ });
    await expect(cards.first()).toBeVisible();

    const firstPage = await cards.count();
    expect(firstPage).toBeGreaterThan(0);
    expect(firstPage).toBeLessThan(E2E.photographyCount);

    const loadMore = page.getByRole("button", { name: "Load more" });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      if ((await loadMore.count()) === 0) break;

      const before = await cards.count();
      await loadMore.click();
      await expect.poll(() => cards.count(), { timeout: 20_000 }).toBeGreaterThan(before);

      if ((await cards.count()) >= E2E.photographyCount) break;
    }

    expect(await cards.count()).toBe(E2E.photographyCount);
    await expect(page.getByRole("button", { name: `Seed Photo ${E2E.photographyCount}` })).toBeVisible();
  });
});

test.describe("nft", () => {
  test("opens a collectible in the detail modal", async ({ page }) => {
    await page.goto("/nft");

    await page.getByRole("button", { name: "View Seed Collectible" }).click();

    // The closed WorkOverlay also carries an aria-label="Close" button, so match
    // the modal's own text-labelled one (see the WorkOverlay a11y defect, §L9).
    const close = page.getByText("Close", { exact: true });
    await expect(close).toBeVisible();
    await expect(page.getByText("Seed Collectible").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(close).toHaveCount(0);
  });
});

test.describe("contact", () => {
  test("submits an inquiry and lands on the success state", async ({ page }) => {
    await page.goto("/contact");

    await page.getByPlaceholder("Your name").fill("E2E Visitor");
    await page.getByPlaceholder("you@email.com").fill("e2e-visitor@example.com");
    // The seed provides exactly one service; index 0 is the "Select…" placeholder.
    const service = page.locator("select").first();
    await expect(service.locator("option")).toHaveCount(2);
    await service.selectOption({ index: 1 });
    await page
      .getByPlaceholder(/tell me about your project|add your message here/i)
      .fill(`Seeded end-to-end enquiry ${Date.now()}.`);

    // The route rejects anything submitted under 2.5s as bot traffic.
    await page.waitForTimeout(3_000);
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page).toHaveURL(/success=1/, { timeout: 20_000 });
  });
});

test.describe("private gallery", () => {
  test("locks, rejects a wrong password, then unlocks", async ({ page }) => {
    await page.goto(`/g/${E2E.gallerySlug}`);

    const passwordField = page.getByPlaceholder("Enter password");
    const openGallery = page.getByRole("button", { name: "Open gallery" });

    await expect(passwordField).toBeVisible();
    await expect(page.getByText("Seed Private Frame")).toHaveCount(0);

    await passwordField.fill("wrong-password");
    await openGallery.click();
    await expect(passwordField).toBeVisible();
    await expect(page.getByText("Seed Private Frame")).toHaveCount(0);

    await passwordField.fill(E2E.galleryPassword);
    await openGallery.click();

    await expect(passwordField).toBeHidden({ timeout: 20_000 });
    await expect(page.getByText("Seed Private Frame").first()).toBeVisible();
  });
});

test.describe("admin", () => {
  test("rejects a wrong password and signs in with the right one", async ({ page }) => {
    await page.goto("/admin");

    const password = page.getByPlaceholder("Password");
    const login = page.getByRole("button", { name: "Login" });

    await expect(password).toBeVisible();

    await password.fill("not-the-password");
    await login.click();
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);

    await page.getByPlaceholder("Password").fill(E2E.adminPassword);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
  });
});
