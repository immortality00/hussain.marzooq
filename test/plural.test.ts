import { describe, expect, test } from "vitest";
import { countOf } from "@/lib/plural";

describe("countOf", () => {
  test("puts the noun in the right number", () => {
    expect(countOf(1, "review")).toBe("1 review");
    expect(countOf(3, "review")).toBe("3 reviews");
    expect(countOf(0, "item")).toBe("0 items");
  });

  test("takes the plural when it is not just an s", () => {
    expect(countOf(1, "inquiry", "inquiries")).toBe("1 inquiry");
    expect(countOf(2, "inquiry", "inquiries")).toBe("2 inquiries");
    expect(countOf(4, "person", "people")).toBe("4 people");
  });
});
