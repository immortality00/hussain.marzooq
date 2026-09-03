import { describe, expect, it } from "vitest";
import { encodeMediaCursor, PUBLIC_MEDIA_PAGE_SIZE } from "@/lib/media-cursor";

function decode(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
}

describe("encodeMediaCursor", () => {
  it("round-trips through base64url decoding into the same shape", () => {
    const cursor = { createdAt: "2026-09-03T10:20:30.000Z", id: "66d0a1b2c3d4e5f601020304" };
    const encoded = encodeMediaCursor(cursor);

    expect(decode(encoded)).toEqual(cursor);
  });

  it("produces url-safe, unpadded base64", () => {
    const encoded = encodeMediaCursor({
      createdAt: "2026-01-31T23:59:59.999Z",
      id: "0123456789abcdef01234567",
    });

    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("matches Node's native base64url encoding", () => {
    const cursor = { createdAt: "2026-05-05T05:05:05.005Z", id: "aaaaaaaaaaaaaaaaaaaaaaaa" };
    const expected = Buffer.from(
      JSON.stringify({ createdAt: cursor.createdAt, id: cursor.id }),
      "utf8"
    ).toString("base64url");

    expect(encodeMediaCursor(cursor)).toBe(expected);
  });

  it("exposes a sane default page size", () => {
    expect(PUBLIC_MEDIA_PAGE_SIZE).toBeGreaterThan(0);
  });
});
