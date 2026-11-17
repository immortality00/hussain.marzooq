// @vitest-environment jsdom
import { createElement } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const { AnalyticsPageviews, TITLE_WAIT_MS } = await import("@/components/site/AnalyticsPageviews");

const count = vi.fn();
const view = () => createElement(AnalyticsPageviews);

beforeEach(() => {
  pathname = "/";
  document.title = "Hussain.Art";
  count.mockReset();
  (window as unknown as { goatcounter?: unknown }).goatcounter = { count };
});

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(window, "goatcounter");
});

describe("AnalyticsPageviews", () => {
  it("leaves the first page to count.js and counts each later page once", () => {
    const page = render(view());
    expect(count).not.toHaveBeenCalled();

    pathname = "/people";
    document.title = "People — Hussain.Art";
    page.rerender(view());
    expect(count).toHaveBeenCalledTimes(1);
    expect(count).toHaveBeenLastCalledWith({ path: "/people", referrer: "" });

    page.rerender(view());
    expect(count).toHaveBeenCalledTimes(1);

    pathname = "/people/someone";
    document.title = "Someone — Hussain.Art";
    page.rerender(view());
    expect(count).toHaveBeenCalledTimes(2);
  });

  it("waits for the new page's title before counting", async () => {
    const page = render(view());

    pathname = "/about";
    document.title = "";
    page.rerender(view());
    expect(count).not.toHaveBeenCalled();

    await act(async () => {
      document.title = "About — Hussain.Art";
      await Promise.resolve();
    });
    expect(count).toHaveBeenCalledTimes(1);
  });

  it("counts after 1.5 s when the title never changes", () => {
    vi.useFakeTimers();
    const page = render(view());

    pathname = "/about";
    page.rerender(view());
    expect(count).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(TITLE_WAIT_MS));
    expect(count).toHaveBeenCalledTimes(1);
  });

  it("still counts a page left before its title arrived", () => {
    const page = render(view());

    pathname = "/about";
    document.title = "";
    page.rerender(view());
    pathname = "/services";
    document.title = "Services — Hussain.Art";
    page.rerender(view());

    expect(count.mock.calls.map(([vars]) => vars.path)).toEqual(["/about", "/services"]);
  });

  it("cuts a public gallery's key out of the path", () => {
    const page = render(view());
    pathname = "/g/summer-shoot/AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_abcde";
    document.title = "Summer shoot";
    page.rerender(view());
    expect(count).toHaveBeenLastCalledWith({ path: "/g/summer-shoot", referrer: "" });
  });

  it("does nothing until count.js has loaded", () => {
    Reflect.deleteProperty(window, "goatcounter");
    const page = render(view());
    pathname = "/about";
    document.title = "About — Hussain.Art";
    expect(() => page.rerender(view())).not.toThrow();
  });
});
