import { describe, expect, it } from "vitest";
import { bulkResultText } from "@/components/admin/bulk/bulk-result";

const labels: Record<string, string> = { a: "Wedding", b: "Launch" };
const labelOf = (id: string) => labels[id] ?? "Untitled";

describe("bulkResultText", () => {
  it("reports only the count when everything succeeded", () => {
    expect(bulkResultText({ ok: 3, failures: [] }, "deleted", labelOf)).toBe("3 deleted.");
  });

  it("names each failed item with the server's reason", () => {
    expect(
      bulkResultText(
        { ok: 1, failures: [{ id: "a", message: "Gallery not found." }, { id: "b", message: "Locked." }] },
        "archived",
        labelOf,
      ),
    ).toBe("1 archived, 2 failed. “Wedding”: Gallery not found. “Launch”: Locked.");
  });

  it("falls back when a failure carries no message", () => {
    expect(bulkResultText({ ok: 0, failures: [{ id: "a", message: "" }] }, "deleted", labelOf, "Delete failed.")).toBe(
      "0 deleted, 1 failed. “Wedding”: Delete failed.",
    );
    expect(bulkResultText({ ok: 0, failures: [{ id: "x", message: "" }] }, "restored", labelOf)).toBe(
      "0 restored, 1 failed. “Untitled”: Failed.",
    );
  });
});
