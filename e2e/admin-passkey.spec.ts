import { expect, test, type Browser, type BrowserContext, type CDPSession, type Page } from "@playwright/test";
import { E2E } from "./fixtures";
import { signIn } from "./admin-helpers";
import { resetAdminSecurity } from "./security-db";

type Device = { context: BrowserContext; page: Page; cdp: CDPSession; authenticatorId: string };

// Chromium's built-in test authenticator stands in for Face ID / Touch ID and iCloud Keychain.
async function device(browser: Browser): Promise<Device> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  const { authenticatorId } = await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
      defaultBackupEligibility: true,
      defaultBackupState: true,
    },
  });
  return { context, page, cdp, authenticatorId };
}

async function syncPasskeys(from: Device, to: Device) {
  const { credentials } = await from.cdp.send("WebAuthn.getCredentials", { authenticatorId: from.authenticatorId });
  for (const credential of credentials) {
    await to.cdp.send("WebAuthn.addCredential", { authenticatorId: to.authenticatorId, credential });
  }
}

async function enterPassword(page: Page) {
  await page.goto("/admin/dashboard");
  await page.getByPlaceholder("Password").fill(E2E.adminPassword);
  await page.getByRole("button", { name: "Login" }).click();
}

async function askForApproval(page: Page) {
  await enterPassword(page);
  await page.getByRole("button", { name: "Approve on another device" }).click();
  const number = page.locator('[aria-label^="Number "]');
  await expect(number).toBeVisible();
  return Number(await number.textContent());
}

async function openApprovals(page: Page) {
  await page.goto("/admin/approve-sign-in");
  await expect(page.getByRole("heading", { name: "Approve sign-in" })).toBeVisible();
}

test.describe.serial("admin second sign-in step", () => {
  let mac: Device;
  let iphone: Device;

  test.beforeAll(async ({ browser }) => {
    await resetAdminSecurity();
    mac = await device(browser);
    iphone = await device(browser);
  });

  test.afterAll(async () => {
    await mac?.context.close();
    await iphone?.context.close();
    await resetAdminSecurity();
  });

  test("before any passkey the password alone signs in; adding one asks for the password", async () => {
    await signIn(mac.page);
    await mac.page.getByRole("button", { name: "Add a passkey" }).click();
    const dialog = mac.page.getByRole("dialog", { name: "Add a passkey" });
    await dialog.getByPlaceholder("Password").fill("not-the-password");
    await dialog.getByRole("button", { name: "Continue" }).click();
    await expect(mac.page.getByText("Wrong password.")).toBeVisible();

    await dialog.getByPlaceholder("Password").fill(E2E.adminPassword);
    await dialog.getByRole("button", { name: "Continue" }).click();
    await expect(mac.page.getByText("Passkey added.")).toBeVisible();
    await expect(dialog).toHaveCount(0);
    await expect(mac.page.getByRole("button", { name: /^Remove / })).toBeDisabled();
  });

  test("a new device needs the second step, and a synced passkey passes it", async () => {
    await syncPasskeys(mac, iphone);
    await enterPassword(iphone.page);
    await expect(iphone.page.getByRole("button", { name: "Use passkey" })).toBeVisible();
    await expect(iphone.page).toHaveURL(/\/admin\/sign-in/);

    await iphone.page.getByRole("button", { name: "Use passkey" }).click();
    await expect(iphone.page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });

    await iphone.page.getByRole("button", { name: "Logout" }).click();
    await expect(iphone.page.getByText("Logged out.")).toBeVisible();
    await enterPassword(iphone.page);
    await expect(iphone.page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
  });

  test("a device without the passkey signs in when another device picks the matching number", async ({ browser }) => {
    const laptop = await browser.newContext();
    const page = await laptop.newPage();
    const number = await askForApproval(page);

    await openApprovals(mac.page);
    await mac.page.getByRole("button", { name: `Approve with ${number}` }).click();
    await expect(mac.page.getByText("Sign-in approved.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
    await laptop.close();
  });

  test("picking the wrong number refuses the sign-in", async ({ browser }) => {
    const laptop = await browser.newContext();
    const page = await laptop.newPage();
    const number = await askForApproval(page);

    await openApprovals(mac.page);
    const wrong = mac.page.getByRole("button", { name: /^Approve with / }).filter({ hasNotText: String(number) });
    await wrong.first().click();
    await expect(mac.page.getByText("Wrong number: the sign-in was refused.")).toBeVisible();
    await expect(page.getByText("Sign-in was refused on your other device.")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await laptop.close();
  });

  test("sign out everywhere signs out and un-trusts the other devices, and keeps this one", async () => {
    await mac.page.goto("/admin/dashboard");
    await mac.page.getByRole("button", { name: "Sign out everywhere" }).click();
    await mac.page.getByRole("dialog").getByRole("button", { name: "Sign out everywhere" }).click();
    await expect(mac.page.getByText("Every other device is signed out.")).toBeVisible();

    await iphone.page.goto("/admin/inquiries");
    await expect(iphone.page).toHaveURL(/signedout=revoked/, { timeout: 20_000 });
    await expect(iphone.page.getByText("Signed out: every device was signed out.")).toBeVisible();
    await iphone.page.getByPlaceholder("Password").fill(E2E.adminPassword);
    await iphone.page.getByRole("button", { name: "Login" }).click();
    await expect(iphone.page.getByRole("button", { name: "Use passkey" })).toBeVisible();

    await mac.page.goto("/admin/inquiries");
    await expect(mac.page).toHaveURL(/\/admin\/inquiries$/);
    await expect(mac.page.getByRole("heading", { name: "Inquiries" })).toBeVisible();
  });
});
