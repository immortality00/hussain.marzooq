import { expect, test, type Locator, type Page, type Request } from "@playwright/test";
import { mediaIdByTitle, otherDevice, renameMedia, signIn } from "./admin-helpers";

// Pull to refresh (MO5) at phone width: the same in a browser tab and in the Home Screen apps. The finger is
// synthetic touch events, which run the gesture but never scroll the page; the Chrome-only test uses real touches.
test.use({ viewport: { width: 393, height: 852 }, hasTouch: true });

const renamed: { id: string; title: string }[] = [];

test.afterEach(async ({ browser }) => {
  if (renamed.length === 0) return;
  const other = await otherDevice(browser);
  for (const { id, title } of renamed.splice(0)) await renameMedia(other.page, id, title);
  await other.context.close();
});

const asHomeScreenApp = (page: Page) =>
  page.addInitScript(() => Object.defineProperty(navigator, "standalone", { get: () => true, configurable: true }));

async function renameElsewhere(browser: import("@playwright/test").Browser, from: string, to: string) {
  const other = await otherDevice(browser);
  const id = await mediaIdByTitle(other.page, from);
  renamed.push({ id, title: from });
  expect(await renameMedia(other.page, id, to)).toBe(200);
  await other.context.close();
}

function requests(page: Page, matches: (request: Request) => boolean) {
  const seen: string[] = [];
  page.on("request", (request) => {
    if (matches(request)) seen.push(request.url());
  });
  return seen;
}

const pathIs = (path: string) => (request: Request) => new URL(request.url()).pathname === path;

/** One finger on `target`, `dy` px down (and `dx` sideways) in steps; held until `release()`. */
async function touchDown(target: Locator, dy: number, dx = 0) {
  const box = await target.boundingBox();
  if (!box) throw new Error("Nothing to touch.");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const at = (share: number) => ({ identifier: 1, clientX: x + dx * share, clientY: y + dy * share });
  const send = (type: string, share: number, down: boolean) =>
    target.dispatchEvent(type, {
      bubbles: true,
      cancelable: true,
      touches: down ? [at(share)] : [],
      targetTouches: down ? [at(share)] : [],
      changedTouches: [at(share)],
    });
  await send("touchstart", 0, true);
  for (const share of [0.03, 0.1, 0.25, 0.5, 0.75, 1]) await send("touchmove", share, true);
  return { release: () => send("touchend", 1, false) };
}

async function pull(target: Locator, dy: number, dx = 0) {
  await (await touchDown(target, dy, dx)).release();
}

const logo = (page: Page) => page.locator(".hm-pull-logo");
const pageShift = (page: Page) =>
  page.locator("[data-pull-moves]").last().evaluate((element) => getComputedStyle(element).translate);

async function nothingHappened(page: Page) {
  await expect(logo(page)).not.toHaveAttribute("data-pull-state", /./);
  expect(await pageShift(page)).toBe("none");
}

const adminWordmark = (page: Page) => page.locator('[data-pull-moves] [aria-label="Hussain.Art"]');

test.describe("admin", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("a pull at the top refreshes a list kept outside the shared data, even when the check finds nothing new", async ({
    page,
    browser,
  }) => {
    await page.goto("/admin/media/list?q=Seed%20Photo%2065");
    await expect(page.getByText("Seed Photo 65", { exact: true })).toBeVisible();
    await renameElsewhere(browser, "Seed Photo 65", "Seed Photo 65 (pulled)");
    const checks = requests(page, pathIs("/api/admin/snapshot"));
    const lists = requests(page, pathIs("/api/media/admin-list"));

    const finger = await touchDown(adminWordmark(page), 200);
    await expect(logo(page)).toHaveAttribute("data-pull-state", "armed");
    expect(await pageShift(page)).toBe("0px 70px");
    await finger.release();
    await expect(logo(page)).toHaveAttribute("data-pull-state", "refreshing");

    await expect(page.getByText("Seed Photo 65 (pulled)", { exact: true })).toBeVisible();
    await expect.poll(() => pageShift(page)).toBe("none");
    await nothingHappened(page);
    expect(checks.length).toBeGreaterThan(0);
    expect(lists.length).toBeGreaterThan(0);
  });

  test("a pull short of the threshold goes back without refreshing", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Loading", { exact: true })).toHaveCount(0);
    const checks = requests(page, pathIs("/api/admin/snapshot"));
    const finger = await touchDown(adminWordmark(page), 100);
    await expect(logo(page)).toHaveAttribute("data-pull-state", "pulling");
    expect(await pageShift(page)).toBe("0px 35px");
    await finger.release();
    await expect.poll(() => pageShift(page)).toBe("none");
    await page.waitForTimeout(400);
    expect(checks).toHaveLength(0);
  });

  test("never a pull: sideways, from a field, scrolled down, on a drag handle, with a window open", async ({ page }) => {
    const checks = requests(page, pathIs("/api/admin/snapshot"));
    await page.goto("/admin/media/list");
    await expect(page.getByText("Seed Photo 1", { exact: true })).toBeVisible();
    checks.length = 0;

    await pull(adminWordmark(page), 30, 180);
    await nothingHappened(page);
    await pull(page.getByPlaceholder("Search title, tags, people..."), 200);
    await nothingHappened(page);
    await page.evaluate(() => window.scrollTo(0, 400));
    await pull(page.getByText("Seed Photo 10", { exact: true }), 200);
    await nothingHappened(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.goto("/admin/tags");
    const handle = page.locator('[aria-roledescription="sortable"]').first();
    await expect(handle).toBeVisible();
    checks.length = 0;
    await pull(handle, 200);
    await nothingHappened(page);

    await page.goto("/admin/dashboard");
    await page.getByRole("button", { name: "Sign out everywhere" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    checks.length = 0;
    await pull(adminWordmark(page), 200);
    await nothingHappened(page);
    await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
    expect(checks).toHaveLength(0);
  });

  test("Analytics loads its numbers again", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
    const analytics = requests(page, pathIs("/api/admin/analytics"));
    await pull(adminWordmark(page), 200);
    await expect.poll(() => analytics.length).toBeGreaterThan(0);
    await expect.poll(() => pageShift(page)).toBe("none");
  });
});

