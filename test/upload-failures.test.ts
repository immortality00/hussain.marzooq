import { describe, expect, it } from "vitest";
import { uploadFailureMessage } from "@/components/shared/upload/upload-failures";

describe("uploadFailureMessage", () => {
  it("says nothing when every file uploaded", () => {
    expect(uploadFailureMessage(3, [])).toBeNull();
  });

  it("gives a single failed file's own reason", () => {
    expect(uploadFailureMessage(1, [{ name: "logo.svg", reason: "Raw file format svg not allowed" }])).toBe(
      "logo.svg: Raw file format svg not allowed"
    );
  });

  it("keeps every reason when all files fail, grouping files that share one", () => {
    expect(
      uploadFailureMessage(3, [
        { name: "a.svg", reason: "Raw file format svg not allowed" },
        { name: "big.jpg", reason: "File size too large." },
        { name: "b.svg", reason: "Raw file format svg not allowed" },
      ])
    ).toBe("None of the 3 files uploaded. a.svg, b.svg: Raw file format svg not allowed · big.jpg: File size too large.");
  });

  it("names the files that failed when only some did", () => {
    expect(uploadFailureMessage(4, [{ name: "a.svg", reason: "Raw file format svg not allowed" }])).toBe(
      "1 of 4 files did not upload. a.svg: Raw file format svg not allowed"
    );
  });
});
