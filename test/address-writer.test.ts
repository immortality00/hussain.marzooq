// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADDRESS_WRITE_GAP_MS, withAddressValues } from "@/lib/address-values";
import { changeAddress, flushAddressChanges, resetAddressWriter } from "@/lib/client/address-writer";

const set = (values: Record<string, string>) => (search: string) => withAddressValues(search, values);
let replace: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers();
  window.history.replaceState(null, "", "/admin/media/list");
  resetAddressWriter();
  replace = vi.spyOn(window.history, "replaceState");
});

afterEach(() => {
  replace.mockRestore();
  vi.useRealTimers();
});

describe("address writer", () => {
  it("writes the first change at once, without a new history entry", () => {
    const length = window.history.length;
    changeAddress("a", "/admin/media/list", set({ q: "seed" }));
    vi.advanceTimersByTime(0);
    expect(window.location.search).toBe("?q=seed");
    expect(window.history.length).toBe(length);
  });

  it("keeps writes a second apart, the newest change winning", () => {
    changeAddress("a", "/admin/media/list", set({ q: "s" }));
    vi.advanceTimersByTime(0);
    changeAddress("a", "/admin/media/list", set({ q: "se" }));
    changeAddress("a", "/admin/media/list", set({ q: "see" }));
    vi.advanceTimersByTime(ADDRESS_WRITE_GAP_MS - 1);
    expect(window.location.search).toBe("?q=s");
    vi.advanceTimersByTime(1);
    expect(window.location.search).toBe("?q=see");
    expect(replace).toHaveBeenCalledTimes(2);
  });

  it("applies every part of a screen in one write", () => {
    changeAddress("filters", "/admin/media/list", set({ category: "videography" }));
    changeAddress("search", "/admin/media/list", set({ q: "boat" }));
    vi.advanceTimersByTime(0);
    expect(new URLSearchParams(window.location.search).get("category")).toBe("videography");
    expect(new URLSearchParams(window.location.search).get("q")).toBe("boat");
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("drops a change made on a page that has since been left", () => {
    changeAddress("a", "/admin/media/list", set({ q: "s" }));
    vi.advanceTimersByTime(0);
    changeAddress("a", "/admin/media/list", set({ q: "late" }));
    window.history.replaceState(null, "", "/admin/media?edit=1");
    replace.mockClear();
    vi.advanceTimersByTime(ADDRESS_WRITE_GAP_MS);
    expect(window.location.search).toBe("?edit=1");
    expect(replace).not.toHaveBeenCalled();
  });

  it("writes nothing when the address already says it", () => {
    window.history.replaceState(null, "", "/admin/media/list?q=seed");
    replace.mockClear();
    changeAddress("a", "/admin/media/list", set({ q: "seed" }));
    vi.advanceTimersByTime(0);
    expect(replace).not.toHaveBeenCalled();
  });

  it("writes a waiting change at once when a link is pressed, so Back returns to it", () => {
    changeAddress("a", "/admin/media/list", set({ q: "s" }));
    vi.advanceTimersByTime(0);
    changeAddress("a", "/admin/media/list", set({ q: "seed photo" }));
    const link = document.createElement("a");
    link.href = "/admin/media?edit=1";
    link.addEventListener("click", (event) => event.preventDefault());
    document.body.append(link);
    link.click();
    expect(new URLSearchParams(window.location.search).get("q")).toBe("seed photo");
    link.remove();
  });

  it("can be flushed on demand", () => {
    changeAddress("a", "/admin/media/list", set({ q: "s" }));
    vi.advanceTimersByTime(0);
    changeAddress("a", "/admin/media/list", set({ q: "now" }));
    flushAddressChanges();
    expect(window.location.search).toBe("?q=now");
  });
});
