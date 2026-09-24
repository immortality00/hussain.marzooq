import { beforeEach, describe, expect, test, vi } from "vitest";

const { fetchVideoPreview, findOne, getDb } = vi.hoisted(() => {
  const findOne = vi.fn();
  return {
    fetchVideoPreview: vi.fn(),
    findOne,
    getDb: vi.fn(async () => ({ collection: () => ({ findOne }) })),
  };
});

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", () => ({ getDb }));
vi.mock("@/lib/server/video-posters", () => ({ fetchVideoPreview }));

import { POST } from "@/app/api/media/video-details/route";

function call(url: unknown) {
  return POST(
    new Request("http://localhost/api/media/video-details", {
      method: "POST",
      body: JSON.stringify({ url }),
    })
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  findOne.mockResolvedValue(null);
  fetchVideoPreview.mockResolvedValue({ title: "The show", preview: "data:image/jpeg;base64,AAAA" });
});

describe("POST /api/media/video-details", () => {
  test("returns the stored form, the watch link, the title and a preview", async () => {
    const res = await call("https://youtu.be/Or18TXg2bnY?si=abc");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      embedUrl: "https://www.youtube-nocookie.com/embed/Or18TXg2bnY",
      watchUrl: "https://www.youtube.com/watch?v=Or18TXg2bnY",
      title: "The show",
      preview: "data:image/jpeg;base64,AAAA",
    });
    expect(fetchVideoPreview).toHaveBeenCalledWith({ provider: "youtube", id: "Or18TXg2bnY" });
  });

  test("rejects anything that is not a video link without contacting anyone", async () => {
    for (const url of ["https://example.com/watch?v=Or18TXg2bnY", "", 42]) {
      const res = await call(url);
      expect(res.status).toBe(400);
    }

    expect(getDb).not.toHaveBeenCalled();
    expect(fetchVideoPreview).not.toHaveBeenCalled();
  });

  test("reports a video that is already in the library", async () => {
    findOne.mockResolvedValue({ title: "Magda & Valeria Bachata show in ADIDF" });

    const res = await call("https://www.youtube.com/watch?v=Or18TXg2bnY");

    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe(
      "This video is already in the library as “Magda & Valeria Bachata show in ADIDF”."
    );
    expect(fetchVideoPreview).not.toHaveBeenCalled();
  });
});
