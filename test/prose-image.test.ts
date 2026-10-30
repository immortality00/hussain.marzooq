import { describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BlogContent } from "@/components/blog/BlogContent";

const PHOTO = "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/photography/a.jpg";

const html = (content: string) => renderToStaticMarkup(createElement(BlogContent, { content }));

describe("pictures in a post's text (U7)", () => {
  test("a Cloudinary photo loads a sized copy, never the full original", () => {
    const out = html(`![Gold Hour](${PHOTO})`);
    expect(out).toContain('alt="Gold Hour"');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('sizes="(max-width: 768px) 100vw, 768px"');
    expect(out).toContain("/upload/w_1200,");
    for (const width of [640, 750, 828, 1080, 1200, 1920]) expect(out).toContain(` ${width}w`);
    expect(out).not.toContain(`src="${PHOTO}"`);
    expect(out).not.toContain(" 2048w");
  });

  test("an address already sized (a video's frame) or from elsewhere is used as written", () => {
    const frame = "https://res.cloudinary.com/demo/video/upload/so_0,w_1200,h_20416,c_limit,q_auto,f_auto/a.jpg";
    expect(html(`![f](${frame})`)).toContain(`src="${frame}"`);
    expect(html(`![f](${frame})`)).not.toContain("srcSet");
    expect(html("![x](https://example.com/x.png)")).toContain('src="https://example.com/x.png"');
  });
});
