import { describe, expect, it } from "vitest";
import { keepSame } from "@/lib/client/keep-same";

describe("keepSame", () => {
  it("returns the previous object when nothing changed", () => {
    const previous = { list: [{ id: "a", n: 1 }], meta: { x: 1 } };
    expect(keepSame(JSON.parse(JSON.stringify(previous)), previous)).toBe(previous);
  });

  it("keeps unchanged parts and rows, even when rows move", () => {
    const previous = { list: [{ id: "a", n: 1 }, { id: "b", n: 2 }], meta: { x: 1 } };
    const next = keepSame({ list: [{ id: "c", n: 3 }, { id: "a", n: 1 }, { id: "b", n: 9 }], meta: { x: 1 } }, previous);
    expect(next).not.toBe(previous);
    expect(next.meta).toBe(previous.meta);
    expect(next.list[1]).toBe(previous.list[0]);
    expect(next.list[2]).not.toBe(previous.list[1]);
    expect(next.list[2]).toEqual({ id: "b", n: 9 });
  });

  it("treats a removed key as a change", () => {
    const previous = { a: 1, b: 2 };
    expect(keepSame({ a: 1 }, previous)).toEqual({ a: 1 });
  });

  it("uses the new value when there is nothing to compare with", () => {
    const next = { a: [1] };
    expect(keepSame(next, null)).toBe(next);
  });
});
