import { expect, test } from "@playwright/test";
import { E2E } from "./fixtures";
import { freshLoad, openScreen, signIn } from "./admin-helpers";

test.describe("admin inbox", () => {
  test("resolving an inquiry drops the badge at once, and a fresh load agrees", async ({ page }) => {
    await signIn(page);
    const badge = page.locator("aside").getByLabel(/pending$/);
    await expect(badge).toHaveAccessibleName("3 pending");

    await openScreen(page, "Inquiries");
    await page.waitForLoadState("networkidle");
    await page.route(/\/api\/admin\/snapshot/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      await route.continue();
    });
    await page.getByRole("button", { name: new RegExp(E2E.inquiryName) }).click();
    await page.getByRole("button", { name: "resolved", exact: true }).click();
    await expect(badge).toHaveAccessibleName("2 pending", { timeout: 2_000 });

    await page.unroute(/\/api\/admin\/snapshot/);
    await freshLoad(page);
    await expect(page.locator("aside").getByLabel(/pending$/)).toHaveAccessibleName("2 pending");
  });

  test("approving a review shows at once and stays after a fresh load", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Testimonials");
    await page.getByRole("button", { name: "Approve", exact: true }).first().click();
    await expect(page.getByText("✅ Review approved.")).toBeVisible();
    await freshLoad(page);
    await page.getByRole("button", { name: "approved", exact: true }).click();
    await expect(page.getByText(E2E.reviewerName).first()).toBeVisible();
  });

  test("dismissing a removal request moves it to the history, and a fresh load agrees", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Removal Requests");
    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Dismiss" }).first().click();
    await expect(page.getByText("✅ Request dismissed.")).toBeVisible();
    await expect(page.getByText("No requests to review.")).toBeVisible();
    await freshLoad(page);
    await expect(page.getByText("No requests to review.")).toBeVisible();
    await expect(page.getByText(E2E.personName).first()).toBeVisible();
  });
});
