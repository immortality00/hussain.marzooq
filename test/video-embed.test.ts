import { describe, expect, it } from "vitest";
import {
  embedUrlPattern,
  parseVideoLink,
  toEmbedUrl,
  toVideoWatchUrl,
  videoEmbedSrc,
  videoWatchUrl,
} from "@/lib/video-embed";

const YT = "dQw4w9WgXcQ";

describe("parseVideoLink — YouTube", () => {
  it.each([
    `https://www.youtube.com/watch?v=${YT}`,
    `https://youtube.com/watch?v=${YT}&t=42s&list=PL123`,
    `https://m.youtube.com/watch?v=${YT}`,
    `https://music.youtube.com/watch?v=${YT}`,
    `https://youtu.be/${YT}?si=abc123`,
    `https://www.youtube.com/shorts/${YT}`,
    `https://youtube.com/shorts/${YT}?feature=share`,
    `https://www.youtube.com/live/${YT}`,
    `https://www.youtube.com/embed/${YT}`,
    `https://www.youtube-nocookie.com/embed/${YT}`,
    `http://www.youtube.com/watch?v=${YT}`,
    `  https://www.youtube.com/watch?v=${YT}  `,
  ])("reads the video id from %s", (link) => {
    expect(parseVideoLink(link)).toEqual({ provider: "youtube", id: YT });
  });

  it("accepts the link the server stored, so an unchanged edit is never rejected", () => {
    const stored = toEmbedUrl(`https://www.youtube.com/watch?v=${YT}`);

    expect(stored).toBe(`https://www.youtube-nocookie.com/embed/${YT}`);
    expect(parseVideoLink(stored!)).toEqual({ provider: "youtube", id: YT });
    expect(toEmbedUrl(stored!)).toBe(stored);
  });

  it.each([
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch",
    "https://www.youtube.com/@hussain.marzooq",
    "https://youtu.be/",
    `https://youtube.com.evil.test/watch?v=${YT}`,
    `https://evilyoutube.com/watch?v=${YT}`,
    `javascript:alert("https://youtu.be/${YT}")`,
    `ftp://youtu.be/${YT}`,
    "not a link",
    "",
  ])("rejects %s", (link) => {
    expect(parseVideoLink(link)).toBeNull();
  });
});

describe("parseVideoLink — Vimeo", () => {
  it.each([
    ["https://vimeo.com/76979871", null],
    ["https://www.vimeo.com/76979871?share=copy", null],
    ["https://vimeo.com/76979871/a1b2c3d4e5", "a1b2c3d4e5"],
    ["https://player.vimeo.com/video/76979871", null],
    ["https://player.vimeo.com/video/76979871?h=a1b2c3d4e5&badge=0", "a1b2c3d4e5"],
    ["https://vimeo.com/channels/staffpicks/76979871", null],
    ["https://vimeo.com/groups/shortfilms/videos/76979871", null],
    ["https://vimeo.com/showcase/11223344/video/76979871", null],
  ])("reads %s", (link, hash) => {
    expect(parseVideoLink(link)).toEqual({ provider: "vimeo", id: "76979871", hash });
  });

  it("keeps the private hash of an unlisted video, which the player needs", () => {
    expect(toEmbedUrl("https://vimeo.com/76979871/a1b2c3d4e5")).toBe(
      "https://player.vimeo.com/video/76979871?h=a1b2c3d4e5"
    );
  });

  it("drops a path segment that is not a hash", () => {
    expect(parseVideoLink("https://vimeo.com/76979871/settings")).toEqual({
      provider: "vimeo",
      id: "76979871",
      hash: null,
    });
  });

  it.each(["https://vimeo.com/channels/staffpicks", "https://vimeo.com/", "https://vimeo.com.evil.test/123"])(
    "rejects %s",
    (link) => {
      expect(parseVideoLink(link)).toBeNull();
    }
  );
});

describe("stored, watch and matching forms", () => {
  it("round-trips every accepted link through the stored form to the same video", () => {
    for (const link of [
      `https://youtu.be/${YT}`,
      `https://www.youtube.com/shorts/${YT}`,
      "https://vimeo.com/76979871/a1b2c3d4e5",
    ]) {
      const ref = parseVideoLink(link)!;
      expect(parseVideoLink(videoEmbedSrc(ref))).toEqual(ref);
      expect(parseVideoLink(videoWatchUrl(ref))).toEqual(ref);
    }
  });

  it("shows the ordinary watch link in the editor instead of the stored player link", () => {
    expect(toVideoWatchUrl(`https://www.youtube-nocookie.com/embed/${YT}`)).toBe(
      `https://www.youtube.com/watch?v=${YT}`
    );
    expect(toVideoWatchUrl("https://player.vimeo.com/video/76979871?h=a1b2c3d4e5")).toBe(
      "https://vimeo.com/76979871/a1b2c3d4e5"
    );
    expect(toVideoWatchUrl("")).toBe("");
  });

  it("matches the same video stored with or without extra query parameters", () => {
    const youtube = embedUrlPattern({ provider: "youtube", id: YT });
    expect(youtube.test(`https://www.youtube-nocookie.com/embed/${YT}`)).toBe(true);
    expect(youtube.test(`https://www.youtube-nocookie.com/embed/${YT}?si=x`)).toBe(true);
    expect(youtube.test(`https://www.youtube-nocookie.com/embed/${YT}x`)).toBe(false);

    const vimeo = embedUrlPattern({ provider: "vimeo", id: "123", hash: "abcdef12" });
    expect(vimeo.test("https://player.vimeo.com/video/123")).toBe(true);
    expect(vimeo.test("https://player.vimeo.com/video/123?h=abcdef12")).toBe(true);
    expect(vimeo.test("https://player.vimeo.com/video/1234")).toBe(false);
  });
});
