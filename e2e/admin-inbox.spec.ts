import { expect, test } from "@playwright/test";
import { E2E } from "./fixtures";
import { freshLoad, openScreen, signIn } from "./admin-helpers";

test.describe("admin inbox", () => {
  test("resolving an inquiry drops the badge at once, and a fresh load agrees", async ({ page }) => {
    await signIn(page);
    const badge = page.locator("aside").getByLabel(/pending$/);
    await expect(badge).toHaveAccessibleName("3 pending");

    const checked = page.waitForResponse((response) => response.url().includes("/api/admin/snapshot"));
    await openScreen(page, "Inquiries");
    await checked;
    await page.route(/\/api\/admin\/snapshot/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      await route.continue();
    });
    await page.getByRole("button", { name: new RegExp(E2E.inquiryName) }).click();
    await page.getByRole("button", { name: "resolved", exact: true }).click();
    await expect(badge).toHaveAccessibleName("2 pending", { timeout: 2_000 });

    // The held data check is still sleeping; the reload below aborts it, and a plain
    // unroute would let its late route.continue() fail the test ("Route is already handled").
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await freshLoad(page);
    await expect(page.locator("aside").getByLabel(/pending$/)).toHaveAccessibleName("2 pending");
  });

  test("approving a review shows at once and stays after a fresh load", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Testimonials");
    await page.getByRole("button", { name: "Approve", exact: true }).first().click();
    await expect(page.getByText("Review approved.")).toBeVisible();
    await freshLoad(page);
    await page.getByRole("button", { name: "Approved", exact: true }).click();
    await expect(page.getByText(E2E.reviewerName).first()).toBeVisible();
  });

  test("dismissing a removal request moves it to the history, and a fresh load agrees", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Removal Requests");
    await page.getByRole("button", { name: "Dismiss", exact: true }).first().click();
    const question = page.getByRole("dialog", { name: `Dismiss the request from “${E2E.personName}”?` });
    await question.getByRole("button", { name: "Dismiss", exact: true }).click();
    await expect(page.getByText("Request dismissed.")).toBeVisible();
    await expect(page.getByText("No requests to review.")).toBeVisible();
    await freshLoad(page);
    await expect(page.getByText("No requests to review.")).toBeVisible();
    await expect(page.getByText(E2E.personName).first()).toBeVisible();
  });
});
