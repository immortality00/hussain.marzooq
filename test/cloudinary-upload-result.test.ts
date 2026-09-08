import { describe, expect, it } from "vitest";
import { uploadResultError } from "@/lib/cloudinary-upload-result";

const ok = {
  secure_url: "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/a.jpg",
  public_id: "hm_visuals/media/a",
  resource_type: "image",
  bytes: 812_345,
};

describe("uploadResultError", () => {
  it("accepts a complete upload", () => {
    expect(uploadResultError(ok)).toBeNull();
  });

  it("rejects a placeholder asset", () => {
    expect(uploadResultError({ ...ok, placeholder: true, bytes: 0 })).toMatch(/empty file/i);
  });

  it("rejects a zero-byte asset even when it is not flagged as a placeholder", () => {
    expect(uploadResultError({ ...ok, bytes: 0 })).toMatch(/empty file/i);
  });

  it("rejects a response missing the fields the media document needs", () => {
    expect(uploadResultError({ ...ok, secure_url: undefined })).toBe("Upload did not complete.");
    expect(uploadResultError({ ...ok, public_id: "" })).toBe("Upload did not complete.");
    expect(uploadResultError({ ...ok, resource_type: undefined })).toBe("Upload did not complete.");
    expect(uploadResultError(null)).toBe("Upload did not complete.");
  });

  it("does not reject an upload whose byte count is simply absent", () => {
    expect(uploadResultError({ ...ok, bytes: undefined })).toBeNull();
  });
});