test.describe("site", () => {
  test("a pull brings the page again from the server, without a reload", async ({ page, browser }) => {
    await page.goto("/videography");
    await expect(page.getByText("Seed Film 1", { exact: true }).first()).toBeVisible();
    await renameElsewhere(browser, "Seed Film 1", "Seed Film 1 (pulled)");
    const loads = requests(page, (request) => request.isNavigationRequest());
    const refreshes = requests(page, (request) => pathIs("/videography")(request) && request.headers().rsc === "1");

    await pull(page.locator("main h1").first(), 200);
    await expect(logo(page)).toHaveAttribute("data-pull-state", "refreshing");
    await expect(page.getByText("Seed Film 1 (pulled)", { exact: true }).first()).toBeVisible();
    await expect.poll(() => pageShift(page)).toBe("none");
    expect(refreshes.length).toBeGreaterThan(0);
    expect(loads).toHaveLength(0);
  });

  test("the navbar and the page come down together, with the signature above them", async ({ page }) => {
    await page.goto("/people");
    const finger = await touchDown(page.locator("main h1").first(), 120);
    const shifts = await page
      .locator("[data-pull-moves]")
      .evaluateAll((blocks) => blocks.map((block) => getComputedStyle(block).translate));
    expect(shifts).toEqual(["0px 42px", "0px 42px"]);
    await expect(logo(page)).toHaveCSS("opacity", "1");
    await finger.release();
    await expect.poll(() => pageShift(page)).toBe("none");
  });
});

test.describe("real touches (Chrome)", () => {
  test.use({ isMobile: true });

  test("a pull keeps the page still and its touch away from the page; a swipe up still scrolls", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "Real touch input comes from Chromium's DevTools protocol.");
    await page.goto("/videography");
    const heading = page.locator("main h1").first();
    await expect(heading).toBeVisible();
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", x = 0, y = 0) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
    const seen = () => page.evaluate(() => (window as unknown as { seen: string[] }).seen);
    await page.evaluate(() => {
      const record = window as unknown as { seen: string[] };
      record.seen = [];
      for (const type of ["pointerup", "pointercancel", "click"]) {
        document.addEventListener(type, () => record.seen.push(type), true);
      }
    });

    const box = (await heading.boundingBox())!;
    const x = box.x + 40;
    await touch("touchStart", x, box.y + 10);
    for (let step = 1; step <= 10; step += 1) await touch("touchMove", x, box.y + 10 + step * 22);
    await expect(logo(page)).toHaveAttribute("data-pull-state", "armed");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await touch("touchEnd");
    await expect.poll(() => pageShift(page)).toBe("none");
    expect(await seen()).toEqual(["pointercancel"]);

    await touch("touchStart", x, 600);
    for (let step = 1; step <= 10; step += 1) await touch("touchMove", x, 600 - step * 35);
    await touch("touchEnd");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });
});

test("opened from the Home Screen, the pull is the same", async ({ page }) => {
  await asHomeScreenApp(page);
  await page.goto("/videography");
  const heading = page.locator("main h1").first();
  await expect(heading).toBeVisible();
  const finger = await touchDown(heading, 200);
  await expect(logo(page)).toHaveAttribute("data-pull-state", "armed");
  await finger.release();
  await expect(logo(page)).toHaveAttribute("data-pull-state", "refreshing");
  await expect.poll(() => pageShift(page)).toBe("none");
});
