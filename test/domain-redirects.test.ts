import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeSiteUrl } from "@/lib/seo/site-url";

const blocks = readFileSync("netlify.toml", "utf8").split("[[redirects]]").slice(1);
const field = (block: string, key: string) => block.match(new RegExp(`^\\s*${key} = (.+)$`, "m"))?.[1];

describe("old-domain redirects in netlify.toml", () => {
  const oldHosts = ["https://hussain-marzooq.com/*", "https://www.hussain-marzooq.com/*"];

  it("come before every other redirect rule", () => {
    expect(blocks.slice(0, oldHosts.length).map((b) => field(b, "from"))).toEqual(oldHosts.map((h) => `"${h}"`));
  });

  it("send every path to the site address with a forced 301", () => {
    for (const block of blocks.slice(0, oldHosts.length)) {
      expect(field(block, "to")).toBe(`"${normalizeSiteUrl(undefined)}/:splat"`);
      expect(field(block, "status")).toBe("301");
      expect(field(block, "force")).toBe("true");
    }
  });
});
