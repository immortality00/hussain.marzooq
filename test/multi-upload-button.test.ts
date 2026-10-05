// @vitest-environment jsdom
import { createElement } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { uploadFileToCloudinary } = vi.hoisted(() => ({ uploadFileToCloudinary: vi.fn() }));
vi.mock("@/lib/client/cloudinary-direct-upload", () => ({ uploadFileToCloudinary }));

import { CloudinaryMultiUploadButton } from "@/components/shared/upload/CloudinaryMultiUploadButton";

function pick(files: File[]) {
  const onUploaded = vi.fn();
  const onError = vi.fn();
  const { container } = render(
    createElement(CloudinaryMultiUploadButton, { folder: "hm_visuals/testimonials/s/photos", onUploaded, onError })
  );
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(input, "files", { value: files, configurable: true });
  fireEvent.change(input);
  return { onUploaded, onError, container };
}

uploadFileToCloudinary.mockImplementation(async (file: File) => {
  if (file.name.endsWith(".svg")) throw new Error("Raw file format svg not allowed");
  return { secureUrl: `https://res.cloudinary.com/x/${file.name}`, publicId: file.name, resourceType: "image" };
});

afterEach(() => vi.clearAllMocks());

describe("CloudinaryMultiUploadButton", () => {
  it("shows the refused file's own reason after the batch, not a generic message", async () => {
    const { onUploaded, onError } = pick([new File(["<svg/>"], "logo.svg"), new File(["jpg"], "photo.jpg")]);

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith("1 of 2 files did not upload. logo.svg: Raw file format svg not allowed");
    expect(onUploaded).toHaveBeenCalledTimes(1);
    expect(onUploaded.mock.invocationCallOrder[0]).toBeLessThan(onError.mock.invocationCallOrder[0]);
  });

  it("gives the reason when the only file is refused", async () => {
    const { onError, onUploaded } = pick([new File(["<svg/>"], "logo.svg")]);

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError.mock.calls).toEqual([["logo.svg: Raw file format svg not allowed"]]);
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("reports nothing when every file uploads", async () => {
    const { onError, onUploaded, container } = pick([new File(["a"], "a.jpg"), new File(["b"], "b.jpg")]);

    await waitFor(() => expect(onUploaded).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(container.querySelector("button")?.textContent).toBe("Choose files"));
    expect(onError).not.toHaveBeenCalled();
  });
});
