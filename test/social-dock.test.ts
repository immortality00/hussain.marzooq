// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SocialDock } from "@/components/site/SocialDock";

// jsdom has no IntersectionObserver; this one lets the test say when the footer is on screen.
let reportFooter: ((isIntersecting: boolean) => void) | null = null;

class FakeIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe() {
    reportFooter = (isIntersecting) =>
      this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  disconnect() {
    reportFooter = null;
  }
}

class NoResizeObserver {
  observe() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  vi.stubGlobal("ResizeObserver", NoResizeObserver);
  // A page too short to scroll shows the column at once (the booking bar's rule).
  const footer = document.createElement("footer");
  footer.setAttribute("data-site-footer", "");
  document.body.appendChild(footer);
});

afterEach(() => {
  cleanup();
  document.querySelector("[data-site-footer]")?.remove();
  vi.unstubAllGlobals();
});

function dock() {
  render(createElement(SocialDock, null, createElement("li", null, "icon")));
  return document.querySelector("nav")!;
}

describe("SocialDock", () => {
  it("steps aside, and can't be tabbed to, while the footer is on screen", () => {
    const nav = dock();
    expect(nav.hasAttribute("data-shown")).toBe(true);
    expect(nav.hasAttribute("inert")).toBe(false);

    act(() => reportFooter?.(true));
    expect(nav.hasAttribute("data-shown")).toBe(false);
    expect(nav.hasAttribute("inert")).toBe(true);

    act(() => reportFooter?.(false));
    expect(nav.hasAttribute("data-shown")).toBe(true);
    expect(nav.hasAttribute("inert")).toBe(false);
  });
});
