import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Db } from "mongodb";

const { upload, registerAssetUpload, discardPendingUpload, configured } = vi.hoisted(() => ({
  upload: vi.fn(),
  registerAssetUpload: vi.fn(),
  discardPendingUpload: vi.fn(),
  configured: { value: true },
}));

vi.mock("cloudinary", () => ({ v2: { uploader: { upload } } }));
vi.mock("@/lib/server/cloudinary", () => ({
  isCloudinaryConfigured: () => configured.value,
  ensureCloudinaryConfigured: () => ({}),
}));
vi.mock("@/lib/server/upload-ledger", () => ({
  newUploadPublicId: (folder: string) => `${folder}/logo1`,
  registerAssetUpload,
  discardPendingUpload,
}));

import { resolveLinkLogos, storeLinkLogo } from "@/lib/server/link-logos";

const db = {} as Db;
const LOGO_ID = "hm_visuals/sections/logos/logo1";
const SERVICE = "https://www.google.com/s2/favicons?domain=objkt.com&sz=128";
const IMAGE = "https://t1.gstatic.com/faviconV2?url=http://objkt.com&size=128";

type Route = { status?: number; type?: string; bytes?: number; location?: string; length?: string };
let routes: Record<string, Route> = {};
const fetchMock = vi.fn(async (input: string | URL) => {
  const route = routes[String(input)];
  if (!route) return new Response(null, { status: 404 });
  const headers: Record<string, string> = { "content-type": route.type ?? "image/png" };
  if (route.location) headers.location = route.location;
  if (route.length) headers["content-length"] = route.length;
  const body = route.status && route.status >= 300 && route.status < 400 ? null : new Uint8Array(route.bytes ?? 900).fill(7);
  return new Response(body, { status: route.status ?? 200, headers });
});

function googleRedirectsTo(location: string) {
  routes[SERVICE] = { status: 301, location };
}

beforeEach(() => {
  routes = {};
  configured.value = true;
  upload.mockResolvedValue({
    secure_url: `https://res.cloudinary.com/demo/image/upload/v1/${LOGO_ID}.png`,
    public_id: LOGO_ID,
    resource_type: "image",
    bytes: 900,
  });
  registerAssetUpload.mockResolvedValue(undefined);
  discardPendingUpload.mockResolvedValue("deleted");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("storeLinkLogo", () => {
  test("follows Google's one redirect to its image host and stores the PNG, registering it first", async () => {
    googleRedirectsTo(IMAGE);
    routes[IMAGE] = {};

    const logo = await storeLinkLogo(db, "objkt.com");

    expect(logo).toEqual({
      host: "objkt.com",
      image: { url: `https://res.cloudinary.com/demo/image/upload/v1/${LOGO_ID}.png`, publicId: LOGO_ID },
    });
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([SERVICE, IMAGE]);
    expect(registerAssetUpload).toHaveBeenCalledWith(db, LOGO_ID);
    expect(registerAssetUpload.mock.invocationCallOrder[0]).toBeLessThan(upload.mock.invocationCallOrder[0]!);
    const [file, options] = upload.mock.calls[0]!;
    expect(file).toMatch(/^data:image\/png;base64,/);
    expect(options).toMatchObject({ public_id: LOGO_ID, resource_type: "image", overwrite: false });
  });

  test("passes the site as a query parameter, never fetching the site itself", async () => {
    await storeLinkLogo(db, "a.example");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0]![0])).toBe("https://www.google.com/s2/favicons?domain=a.example&sz=128");
  });

  test("refuses a redirect off Google, or a second redirect", async () => {
    googleRedirectsTo("https://evil.example/logo.png");
    routes["https://evil.example/logo.png"] = {};
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    googleRedirectsTo("http://t1.gstatic.com/x");
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    googleRedirectsTo(IMAGE);
    routes[IMAGE] = { status: 302, location: "https://t2.gstatic.com/y" };
    routes["https://t2.gstatic.com/y"] = {};
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    expect(fetchMock.mock.calls.map(([url]) => String(url))).not.toContain("https://evil.example/logo.png");
    expect(fetchMock.mock.calls.map(([url]) => String(url))).not.toContain("https://t2.gstatic.com/y");
    expect(upload).not.toHaveBeenCalled();
  });

  test("stores nothing for a site Google has no icon for, the wrong type or an oversized file", async () => {
    googleRedirectsTo(IMAGE);

    routes[IMAGE] = { status: 404 };
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    routes[IMAGE] = { type: "text/html" };
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    routes[IMAGE] = { type: "image/svg+xml" };
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    routes[IMAGE] = { bytes: 50_001 };
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    routes[IMAGE] = { length: "9000000" };
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();

    expect(upload).not.toHaveBeenCalled();
    expect(registerAssetUpload).not.toHaveBeenCalled();
  });

  test("a failed upload is discarded and reported as no logo", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    googleRedirectsTo(IMAGE);
    routes[IMAGE] = {};
    upload.mockRejectedValue({ error: { message: "boom" } });

    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();
    expect(discardPendingUpload).toHaveBeenCalledWith(db, LOGO_ID);
  });

  test("a network error never throws", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await storeLinkLogo(db, "objkt.com")).toBeNull();
  });
});

describe("resolveLinkLogos", () => {
  const stored = (host: string) => ({ host, image: { url: `https://res.cloudinary.com/x/${host}.png`, publicId: `p/${host}` } });

  test("keeps stored logos, fetches new sites, drops sites no longer listed and skips built-in networks", async () => {
    googleRedirectsTo(IMAGE);
    routes[IMAGE] = {};

    const result = await resolveLinkLogos(
      db,
      ["https://instagram.com/h", "https://www.linkedin.com/in/h", "https://objkt.com/profile/h"],
      [stored("linkedin.com"), stored("old.example"), { host: "bad" }]
    );

    expect(result.logos.map((logo) => logo.host)).toEqual(["linkedin.com", "objkt.com"]);
    expect(result.logos[0]).toEqual(stored("linkedin.com"));
    expect(result.missing).toEqual([]);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([SERVICE, IMAGE]);
  });

  test("reports sites it could not get a logo for", async () => {
    const result = await resolveLinkLogos(db, ["https://unknown.example/"], []);
    expect(result).toEqual({ logos: [], missing: ["unknown.example"] });
  });

  test("without Cloudinary keys it fetches nothing and keeps what is stored", async () => {
    configured.value = false;
    const result = await resolveLinkLogos(db, ["https://linkedin.com/in/h", "https://objkt.com/"], [stored("linkedin.com")]);
    expect(result).toEqual({ logos: [stored("linkedin.com")], missing: ["objkt.com"] });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
