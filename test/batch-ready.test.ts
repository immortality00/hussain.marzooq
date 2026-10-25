import { describe, expect, it } from "vitest";
import { batchReadyText } from "@/app/admin/(protected)/media/batch/lib/batch-ready";

describe("batchReadyText", () => {
  it("shows nothing before anything is added", () => {
    expect(batchReadyText(0, null)).toBeNull();
    expect(batchReadyText(0, { total: 3, failed: 0, finished: false })).toBeNull();
  });

  it("counts the items while files are still uploading", () => {
    expect(batchReadyText(1, { total: 4, failed: 0, finished: false })).toBe("1 item ready");
    expect(batchReadyText(3, { total: 4, failed: 0, finished: false })).toBe("3 items ready");
  });

  it("says all ready once every picked file has uploaded", () => {
    expect(batchReadyText(4, { total: 4, failed: 0, finished: true })).toBe("All ready");
  });

  it("keeps the count when a picked file did not upload", () => {
    expect(batchReadyText(3, { total: 4, failed: 1, finished: true })).toBe("3 items ready");
  });

  it("says all ready for links added without an upload", () => {
    expect(batchReadyText(2, null)).toBe("All ready");
  });
});
