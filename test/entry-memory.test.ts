// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { forgetAllEntries, recallForEntry, rememberForEntry } from "@/lib/client/entry-memory";

// jsdom has no Navigation API; a stand-in with a settable current entry.
let currentKey: string | null = "entry-1";

function installNavigation() {
  Object.defineProperty(window, "navigation", {
    configurable: true,
    value: {
      get currentEntry() {
        return currentKey ? { key: currentKey, index: 0, url: window.location.href } : null;
      },
      entries: () => [],
    },
  });
}

beforeEach(() => {
  currentKey = "entry-1";
  installNavigation();
  forgetAllEntries();
});

afterEach(() => {
  Reflect.deleteProperty(window, "navigation");
});

describe("entry memory", () => {
  it("gives a page back what it had on the same history entry", () => {
    rememberForEntry("people-index:/people", { query: "ind" });
    expect(recallForEntry("people-index:/people")).toEqual({ query: "ind" });
  });

  it("keeps each history entry apart", () => {
    rememberForEntry("people-index:/people", { query: "first visit" });
    currentKey = "entry-2";
    expect(recallForEntry("people-index:/people")).toBeUndefined();
    rememberForEntry("people-index:/people", { query: "second visit" });

    currentKey = "entry-1";
    expect(recallForEntry("people-index:/people")).toEqual({ query: "first visit" });
  });

  it("never hands one page's memory to another page", () => {
    rememberForEntry("media-search:/photography", { query: "fashion" });
    expect(recallForEntry("media-search:/videography")).toBeUndefined();
  });

  it("keeps only the newest 20 history entries", () => {
    for (let i = 0; i < 21; i += 1) {
      currentKey = `entry-${i}`;
      rememberForEntry("people-index:/people", { query: String(i) });
    }
    currentKey = "entry-0";
    expect(recallForEntry("people-index:/people")).toBeUndefined();
    currentKey = "entry-20";
    expect(recallForEntry("people-index:/people")).toEqual({ query: "20" });
  });

  it("does nothing where the browser has no history list", () => {
    Reflect.deleteProperty(window, "navigation");
    rememberForEntry("people-index:/people", { query: "ind" });
    expect(recallForEntry("people-index:/people")).toBeUndefined();
  });
});
