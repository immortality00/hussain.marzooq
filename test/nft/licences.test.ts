import { createHash } from "node:crypto";
import { describe, expect, test } from "vitest";
import { LICENCE_FILE_NAME, LICENCE_NAME, LICENCE_TEXT, LICENCE_VERSION, rightsStatement } from "@/lib/nft/licences";

// A pinned licence is final for every token registered with it. If this hash changes, the text
// changed: bump LICENCE_VERSION (a new version for new tokens) and update the hash with it.
const PINNED = { version: "1.0", sha256: "e5ddb918e4a5b1c067587a59ef6712524f54c4251e9f5e515245b5b3c115d25d" };

describe("the collector licence", () => {
  test("its text is exactly the approved version", () => {
    expect(LICENCE_VERSION).toBe(PINNED.version);
    expect(createHash("sha256").update(LICENCE_TEXT).digest("hex")).toBe(PINNED.sha256);
  });

  test("names itself, numbers twelve clauses and gives the contact address", () => {
    expect(LICENCE_TEXT.startsWith(`${LICENCE_NAME}\n`)).toBe(true);
    expect(LICENCE_TEXT.match(/^\d+\. /gm)).toHaveLength(12);
    expect(LICENCE_TEXT).toContain("Contact: hussain@hussain.art.");
    expect(LICENCE_FILE_NAME).toBe("hussain-art-collector-licence-v1.0.txt");
  });

  test("holds what was decided: no remix tier, no consent clause, the harmful-use rule", () => {
    expect(LICENCE_TEXT).toContain("pornographic or sexualised content");
    expect(LICENCE_TEXT).toContain("up to USD 100,000 of gross revenue in a calendar year");
    expect(LICENCE_TEXT).not.toMatch(/written consent|remix/i);
  });

  test("the rights statement names the year and the licence", () => {
    expect(rightsStatement(2026)).toBe("© 2026 Hussain Marzooq. Hussain.Art Collector Licence v1.0.");
  });
});
