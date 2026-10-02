// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LOADING_LINES, LOADING_LINE_MS, loadingLine } from "@/lib/loading-lines";
import { LAUNCH_SCREEN_PATH, SIGNATURE_MASK_PATH, launchScreenHtml } from "@/lib/launch-screen";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { ADMIN_LOGOUT_PATH, ADMIN_SIGN_IN_PATH } from "@/lib/auth/admin-next-path";
import { HINT_NAME } from "@/lib/auth/session-token";

describe("loadingLine", () => {
  it("cycles through every line and wraps in both directions", () => {
    expect(loadingLine(0)).toBe(LOADING_LINES[0]);
    expect(loadingLine(LOADING_LINES.length)).toBe(LOADING_LINES[0]);
    expect(loadingLine(LOADING_LINES.length + 3)).toBe(LOADING_LINES[3]);
    expect(loadingLine(-1)).toBe(LOADING_LINES[LOADING_LINES.length - 1]);
  });
});

describe("launchScreenHtml", () => {
  const html = launchScreenHtml();

  it("is a self-contained page: every line inline, only same-origin assets", () => {
    for (const line of LOADING_LINES) expect(html).toContain(JSON.stringify(line));
    expect(html).toContain(`url(${SIGNATURE_MASK_PATH})`);
    expect(html).not.toMatch(/https?:\/\//);
  });

  it("never reloads itself when opened at its own address", () => {
    expect(html).toContain(`location.pathname!==${JSON.stringify(LAUNCH_SCREEN_PATH)}`);
  });

  it("goes straight to the sign-in page when the visitor is signed out", () => {
    expect(html).toContain(JSON.stringify(ADMIN_SIGN_IN_PATH));
    expect(html).toContain(JSON.stringify(`${HINT_NAME}=1`));
  });

  it("is what the admin service worker caches and serves, beside the sign-in page and logout", () => {
    const worker = readFileSync("public/admin-sw.js", "utf8");
    expect(worker).toContain(`const LAUNCH_PATH = "${LAUNCH_SCREEN_PATH}";`);
    expect(worker).toContain(`const MASK_PATH = "${SIGNATURE_MASK_PATH}";`);
    expect(worker).toContain(`const SIGN_IN_PATH = "${ADMIN_SIGN_IN_PATH}";`);
    expect(worker).toContain(`const LOGOUT_PATH = "${ADMIN_LOGOUT_PATH}";`);
  });
});

describe("LoadingScreen", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a line straight away and moves on while it waits", () => {
    vi.useFakeTimers();
    const { container } = render(createElement(LoadingScreen));
    const line = () => container.querySelector("p")?.textContent ?? "";

    const first = line();
    expect(LOADING_LINES).toContain(first);
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Loading");

    act(() => {
      vi.advanceTimersByTime(LOADING_LINE_MS);
    });
    expect(LOADING_LINES).toContain(line());
    expect(line()).not.toBe(first);
  });
});
