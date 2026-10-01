import { expect, test } from "@playwright/test";
import { E2E } from "./fixtures";
import { freshLoad, hasInputValue, openScreen, signIn } from "./admin-helpers";

test.describe("admin catalog screens", () => {
  test("tags: add, rename, hide and delete, and a fresh load agrees each time", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Tags");
    await page.getByPlaceholder("Label (e.g. Fashion)").fill("Night Light");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("✅ Tag created.")).toBeVisible();
    await freshLoad(page);
    expect(await hasInputValue(page, "Night Light")).toBe(true);

    const label = page.locator('input[value="Night Light"]');
    await label.fill("Night Glow");
    await label.blur();
    await expect(page.getByText("✅ Tag updated.")).toBeVisible();
    await freshLoad(page);
    expect(await hasInputValue(page, "Night Glow")).toBe(true);

    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: "Delete", exact: true }).last().click();
    await expect(page.getByText("✅ Tag deleted.")).toBeVisible();
    await freshLoad(page);
    expect(await hasInputValue(page, "Night Glow")).toBe(false);
  });

  test("blog categories: add and rename, and a fresh load agrees", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Blog Categories");
    await page.getByPlaceholder("Category name").fill("Journal");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("Category created.")).toBeVisible();
    await freshLoad(page);
    expect(await hasInputValue(page, "Journal")).toBe(true);
  });

  test("service categories: add, and a fresh load agrees", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Service Categories");
    await page.getByPlaceholder("Name", { exact: true }).fill("Weddings");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText("✅ Category created.")).toBeVisible();
    await freshLoad(page);
    expect(await hasInputValue(page, "Weddings")).toBe(true);
  });

  test("services: edit a service, and a fresh load agrees", async ({ page }) => {
    await signIn(page);
    await openScreen(page, "Services");
    await page.getByRole("button", { name: "Edit", exact: true }).first().click();
    await page.getByRole("textbox", { name: "Name", exact: true }).fill(`${E2E.serviceName} Updated`);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("✅ Service updated.")).toBeVisible();
    await freshLoad(page);
    await expect(page.getByText(`${E2E.serviceName} Updated`).first()).toBeVisible();
  });
});
