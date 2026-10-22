import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";
import { E2E } from "@/e2e/fixtures";
import { COOKIE_NAME, adminSessionSecret, issueSessionCookie, readSessionCookie } from "@/lib/auth/session-token";
import { TRUSTED_DEVICE_COOKIE, isTrustedDevice } from "@/lib/auth/trusted-device";
import { openSignInRequest, startApproval } from "@/lib/server/sign-in-requests";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { jar, queueAdminAlert, verifyAuthenticationResponse, verifyRegistrationResponse } = vi.hoisted(() => ({
  jar: new Map<string, string>(),
  queueAdminAlert: vi.fn(),
  verifyAuthenticationResponse: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
  }),
}));
vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit: async () => ({ limited: false }) }));
vi.mock("@/lib/server/admin-alerts", () => ({ queueAdminAlert }));
vi.mock("@simplewebauthn/server", () => ({
  generateAuthenticationOptions: async () => ({ challenge: "approve-challenge" }),
  generateRegistrationOptions: async () => ({ challenge: "register-challenge" }),
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
}));

import { requireAdminOr401 } from "@/lib/auth/admin";
import { POST as signOutEverywhere } from "@/app/api/admin/security/sign-out-everywhere/route";
import { POST as registrationOptions } from "@/app/api/admin/security/passkeys/options/route";
import { POST as savePasskey } from "@/app/api/admin/security/passkeys/route";
import { DELETE as removePasskey } from "@/app/api/admin/security/passkeys/[id]/route";
import { POST as approvalOptions } from "@/app/api/admin/security/sign-ins/[id]/options/route";
import { POST as decide } from "@/app/api/admin/security/sign-ins/[id]/route";

const SECRET = "security-routes-secret";
const passkey = (name: string) => ({
  _id: new ObjectId(),
  credentialId: name,
  publicKey: { buffer: new Uint8Array([1]) },
  counter: 0,
  transports: [],
  name,
  synced: true,
  createdAt: new Date(),
  lastUsedAt: null,
});

const post = (body?: unknown) =>
  new Request("https://hussain.art/api/admin/security", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

async function signInAs(generation: number) {
  jar.clear();
  jar.set(COOKIE_NAME, await issueSessionCookie(adminSessionSecret(), true, undefined, Date.now(), generation));
}

async function pendingApproval() {
  await openSignInRequest({ remember: false, next: "/admin/dashboard", device: "Windows · Chrome" });
  const doc = memory.collections.admin_auth_requests![0] as never;
  const { number } = await startApproval(doc);
  return { id: String((doc as { _id: string })._id), number };
}

beforeEach(async () => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", E2E.adminPasswordHash);
  vi.stubEnv("ADMIN_COOKIE_SECRET", SECRET);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  resetMemoryDb({ admin_passkeys: [passkey("iphone")], admin_security: [{ _id: "admin", generation: 1 }] });
  queueAdminAlert.mockClear();
  verifyAuthenticationResponse.mockReset().mockImplementation(async ({ response }: { response: { ok?: boolean } }) => ({
    verified: response.ok === true,
    authenticationInfo: { newCounter: 0 },
  }));
  await signInAs(1);
});

describe("sign out everywhere", () => {
  it("refuses every session from before, and keeps the device that pressed it signed in and trusted", async () => {
    const res = await signOutEverywhere();
    expect(res.status).toBe(200);
    expect(memory.collections.admin_security?.[0]).toMatchObject({ generation: 2 });

    const fresh = await readSessionCookie(
      (res as unknown as { cookies: { get(n: string): { value: string } } }).cookies.get(COOKIE_NAME).value,
      adminSessionSecret()
    );
    expect(fresh).toMatchObject({ ok: true, session: { generation: 2, remember: true } });
    const trust = (res as unknown as { cookies: { get(n: string): { value: string } } }).cookies.get(TRUSTED_DEVICE_COOKIE);
    expect(isTrustedDevice(trust.value, SECRET, 2)).toBe(true);

    const refused = await requireAdminOr401();
    expect(refused?.status).toBe(401);
    expect(await refused?.json()).toEqual({ ok: false, error: "Unauthorized", reason: "revoked" });

    await signInAs(2);
    expect(await requireAdminOr401()).toBeNull();
  });
});

