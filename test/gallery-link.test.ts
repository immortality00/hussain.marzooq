import { describe, expect, test } from "vitest";
import {
  galleryVisibilityOf,
  galleryLinkOpens,
  isGalleryLinkKey,
  makeGalleryLinkKey,
} from "@/lib/private-galleries";
import { accessFields, parseGalleryBody, PASSWORD_TOO_SHORT } from "@/app/api/private-galleries/_lib/gallery-body";
import { addUpTo, buildGalleryUrl, galleryPath } from "@/components/admin/private-galleries/helpers";
import { countedPath, GOATCOUNTER_SETTINGS_SCRIPT, GALLERY_LINK_PATH } from "@/lib/analytics-path";
import { linkDownloadLimit, linkViewLimit } from "@/lib/server/gallery-link-limits";

const KEY = makeGalleryLinkKey();
const linkDoc = (overrides: Record<string, unknown> = {}) => ({ visibility: "public", linkKey: KEY, ...overrides });

describe("link keys", () => {
  test("are 43 url-safe characters (32 random bytes) and never repeat", () => {
    expect(KEY).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(isGalleryLinkKey(KEY)).toBe(true);
    expect(new Set(Array.from({ length: 50 }, makeGalleryLinkKey)).size).toBe(50);
  });

  test("anything else is not a key", () => {
    for (const value of ["", KEY.slice(1), `${KEY}a`, `${KEY.slice(1)}/`, `${KEY.slice(1)}.`, null, 42, [KEY]]) {
      expect(isGalleryLinkKey(value)).toBe(false);
    }
  });

  test("a gallery without visibility set is private", () => {
    expect(galleryVisibilityOf({})).toBe("private");
    expect(galleryVisibilityOf({ visibility: "anything" })).toBe("private");
    expect(galleryVisibilityOf({ visibility: "public" })).toBe("public");
  });

  test("only the stored key opens a public gallery", () => {
    expect(galleryLinkOpens(linkDoc(), KEY)).toBe(true);
    expect(galleryLinkOpens(linkDoc(), makeGalleryLinkKey())).toBe(false);
    expect(galleryLinkOpens(linkDoc(), "")).toBe(false);
    expect(galleryLinkOpens(linkDoc(), undefined)).toBe(false);
  });

  test("a key never opens a private gallery, or a public gallery whose key was removed", () => {
    expect(galleryLinkOpens({ linkKey: KEY }, KEY)).toBe(false);
    expect(galleryLinkOpens(linkDoc({ linkKey: null }), KEY)).toBe(false);
    expect(galleryLinkOpens(linkDoc({ linkKey: "short" }), "short")).toBe(false);
  });
});

const body = (overrides: Record<string, unknown> = {}) => ({
  title: "Vogue",
  expiresAtLocal: "2099-01-01T10:00",
  timezoneOffsetMinutes: -240,
  mediaIds: ["507f1f77bcf86cd799439011"],
  ...overrides,
});

function parsed(overrides: Record<string, unknown> = {}) {
  const result = parseGalleryBody(body(overrides));
  if (!result.ok) throw new Error("expected a valid body");
  return result.value;
}

describe("parseGalleryBody", () => {
  test("a body without visibility is private (an editor opened before U6)", () => {
    expect(parsed().visibility).toBe("private");
  });

  test("refuses an unknown visibility", async () => {
    for (const visibility of ["link", "hidden", { $ne: "x" }, null]) {
      const result = parseGalleryBody(body({ visibility }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.response.status).toBe(400);
        expect(await result.response.json()).toMatchObject({ error: "Choose Private or Public." });
      }
    }
  });

  test("a public gallery ignores any password sent with it", () => {
    expect(parsed({ visibility: "public", password: "secret-password" }).password).toBe("");
  });

  test("refuses a missing title, expiry or timezone and a non-object body", () => {
    expect(parseGalleryBody(body({ title: "  " })).ok).toBe(false);
    expect(parseGalleryBody(body({ expiresAtLocal: "soon" })).ok).toBe(false);
    expect(parseGalleryBody(body({ timezoneOffsetMinutes: "x" })).ok).toBe(false);
    expect(parseGalleryBody(["x"]).ok).toBe(false);
    expect(parseGalleryBody(null).ok).toBe(false);
  });

  test("only a literal true makes a new link or clears page usages", () => {
    expect(parsed({ newLink: "true", clearPageUsages: 1 })).toMatchObject({ newLink: false, clearPageUsages: false });
    expect(parsed({ newLink: true, clearPageUsages: true })).toMatchObject({ newLink: true, clearPageUsages: true });
  });
});

