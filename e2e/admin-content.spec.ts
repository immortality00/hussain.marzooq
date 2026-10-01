import { expect, test } from "@playwright/test";
import { E2E } from "./fixtures";
import { fieldAfter, freshLoad, openScreen, signIn } from "./admin-helpers";

test.describe("admin content screens", () => {
  test("pages: a search title saved here survives a fresh load", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/pages/about");
    await fieldAfter(page, "Page title").fill("About — e2e title");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("About saved.")).toBeVisible();
    await freshLoad(page);
    await expect(fieldAfter(page, "Page title")).toHaveValue("About — e2e title");
  });

  test("blog: a post edited here shows in the list at once and after a fresh load", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Blog");
    await page.getByRole("link", { name: E2E.blogPostTitle }).first().click();
    await page.locator("input").first().fill(`${E2E.blogPostTitle} Edited`);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Post saved.")).toBeVisible();
    await openScreen(page, "Blog");
    await expect(page.getByText(`${E2E.blogPostTitle} Edited`).first()).toBeVisible();
    await freshLoad(page);
    await expect(page.getByText(`${E2E.blogPostTitle} Edited`).first()).toBeVisible();
  });

  test("people: a profile edited here shows at once and after a fresh load", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "People");
    await page.getByRole("button", { name: "Edit", exact: true }).first().click();
    await fieldAfter(page, "Bio").fill("Bio written by the end-to-end suite.");
    await page.getByRole("button", { name: "Update", exact: true }).click();
    await expect(page.getByText("✅ Person updated.")).toBeVisible();
    await freshLoad(page);
    await page.getByRole("button", { name: "Edit", exact: true }).first().click();
    await expect(fieldAfter(page, "Bio")).toHaveValue("Bio written by the end-to-end suite.");
  });

  test("private galleries: a renamed gallery shows at once and after a fresh load", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Private Galleries");
    await page.getByRole("button", { name: "Edit", exact: true }).first().click();
    await fieldAfter(page, "Title").fill("E2E Gallery Renamed");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Update gallery" }).click();
    await expect(page.getByText("✅ Gallery updated.")).toBeVisible();
    await expect(page.getByText("E2E Gallery Renamed").first()).toBeVisible();
    await freshLoad(page);
    await expect(page.getByText("E2E Gallery Renamed").first()).toBeVisible();
  });
});
