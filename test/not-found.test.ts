import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";
import { fromRoot, readSource as read, relativePath as relative, sourceFiles as files } from "@/test/support/source-files";

describe("the 404 page", () => {
  it("renders unmatched URLs through app/global-not-found.tsx", () => {
    expect(nextConfig.experimental?.globalNotFound).toBe(true);
    const page = read(fromRoot("app/global-not-found.tsx"));
    expect(page).toMatch(/<RootDocument>/);
    expect(page).toMatch(/<PublicFrame fullPageLoads>/);
    expect(page).toMatch(/<NotFoundContent \/>/);
  });

  it("has no catch-all page that calls notFound()", () => {
    const catchAlls = files(fromRoot("app"), /^page\.tsx$/)
      .filter((file) => /\[\[?\.\.\./.test(relative(file)))
      .filter((file) => /notFound\(/.test(read(file)))
      .map(relative);
    expect(catchAlls).toEqual([]);
  });
});
