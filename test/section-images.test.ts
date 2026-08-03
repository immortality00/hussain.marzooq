import { describe, expect, test } from "vitest";
import {
  EMPTY_SECTION_IMAGE,
  resolveOptionalCardImage,
} from "@/lib/page-sections-shared";

describe("resolveOptionalCardImage", () => {
  test("absent key means leave unchanged (undefined)", () => {
    expect(resolveOptionalCardImage({ isActive: true })).toBeUndefined();
  });

  test("present valid SectionImage is echoed through", () => {
    const image = { url: "https://res.cloudinary.com/x.jpg", publicId: "hm_visuals/sections/x" };
    expect(resolveOptionalCardImage({ isActive: true, cardImage: image })).toEqual(image);
  });

  test("present but null resolves to the empty image (explicit clear)", () => {
    expect(resolveOptionalCardImage({ cardImage: null })).toEqual(EMPTY_SECTION_IMAGE);
  });

  test("present but malformed resolves to the empty image", () => {
    expect(resolveOptionalCardImage({ cardImage: { url: 5 } })).toEqual(EMPTY_SECTION_IMAGE);
    expect(resolveOptionalCardImage({ cardImage: "nope" })).toEqual(EMPTY_SECTION_IMAGE);
  });
});
