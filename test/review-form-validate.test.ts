import { describe, expect, it } from "vitest";
import { reviewFormError } from "@/components/testimonials/review-form/validate";

const valid = { name: "Ana", email: "ana@example.com", review: "Lovely shoot.", rating: 5, consent: true };

describe("reviewFormError", () => {
  it("accepts a complete form", () => {
    expect(reviewFormError(valid)).toBeNull();
  });

  it("reports the first missing field, in form order", () => {
    expect(reviewFormError({ ...valid, name: "  ", email: "" })).toBe("Name is required.");
    expect(reviewFormError({ ...valid, email: " ", review: "" })).toBe("Email is required.");
    expect(reviewFormError({ ...valid, email: "ana@", review: "" })).toBe("Use a valid email address.");
    expect(reviewFormError({ ...valid, review: "\n", rating: 0 })).toBe("Review is required.");
    expect(reviewFormError({ ...valid, rating: 0, consent: false })).toBe("Stars are required.");
    expect(reviewFormError({ ...valid, consent: false })).toBe("Publication consent is required.");
  });

  it("trims the email before checking it", () => {
    expect(reviewFormError({ ...valid, email: "  ana@example.com  " })).toBeNull();
  });

  it("rejects a rating outside 1 to 5", () => {
    expect(reviewFormError({ ...valid, rating: 6 })).toBe("Stars are required.");
  });
});
