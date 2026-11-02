import { expect, test, type Page, type Route } from "@playwright/test";
import { E2E } from "./fixtures";

const ADDRESS = "reader@example.com";
const CONFIRMATION = "Almost there — check your inbox to confirm.";

// Holds every script file the page asks for, so the form stays exactly as the server sent it — with only React's
// inline script — until `release` lets them load.
async function holdScripts(page: Page) {
  const held: Route[] = [];
  let open = false;
  await page.route("**/_next/static/**/*.js", (route) => (open ? route.continue() : void held.push(route)));
  return async () => {
    open = true;
    await Promise.all(held.splice(0).map((route) => route.continue()));
  };
}

// Answers the form in the browser, so nothing is saved and nothing reaches Resend.
async function answerForm(page: Page, path: string) {
  const sent: unknown[] = [];
  await page.route(`**${path}`, async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  return sent;
}

const loaded = (page: Page) =>
  page.waitForFunction(() => {
    const form = document.querySelector("form");
    return Boolean(form && Object.keys(form).some((key) => key.startsWith("__reactFiber")));
  });

const heldSubmissions = (page: Page) =>
  page.evaluate(() => ((document as unknown as { $$reactFormReplay?: unknown[] }).$$reactFormReplay ?? []).length / 3);

for (const how of ["tap", "Enter"] as const) {
  test(`a sign-up made with ${how} before the page loads is sent once it has`, async ({ page }) => {
    const release = await holdScripts(page);
    const sent = await answerForm(page, "/api/subscribe");
    await page.goto("/blog", { waitUntil: "domcontentloaded" });

    const email = page.getByRole("textbox", { name: "Email", exact: true });
    await email.fill(ADDRESS);
    if (how === "tap") await page.getByRole("button", { name: "Keep me posted" }).click();
    else await email.press("Enter");

    await expect.poll(() => heldSubmissions(page)).toBe(1);
    expect(new URL(page.url()).pathname).toBe("/blog");
    expect(new URL(page.url()).search).toBe("");
    expect(sent).toHaveLength(0);

    await release();
    await expect(page.getByText(CONFIRMATION)).toBeVisible();
    expect(sent).toEqual([{ email: ADDRESS, website: "", formToken: expect.any(String) }]);
    await expect(email).toHaveValue("");
    expect(new URL(page.url()).search).toBe("");
  });
}

test("the contact form keeps and sends what was typed before the page loaded", async ({ page }) => {
  const release = await holdScripts(page);
  const sent = await answerForm(page, "/api/inquiries");
  await page.goto("/contact", { waitUntil: "domcontentloaded" });

  await page.getByPlaceholder("Your name").fill("Early Visitor");
  await page.getByPlaceholder("you@email.com").fill(ADDRESS);
  // The seed provides exactly one service; index 0 is the "Select…" placeholder.
  await page.getByRole("combobox", { name: "Service" }).selectOption({ index: 1 });
  await page.getByPlaceholder("Tell me about your project").fill("Typed before the page loaded.");

  await release();
  await loaded(page);
  await expect(page.getByText(`Booking: ${E2E.serviceName} • photography`)).toBeVisible();
  await expect(page.getByPlaceholder("Your name")).toHaveValue("Early Visitor");

  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("status")).toHaveText("Sent. I'll get back to you soon.", { timeout: 20_000 });
  expect(sent).toEqual([
    expect.objectContaining({
      name: "Early Visitor",
      email: ADDRESS,
      message: "Typed before the page loaded.",
      serviceName: E2E.serviceName,
      category: "photography",
    }),
  ]);
});

test("a service's booking link opens the contact form on that service", async ({ page }) => {
  await page.goto("/services/seed-editorial-session");
  await page.getByRole("link", { name: "Book this service" }).click();

  await expect(page).toHaveURL(/\/contact\?service=seed-editorial-session/);
  await expect(page.getByText(`Booking: ${E2E.serviceName} • photography`)).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Service" }).locator("option:checked")).toHaveText(
    /Seed Editorial Session/
  );
});
