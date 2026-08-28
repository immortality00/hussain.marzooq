import { describe, it, expect } from "vitest";
import {
  createPersonGateCookieValue,
  hashPassword,
  makeAccessToken,
  personGateCookieName,
  verifyPassword,
  verifyPersonGateCookieValue,
} from "@/lib/password-gate";

const SECRET = "test-secret-value";

describe("hashPassword / verifyPassword", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("swordfish-9000");
    expect(await verifyPassword("swordfish-9000", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("swordfish-9000");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces a distinct salt per hash", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
  });

  it("rejects a malformed stored hash", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
  });
});

describe("person gate cookie", () => {
  it("round-trips a signed cookie value", () => {
    const token = makeAccessToken();
    const value = createPersonGateCookieValue(SECRET, "person-1", token);
    expect(value).toBeTruthy();
    expect(
      verifyPersonGateCookieValue({
        secret: SECRET,
        personId: "person-1",
        accessToken: token,
        cookieValue: value as string,
      })
    ).toBe(true);
  });

  it("rejects a cookie signed for a different person", () => {
    const token = makeAccessToken();
    const value = createPersonGateCookieValue(SECRET, "person-1", token) as string;
    expect(
      verifyPersonGateCookieValue({
        secret: SECRET,
        personId: "person-2",
        accessToken: token,
        cookieValue: value,
      })
    ).toBe(false);
  });

  it("rejects a cookie with the wrong token", () => {
    const value = createPersonGateCookieValue(SECRET, "person-1", makeAccessToken()) as string;
    expect(
      verifyPersonGateCookieValue({
        secret: SECRET,
        personId: "person-1",
        accessToken: makeAccessToken(),
        cookieValue: value,
      })
    ).toBe(false);
  });

  it("rejects a cookie verified with a different secret", () => {
    const token = makeAccessToken();
    const value = createPersonGateCookieValue(SECRET, "person-1", token) as string;
    expect(
      verifyPersonGateCookieValue({
        secret: "other-secret",
        personId: "person-1",
        accessToken: token,
        cookieValue: value,
      })
    ).toBe(false);
  });

  it("returns null without a secret and rejects verification", () => {
    const token = makeAccessToken();
    expect(createPersonGateCookieValue("", "person-1", token)).toBeNull();
    expect(
      verifyPersonGateCookieValue({
        secret: "",
        personId: "person-1",
        accessToken: token,
        cookieValue: "v1.x.y",
      })
    ).toBe(false);
  });

  it("namespaces the cookie by person id", () => {
    expect(personGateCookieName("abc")).toBe("hm_person_abc");
  });
});
