import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { withAllChip } from "@/components/media/tag-chips";
import { TagChipRow } from "@/components/media/TagChipRow";

const tags = [
  { slug: "fashion", label: "Fashion", href: "/photography/fashion" },
  { slug: "portraits", label: "Portraits", href: "/photography/portraits" },
];

describe("withAllChip", () => {
  it("puts All, the discipline page itself, first", () => {
    expect(withAllChip("/photography", tags)).toEqual([
      { slug: "", label: "All", href: "/photography" },
      ...tags,
    ]);
  });

  it("adds nothing when there are no tags (no row at all)", () => {
    expect(withAllChip("/photography", [])).toEqual([]);
  });
});

// Each chip's opening tag by its label, so attribute order doesn't matter.
function chipTag(html: string, label: string) {
  return html.match(new RegExp(`<a ([^>]*)>${label}</a>`))?.[1] ?? "";
}

describe("TagChipRow", () => {
  const chips = withAllChip("/photography", tags);

  it("marks All as the current page on the discipline page", () => {
    const html = renderToStaticMarkup(createElement(TagChipRow, { chips }));
    expect(chipTag(html, "All")).toContain('href="/photography"');
    expect(chipTag(html, "All")).toContain('aria-current="page"');
    expect(html.match(/aria-current/g)).toHaveLength(1);
  });

  it("marks the tag as current on a tag page, with All linking back", () => {
    const html = renderToStaticMarkup(createElement(TagChipRow, { chips, activeSlug: "portraits" }));
    expect(chipTag(html, "Portraits")).toContain('aria-current="page"');
    expect(chipTag(html, "All")).toContain('href="/photography"');
    expect(chipTag(html, "All")).not.toContain("aria-current");
    expect(html.match(/aria-current/g)).toHaveLength(1);
  });
});
