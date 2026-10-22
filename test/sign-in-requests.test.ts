import { describe, expect, it } from "vitest";
import { approvalChoices } from "@/lib/server/sign-in-requests";

describe("approvalChoices", () => {
  it("offers the real number among three different two-digit numbers", () => {
    for (let run = 0; run < 200; run += 1) {
      const number = 10 + (run % 90);
      const choices = approvalChoices(number);
      expect(choices).toHaveLength(3);
      expect(new Set(choices).size).toBe(3);
      expect(choices).toContain(number);
      for (const choice of choices) {
        expect(choice).toBeGreaterThanOrEqual(10);
        expect(choice).toBeLessThan(100);
      }
    }
  });

  it("does not always put the real number in the same place", () => {
    const places = new Set(Array.from({ length: 100 }, () => approvalChoices(42).indexOf(42)));
    expect(places.size).toBeGreaterThan(1);
  });
});
