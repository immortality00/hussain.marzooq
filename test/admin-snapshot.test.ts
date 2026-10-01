import { describe, expect, it } from "vitest";
import { snapshotVersion, type AdminSnapshot } from "@/lib/server/admin-snapshot";

const base = { notificationCount: 1, inquiries: [{ id: "a", name: "Ada" }] } as unknown as AdminSnapshot;

describe("snapshotVersion", () => {
  it("is the same for the same data and changes with any change", () => {
    expect(snapshotVersion(base)).toBe(snapshotVersion({ ...base }));
    expect(snapshotVersion(base)).not.toBe(
      snapshotVersion({ ...base, inquiries: [{ id: "a", name: "Grace" }] } as unknown as AdminSnapshot)
    );
  });
});