describe("accessFields", () => {
  test("a new public gallery gets a key, a fresh access token and no password", async () => {
    const result = await accessFields(parsed({ visibility: "public" }), null);
    if (!result.ok) throw new Error(result.error);
    expect(isGalleryLinkKey(result.set.linkKey)).toBe(true);
    expect(result.set).toMatchObject({ visibility: "public", passwordHash: null });
    expect(typeof result.set.accessToken).toBe("string");
  });

  test("a new private gallery needs a password of at least 8 characters", async () => {
    expect(await accessFields(parsed(), null)).toEqual({ ok: false, error: PASSWORD_TOO_SHORT });
    expect(await accessFields(parsed({ password: "short" }), null)).toEqual({ ok: false, error: PASSWORD_TOO_SHORT });
    const result = await accessFields(parsed({ password: "long-enough" }), null);
    if (!result.ok) throw new Error(result.error);
    expect(String(result.set.passwordHash)).toMatch(/^scrypt:/);
    expect(result.set).toMatchObject({ visibility: "private", linkKey: null });
  });

  test("private → public rotates the access token, so every gallery cookie stops working", async () => {
    const existing = { passwordHash: "scrypt:a:b", accessToken: "old" };
    const result = await accessFields(parsed({ visibility: "public" }), existing);
    if (!result.ok) throw new Error(result.error);
    expect(result.set.accessToken).not.toBe("old");
    expect(result.set.passwordHash).toBeNull();
  });

  test("public → private needs a password and drops the link", async () => {
    const existing = linkDoc({ accessToken: "old" });
    expect(await accessFields(parsed(), existing)).toEqual({ ok: false, error: PASSWORD_TOO_SHORT });
    const result = await accessFields(parsed({ password: "long-enough" }), existing);
    if (!result.ok) throw new Error(result.error);
    expect(result.set).toMatchObject({ visibility: "private", linkKey: null });
    expect(result.set.accessToken).not.toBe("old");
  });

  test("a public gallery keeps its key unless a new link is asked for", async () => {
    expect(await accessFields(parsed({ visibility: "public" }), linkDoc())).toEqual({ ok: true, set: {} });
    const result = await accessFields(parsed({ visibility: "public", newLink: true }), linkDoc());
    if (!result.ok) throw new Error(result.error);
    expect(isGalleryLinkKey(result.set.linkKey)).toBe(true);
    expect(result.set.linkKey).not.toBe(KEY);
  });

  test("a private gallery saved without a password keeps its password", async () => {
    expect(await accessFields(parsed(), { passwordHash: "scrypt:a:b" })).toEqual({ ok: true, set: {} });
  });
});

describe("admin link helpers", () => {
  test("a public gallery's address carries its key", () => {
    expect(galleryPath("vogue")).toBe("/g/vogue");
    expect(galleryPath("vogue", KEY)).toBe(`/g/vogue/${KEY}`);
    expect(buildGalleryUrl("vogue", KEY)).toBe(`/g/vogue/${KEY}`);
  });

  test("addUpTo keeps order, skips repeats and stops at the cap", () => {
    expect(addUpTo(["a"], ["b", "a", "c"], 10)).toEqual({ ids: ["a", "b", "c"], count: 2 });
    expect(addUpTo(["a", "b"], ["c", "d", "e"], 3)).toEqual({ ids: ["a", "b", "c"], count: 1 });
    expect(addUpTo(["a"], ["b"], 1)).toEqual({ ids: ["a"], count: 0 });
  });
});

describe("analytics never records a link key", () => {
  test("a public gallery's path and referrer are counted as /g/<slug>", () => {
    expect(countedPath(`/g/vogue/${KEY}`)).toBe("/g/vogue");
    expect(countedPath(`https://hussain.art/g/vogue/${KEY}`)).toBe("https://hussain.art/g/vogue");
  });

  test("every other address is left alone", () => {
    for (const path of ["/g/vogue", "/", "/photography/fashion", "/blog/g/x", "https://hussain.art/about"]) {
      expect(countedPath(path)).toBe(path);
    }
  });

  test("the browser script uses the same rule", () => {
    expect(GOATCOUNTER_SETTINGS_SCRIPT).toContain(JSON.stringify(GALLERY_LINK_PATH.source));
    expect(GOATCOUNTER_SETTINGS_SCRIPT).toContain("path:cut,referrer:cut");
  });
});

describe("per-link limits", () => {
  test("views: 20 per item a day, at least 200", () => {
    expect(linkViewLimit(50)).toBe(1000);
    expect(linkViewLimit(3)).toBe(200);
  });

  test("downloads: 5 per item over the link's life", () => {
    expect(linkDownloadLimit(50)).toBe(250);
    expect(linkDownloadLimit(0)).toBe(5);
  });
});
