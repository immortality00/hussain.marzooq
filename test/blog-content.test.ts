import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlogContent } from "@/components/blog/BlogContent";

describe("BlogContent links", () => {
  it("renders a clean anchor and drops script links", () => {
    const html = renderToStaticMarkup(
      createElement(BlogContent, { content: '[a](https://example.com "Example") [b](javascript:alert(1))' }),
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('title="Example"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("node=");
    expect(html).not.toContain("javascript:");
  });
});
