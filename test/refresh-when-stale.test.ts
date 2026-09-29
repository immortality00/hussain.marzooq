// @vitest-environment jsdom
import { createElement } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { RefreshWhenStale, STALE_AFTER_MS } from "@/components/admin/RefreshWhenStale";

beforeEach(() => {
  refresh.mockClear();
});

describe("RefreshWhenStale", () => {
  it("leaves a freshly rendered page alone", () => {
    render(createElement(RefreshWhenStale, { renderedAt: Date.now() }));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refreshes a page shown from the phone's copy, once", () => {
    const view = render(createElement(RefreshWhenStale, { renderedAt: Date.now() - STALE_AFTER_MS - 1 }));
    view.rerender(createElement(RefreshWhenStale, { renderedAt: Date.now() - 60 * STALE_AFTER_MS }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