describe("adding and removing passkeys", () => {
  it("asks for the password before starting a new passkey", async () => {
    expect((await registrationOptions(post({ password: "wrong" }))).status).toBe(401);
    expect((await registrationOptions(post())).status).toBe(401);
    expect(memory.collections.admin_security?.[0]).not.toHaveProperty("registration");

    const res = await registrationOptions(post({ password: E2E.adminPassword }));
    expect(await res.json()).toEqual({ ok: true, options: { challenge: "register-challenge" } });
    expect(memory.collections.admin_security?.[0]).toMatchObject({ registration: { challenge: "register-challenge" } });
  });

  it("saves a passkey only against a fresh challenge, and trusts the device that added it", async () => {
    verifyRegistrationResponse.mockResolvedValue({
      verified: true,
      registrationInfo: {
        credential: { id: "mac", publicKey: new Uint8Array([9]), counter: 0, transports: ["internal", "hybrid"] },
        credentialBackedUp: true,
      },
    });
    expect((await savePasskey(post({ response: { id: "mac" }, name: "Mac · Safari" }))).status).toBe(400);

    await registrationOptions(post({ password: E2E.adminPassword }));
    const res = await savePasskey(post({ response: { id: "mac" }, name: "Mac · Safari" }));
    expect(res.status).toBe(200);
    expect(memory.collections.admin_passkeys?.[1]).toMatchObject({ credentialId: "mac", name: "Mac · Safari", synced: true });
    const trust = (res as unknown as { cookies: { get(n: string): { value: string } } }).cookies.get(TRUSTED_DEVICE_COOKIE);
    expect(isTrustedDevice(trust.value, SECRET, 1)).toBe(true);

    expect((await savePasskey(post({ response: { id: "mac" } }))).status).toBe(400);

    verifyRegistrationResponse.mockResolvedValue({ verified: false });
    await registrationOptions(post({ password: E2E.adminPassword }));
    expect((await savePasskey(post({ response: { id: "x" } }))).status).toBe(400);
    expect(memory.collections.admin_passkeys).toHaveLength(2);
  });

  it("never removes the last passkey", async () => {
    const only = memory.collections.admin_passkeys![0]!._id as ObjectId;
    const last = await removePasskey(new Request("https://hussain.art"), ctx(String(only)));
    expect(last.status).toBe(409);

    memory.collections.admin_passkeys!.push(passkey("mac"));
    const res = await removePasskey(new Request("https://hussain.art"), ctx(String(only)));
    expect(res.status).toBe(200);
    expect((await res.json()).security.passkeys.map((p: { name: string }) => p.name)).toEqual(["mac"]);
    expect((await removePasskey(new Request("https://hussain.art"), ctx(String(only)))).status).toBe(404);
  });
});

describe("approving a sign-in from this device", () => {
  it("rejects on request and alerts", async () => {
    const { id } = await pendingApproval();
    const res = await decide(post({ decision: "reject" }), ctx(id));
    expect(res.status).toBe(200);
    expect(memory.collections.admin_auth_requests?.[0]).toMatchObject({ approval: { status: "rejected" } });
    expect(queueAdminAlert).toHaveBeenCalledWith({ kind: "sign-in-refused", device: "Windows · Chrome", reason: "rejected" });
    expect((await decide(post({ decision: "reject" }), ctx(id))).status).toBe(404);
  });

  it("refuses the sign-in when the wrong number is picked", async () => {
    const { id, number } = await pendingApproval();
    const choices = (memory.collections.admin_auth_requests?.[0] as { approval: { choices: number[] } }).approval.choices;
    const wrong = choices.find((choice) => choice !== number)!;
    const res = await decide(post({ decision: "approve", choice: wrong }), ctx(id));
    expect(res.status).toBe(409);
    expect(memory.collections.admin_auth_requests?.[0]).toMatchObject({ approval: { status: "rejected" } });
    expect(queueAdminAlert).toHaveBeenCalledWith(expect.objectContaining({ reason: "wrong-number" }));
  });

  it("approves only with the right number and a Face ID answer", async () => {
    const { id, number } = await pendingApproval();
    expect((await decide(post({ decision: "approve", choice: 5 }), ctx(id))).status).toBe(400);
    expect((await decide(post({ decision: "approve", choice: number }), ctx(id))).status).toBe(400);

    await approvalOptions(post(), ctx(id));
    const bad = await decide(post({ decision: "approve", choice: number, response: { id: "iphone", ok: false } }), ctx(id));
    expect(bad.status).toBe(401);
    expect(memory.collections.admin_auth_requests?.[0]).toMatchObject({ approval: { status: "pending" } });

    await approvalOptions(post(), ctx(id));
    const good = await decide(post({ decision: "approve", choice: number, response: { id: "iphone", ok: true } }), ctx(id));
    expect(good.status).toBe(200);
    expect(memory.collections.admin_auth_requests?.[0]).toMatchObject({ approval: { status: "approved" } });
    expect(queueAdminAlert).not.toHaveBeenCalled();
  });

  it("answers an unknown, malformed or expired request plainly", async () => {
    expect((await decide(post({ decision: "approve" }), ctx("nope"))).status).toBe(404);
    expect((await decide(post({ decision: "maybe" }), ctx("a".repeat(32)))).status).toBe(400);
    expect((await approvalOptions(post(), ctx("a".repeat(32)))).status).toBe(404);
  });
});
