import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PageHeader } from "@/components/shared/PageHeader";

describe("AnimatedText", () => {
  it("ends every word box but the last with a non-breaking space", () => {
    const html = renderToStaticMarkup(createElement(PageHeader, { title: "What people say" }));
    const boxes = html
      .split('<span class="animated-word-clip')
      .slice(1)
      .map((box) => box.replace(/^[^>]*>/, "").replace(/<[^>]*>/g, ""));

    expect(boxes).toEqual(["What ", "people ", "say"]);
  });
});
