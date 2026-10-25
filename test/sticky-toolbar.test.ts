import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { isStuck } from "@/lib/sticky-toolbar";
import { fromRoot, readSource, relativePath, sourceFiles } from "@/test/support/source-files";

describe("isStuck", () => {
  it("is stuck on its stick line or pushed above it", () => {
    expect(isStuck(69, 69)).toBe(true);
    expect(isStuck(69.4, 69)).toBe(true);
    expect(isStuck(-200, 69)).toBe(true);
  });

  it("is not stuck while still below its stick line", () => {
    expect(isStuck(70, 69)).toBe(false);
    expect(isStuck(213, 69)).toBe(false);
  });

  it("is not stuck when either value cannot be read", () => {
    expect(isStuck(Number.NaN, 69)).toBe(false);
    expect(isStuck(69, Number.NaN)).toBe(false);
  });
});

describe("StickyToolbar", () => {
  it("is never stuck in the server HTML, so hydration cannot disagree", () => {
    const html = renderToStaticMarkup(createElement(StickyToolbar, null, "Search"));
    expect(html).toContain('class="hm-sticky-toolbar"');
    expect(html).toContain('data-surface="page"');
    expect(html).not.toContain("data-stuck");
  });

  it("is used with the admin surface everywhere in admin", () => {
    const files = [
      ...sourceFiles(fromRoot("app/admin"), /\.tsx$/),
      ...sourceFiles(fromRoot("components/admin"), /\.tsx$/),
    ];
    const wrong = files.filter((file) =>
      (readSource(file).match(/<StickyToolbar\b[^>]*>/g) ?? []).some((tag) => !tag.includes('surface="admin"')),
    );
    expect(wrong.map(relativePath)).toEqual([]);
  });
});

// position: sticky only works when no ancestor between the bar and the window
// scrolls or hides overflow; overflow-x: hidden turns the other axis into a
// scroll box too. clip clips without becoming one.
describe("ancestors of the sticky bars", () => {
  const wrappers = [
    "app/admin/(protected)/layout.tsx",
    "components/site/AppShell.tsx",
    "components/site/SiteFrame.tsx",
    "components/site/RootDocument.tsx",
    "app/styles/base.css",
  ];

  it.each(wrappers)("%s hides or scrolls no overflow", (file) => {
    expect(readSource(fromRoot(file))).not.toMatch(/overflow(-[xy])?-(hidden|auto|scroll)|overflow(-[xy])?:\s*(hidden|auto|scroll)/);
  });

  it("the public page shell clips instead of hiding", () => {
    expect(readSource(fromRoot("app/styles/layout.css"))).toMatch(/\.page-shell\s*\{[^}]*overflow-x-clip/);
  });

  it("the sticky styles are loaded", () => {
    expect(readSource(fromRoot("app/globals.css"))).toContain('@import "./styles/sticky-toolbar.css";');
  });
});
