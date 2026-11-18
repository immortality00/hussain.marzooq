import { expect, test, type Page } from "@playwright/test";
import { openScreen, signIn } from "./admin-helpers";

// UX2: an admin list comes back where it was left — its search, its rows, the row that was opened — and the
// media editor steps through the list's items without it.

const SEARCH = "Search title, tags, people...";

function mediaRow(page: Page, title: string) {
  return page.locator("[data-list-row]").filter({ has: page.getByText(title, { exact: true }) });
}

async function topOf(page: Page, title: string) {
  return mediaRow(page, title).evaluate((row) => Math.round(row.getBoundingClientRect().top));
}

async function openMediaList(page: Page, mobile: boolean) {
  if (mobile) await page.goto("/admin/media/list");
  else await openScreen(page, "Media");
  await expect(mediaRow(page, "Seed Photo 36")).toBeVisible();
}

async function editorTitle(page: Page) {
  return page.locator("input").first();
}

for (const mobile of [false, true]) {
  test.describe(mobile ? "at 393 px" : "on desktop", () => {
    if (mobile) test.use({ viewport: { width: 393, height: 852 }, isMobile: false });

    test("Back to list returns to the row that was opened, marked", async ({ page }) => {
      await signIn(page);
      await openMediaList(page, mobile);

      const row = mediaRow(page, "Seed Photo 36");
      await row.scrollIntoViewIfNeeded();
      const before = await topOf(page, "Seed Photo 36");
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(2000);

      await row.getByRole("link", { name: "Edit" }).click();
      await expect(page.getByRole("heading", { name: "Edit media" })).toBeVisible();
      await expect(page.getByRole("button", { name: /Details/ })).toHaveAttribute("aria-current", "step");
      await expect(await editorTitle(page)).toHaveValue("Seed Photo 36");

      await page.getByRole("link", { name: "Back to list" }).click();
      await expect(page).toHaveURL(/\/admin\/media\/list$/);
      await expect(row).toHaveClass(/hm-row-returned/);
      await expect.poll(async () => Math.abs((await topOf(page, "Seed Photo 36")) - before)).toBeLessThanOrEqual(1);
    });
  });
}

test.describe("media list and editor", () => {
  test("a search is kept on the way back — the browser's Back and the editor's", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Media");
    const box = page.getByRole("textbox", { name: SEARCH });
    await box.fill("Seed Photo 3");
    await expect(page).toHaveURL(/q=Seed\+Photo\+3/);
    await expect(page.getByText("Showing 11 results", { exact: false })).toBeVisible();

    await mediaRow(page, "Seed Photo 34").getByRole("link", { name: "Edit" }).click();
    await expect(page.getByRole("heading", { name: "Edit media" })).toBeVisible();
    await page.goBack();
    await expect(box).toHaveValue("Seed Photo 3");
    await expect(page.getByText("Showing 11 results", { exact: false })).toBeVisible();
    await expect(mediaRow(page, "Seed Photo 34")).toHaveClass(/hm-row-returned/);

    await mediaRow(page, "Seed Photo 38").getByRole("link", { name: "Edit" }).click();
    await page.getByRole("link", { name: "Back to list" }).click();
    await expect(box).toHaveValue("Seed Photo 3");
    await expect(mediaRow(page, "Seed Photo 38")).toHaveClass(/hm-row-returned/);
  });

  test("Next item walks the list without it, past the loaded rows, and the list comes back to the last one", async ({
    page,
  }) => {
    await signIn(page);
    await openScreen(page, "Media");
    await mediaRow(page, "Seed Photo 36").getByRole("link", { name: "Edit" }).click();
    await expect(await editorTitle(page)).toHaveValue("Seed Photo 36");

    await page.getByRole("button", { name: "Next item" }).click();
    await expect(await editorTitle(page)).toHaveValue("Seed Photo 37");
    await page.getByRole("button", { name: "Next item" }).click();
    await expect(await editorTitle(page)).toHaveValue("Seed Photo 38");
    await expect(page).toHaveURL(/edit=/);
    await page.getByRole("button", { name: "Previous item" }).click();
    await expect(await editorTitle(page)).toHaveValue("Seed Photo 37");
    await expect(page.getByRole("button", { name: /Details/ })).toHaveAttribute("aria-current", "step");

    await page.getByRole("link", { name: "Back to list" }).click();
    await expect(mediaRow(page, "Seed Photo 37")).toHaveClass(/hm-row-returned/);
    await expect(mediaRow(page, "Seed Photo 37")).toBeInViewport();

    // Row 60 is the last one the list has loaded; Next loads the next page.
    await mediaRow(page, "Seed Photo 55").getByRole("link", { name: "Edit" }).click();
    await page.getByRole("button", { name: "Next item" }).click();
    await expect(await editorTitle(page)).toHaveValue("Seed Photo 56");
    await page.getByRole("link", { name: "Back to list" }).click();
    await expect(mediaRow(page, "Seed Photo 56")).toHaveClass(/hm-row-returned/);
  });

  test("unsaved changes are asked about before moving to the next item", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Media");
    await mediaRow(page, "Seed Photo 36").getByRole("link", { name: "Edit" }).click();
    const title = await editorTitle(page);
    await expect(title).toHaveValue("Seed Photo 36");
    await title.fill("Seed Photo 36 — not saved");

    await page.getByRole("button", { name: "Next item" }).click();
    const question = page.getByRole("dialog", { name: "Discard your changes?" });
    await expect(question).toBeVisible();
    await question.getByRole("button", { name: "Keep editing" }).click();
    await expect(title).toHaveValue("Seed Photo 36 — not saved");

    await page.getByRole("button", { name: "Next item" }).click();
    await question.getByRole("button", { name: "Discard" }).click();
    await expect(await editorTitle(page)).toHaveValue("Seed Photo 37");
  });

  test("the dashboard's Videography row opens the list filtered to videography", async ({ page }) => {
    await signIn(page);
    await page.getByRole("link", { name: /^Videography/ }).click();
    await expect(page).toHaveURL(/\/admin\/media\/list\?category=videography$/);
    await expect(page.getByText("Showing 4 results for category videography.")).toBeVisible();
  });
});
