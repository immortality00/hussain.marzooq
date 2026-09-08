import { afterEach, describe, expect, test, vi } from "vitest";
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from "@/lib/reduced-motion";

const original = globalThis.window;

afterEach(() => {
  if (original === undefined) {
    Reflect.deleteProperty(globalThis, "window");
  } else {
    globalThis.window = original;
  }
  vi.restoreAllMocks();
});

function stubWindow(value: unknown) {
  Object.defineProperty(globalThis, "window", {
    value,
    configurable: true,
    writable: true,
  });
}

describe("prefersReducedMotion", () => {
  test("is false on the server, where there is no window", () => {
    Reflect.deleteProperty(globalThis, "window");
    expect(prefersReducedMotion()).toBe(false);
  });

  test("is false when the runtime has no matchMedia", () => {
    stubWindow({});
    expect(prefersReducedMotion()).toBe(false);
  });

  test("reports what the media query says", () => {
    stubWindow({ matchMedia: () => ({ matches: true }) });
    expect(prefersReducedMotion()).toBe(true);

    stubWindow({ matchMedia: () => ({ matches: false }) });
    expect(prefersReducedMotion()).toBe(false);
  });

  test("asks for the reduce query, not some near-miss", () => {
    const matchMedia = vi.fn(() => ({ matches: false }));
    stubWindow({ matchMedia });

    prefersReducedMotion();

    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
  });
});
