// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useUploadReplaceCleanup } from "@/hooks/useUploadReplaceCleanup";

describe("useUploadReplaceCleanup", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("does nothing for a key that was never tracked (the doc's original asset)", () => {
    const { result } = renderHook(() => useUploadReplaceCleanup());
    result.current.releaseIfTracked("original-public-id");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does nothing when the key is null or undefined", () => {
    const { result } = renderHook(() => useUploadReplaceCleanup());
    result.current.releaseIfTracked(null);
    result.current.releaseIfTracked(undefined);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("cleans up a tracked upload when it's replaced", () => {
    const { result } = renderHook(() => useUploadReplaceCleanup());

    result.current.track("public-id-1", { publicId: "public-id-1", resourceType: "image" });
    result.current.releaseIfTracked("public-id-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/uploads/cleanup");
    expect(JSON.parse(init.body)).toEqual({ publicId: "public-id-1", resourceType: "image" });
  });

  test("only releases a tracked key once, even if asked twice", () => {
    const { result } = renderHook(() => useUploadReplaceCleanup());

    result.current.track("public-id-1", { publicId: "public-id-1" });
    result.current.releaseIfTracked("public-id-1");
    result.current.releaseIfTracked("public-id-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("a chain of replacements only ever cleans up the superseded upload, never the current one", () => {
    const { result } = renderHook(() => useUploadReplaceCleanup());

    // upload v1 (nothing to release yet, matches the doc's original/no asset)
    result.current.releaseIfTracked(null);
    result.current.track("v1", { publicId: "v1" });

    // v1 gets replaced by v2
    result.current.releaseIfTracked("v1");
    result.current.track("v2", { publicId: "v2" });

    // v2 gets replaced by v3 — v3 is now current and must stay untouched
    result.current.releaseIfTracked("v2");
    result.current.track("v3", { publicId: "v3" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const cleaned = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).publicId);
    expect(cleaned).toEqual(["v1", "v2"]);
  });

  test("never cleans up the doc's original asset — only a value this hook tracked itself", () => {
    const { result } = renderHook(() => useUploadReplaceCleanup());

    // the form loaded with an existing, already-saved asset — never passed to track()
    const originalPublicId = "original-doc-asset";
    result.current.releaseIfTracked(originalPublicId);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
