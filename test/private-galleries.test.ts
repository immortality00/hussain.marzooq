import { beforeAll, describe, expect, test } from "vitest";
import {
  createPrivateGalleryCookieValue,
  getPrivateGalleryExpiryDate,
  hashGalleryPassword,
  isPrivateGalleryExpired,
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
