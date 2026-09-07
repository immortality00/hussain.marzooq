import { beforeAll, describe, expect, test } from "vitest";
import {
  createPrivateGalleryCookieValue,
  getPrivateGalleryExpiryDate,
  hashGalleryPassword,
  isFutureDate,
  isPrivateGalleryExpired,
  isSameExpiryInstant,
  isPrivateGalleryUnavailable,
  makeGalleryAccessToken,
  privateGalleryCookieName,
  verifyGalleryPassword,
  verifyPrivateGalleryCookieValue,
} from "@/lib/private-galleries";

beforeAll(() => {
  process.env.PRIVATE_GALLERY_COOKIE_SECRET = "test-gallery-secret";
});

describe("private gallery access cookie", () => {
  test("verifies the gallery it was issued for", () => {
    const value = createPrivateGalleryCookieValue("gallery-a", "token-a");
    expect(value).toBeTruthy();
    expect(
      verifyPrivateGalleryCookieValue({
        galleryId: "gallery-a",
        accessToken: "token-a",
        cookieValue: value as string,
      })
    ).toBe(true);
  });

  test("gallery A's cookie does not unlock gallery B", () => {
    const value = createPrivateGalleryCookieValue("gallery-a", "token-a") as string;
    expect(
      verifyPrivateGalleryCookieValue({
        galleryId: "gallery-b",
        accessToken: "token-a",
        cookieValue: value,
      })
    ).toBe(false);
  });

  test("rotating the access token invalidates the cookie", () => {
    const value = createPrivateGalleryCookieValue("gallery-a", "token-a") as string;
    expect(
      verifyPrivateGalleryCookieValue({
        galleryId: "gallery-a",
        accessToken: "token-rotated",
        cookieValue: value,
      })
    ).toBe(false);
  });

  test("rejects a tampered signature and a wrong version", () => {
    const [, token, signature] = (
      createPrivateGalleryCookieValue("gallery-a", "token-a") as string
    ).split(".");

    expect(
      verifyPrivateGalleryCookieValue({
        galleryId: "gallery-a",
        accessToken: "token-a",
        cookieValue: `v1.${token}.${signature.slice(0, -1)}0`,
      })
    ).toBe(false);

    expect(
      verifyPrivateGalleryCookieValue({
        galleryId: "gallery-a",
        accessToken: "token-a",
        cookieValue: `v2.${token}.${signature}`,
      })
    ).toBe(false);
  });

  test("cookie names are scoped per gallery and tokens are unique", () => {
    expect(privateGalleryCookieName("abc")).toBe("hm_gallery_abc");
    expect(makeGalleryAccessToken()).not.toBe(makeGalleryAccessToken());
  });
});

describe("private gallery password", () => {
  test("verifies the right password and rejects the wrong one", async () => {
    const stored = await hashGalleryPassword("correct horse battery");
    expect(await verifyGalleryPassword("correct horse battery", stored)).toBe(true);
    expect(await verifyGalleryPassword("wrong password", stored)).toBe(false);
  });

  test("rejects a malformed stored hash", async () => {
    expect(await verifyGalleryPassword("anything", "not-a-hash")).toBe(false);
  });
});

describe("private gallery availability", () => {
  test("expired or inactive galleries are unavailable", () => {
    const past = new Date(Date.now() - 1000);
    const future = new Date(Date.now() + 60_000);

    expect(isPrivateGalleryExpired(past)).toBe(true);
    expect(isPrivateGalleryExpired(future)).toBe(false);
    expect(isPrivateGalleryExpired(null)).toBe(false);

    expect(isPrivateGalleryUnavailable({ isActive: true, expiresAtUtc: past })).toBe(true);
    expect(isPrivateGalleryUnavailable({ isActive: false, expiresAtUtc: future })).toBe(true);
    expect(isPrivateGalleryUnavailable({ isActive: true, expiresAtUtc: future })).toBe(false);
  });

  test("falls back to the legacy expiresAt field", () => {
    const date = new Date();
    expect(getPrivateGalleryExpiryDate({ expiresAt: date })).toBe(date);
    expect(getPrivateGalleryExpiryDate({})).toBeNull();
  });
});

describe("gallery expiry change detection", () => {
  test("treats the same instant as unchanged, to the minute", () => {
    const a = new Date("2026-12-31T19:00:00.000Z");
    const b = new Date("2026-12-31T19:00:41.000Z");

    expect(isSameExpiryInstant(a, b)).toBe(true);
    expect(isSameExpiryInstant(a, new Date("2026-12-31T19:01:00.000Z"))).toBe(false);
  });

  test("a missing side is never 'unchanged'", () => {
    expect(isSameExpiryInstant(null, new Date())).toBe(false);
    expect(isSameExpiryInstant(new Date(), null)).toBe(false);
    expect(isSameExpiryInstant(null, null)).toBe(false);
  });

  test("resubmitting a past expiry is unchanged, so a PATCH need not extend access", () => {
    const stored = new Date(Date.now() - 86_400_000);
    const resubmitted = new Date(stored.getTime());

    expect(isFutureDate(resubmitted)).toBe(false);
    expect(isSameExpiryInstant(resubmitted, stored)).toBe(true);
  });

  test("a different past expiry is still rejected", () => {
    const stored = new Date(Date.now() - 86_400_000);
    const submitted = new Date(Date.now() - 3_600_000);

    expect(isFutureDate(submitted)).toBe(false);
    expect(isSameExpiryInstant(submitted, stored)).toBe(false);
  });

  test("getPrivateGalleryExpiryDate falls back to the legacy expiresAt field", () => {
    const legacy = new Date("2026-12-31T19:00:00.000Z");

    expect(getPrivateGalleryExpiryDate({ expiresAt: legacy })).toEqual(legacy);
    expect(getPrivateGalleryExpiryDate({ expiresAtUtc: legacy, expiresAt: new Date(0) })).toEqual(
      legacy
    );
    expect(getPrivateGalleryExpiryDate({})).toBeNull();
  });
});
