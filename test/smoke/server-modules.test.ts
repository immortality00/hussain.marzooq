/// <reference types="vite/client" />
import { describe, expect, test } from "vitest";

// Import every server-side data module and API route handler. This is a
// regression net: a broken import, circular dependency, or module-scope crash
// surfaces here instead of only at request time in production. It intentionally
// excludes the RSC page.tsx trees, which pull browser-only libraries (Lenis,
// react-globe.gl, GSAP/Three) that reference `window` at module scope.
const modules = {
  ...import.meta.glob("../../lib/server/*.ts"),
  ...import.meta.glob("../../app/api/**/route.ts"),
};

describe("server module smoke test", () => {
  const paths = Object.keys(modules).sort();

  test("discovers modules to check", () => {
    expect(paths.length).toBeGreaterThan(0);
  });

  test.each(paths)("imports without throwing: %s", async (path) => {
    await expect(modules[path]()).resolves.toBeDefined();
  });
});
