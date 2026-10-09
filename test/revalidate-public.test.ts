import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { workAsyncStorage } from "next/dist/server/app-render/work-async-storage.external";
import { getImplicitTags } from "next/dist/server/lib/implicit-tags";
import { revalidatePublicPattern, revalidatePublicTree } from "@/app/api/_lib/revalidate";
import { fromRoot, readSource, relativePath, sourceFiles } from "@/test/support/source-files";

vi.hoisted(() => {
  (globalThis as { AsyncLocalStorage?: unknown }).AsyncLocalStorage ??= process.getBuiltinModule("node:async_hooks").AsyncLocalStorage;
});

type PendingTag = { tag: string };

function tagsFrom(run: () => void) {
  const store = { incrementalCache: {}, route: "/api/test" } as unknown as Parameters<typeof workAsyncStorage.run>[0];
  workAsyncStorage.run(store, run);
  return ((store as unknown as { pendingRevalidatedTags?: PendingTag[] }).pendingRevalidatedTags ?? []).map((t) => t.tag);
}

const publicPages = sourceFiles(fromRoot("app", "(site)"), /^page\.tsx$/).map((file) => {
  const route = "/" + path.relative(fromRoot("app"), file).replace(/\.tsx$/, "").split(path.sep).join("/");
  const pathname = route.replace("/(site)", "").replace(/\/page$/, "").replace(/\[[^\]]+\]/g, "sample") || "/";
  return { route, pathname };
});

async function pagesTaggedWith(tag: string) {
  const matches: string[] = [];
  for (const page of publicPages) {
    const { tags } = await getImplicitTags(page.route, page.pathname, null);
    if (tags.includes(tag)) matches.push(page.route);
  }
  return matches;
}

const apiSources = sourceFiles(fromRoot("app", "api"), /\.ts$/);

function collected(pattern: RegExp) {
  return [...new Set(apiSources.flatMap((file) => [...readSource(file).matchAll(pattern)].map((m) => m[1])))];
}

const treePaths = [
  ...new Set([...collected(/revalidatePublicTree\("([^"]+)"\)/g), ...collected(/^\s+"?[\w-]+"?: "(\/[a-z-]+)",$/gm), "/people"]),
];
const routePatterns = [
  ...new Set([...collected(/revalidatePublicPattern\("([^"]+)"\)/g), ...collected(/^\s+"?[\w-]+"?: "(\/[^"]*\[[^"]*)",$/gm)]),
];

describe("public page revalidation", () => {
  it("collects every path the routes revalidate", () => {
    expect(treePaths).toEqual(
      expect.arrayContaining(["/people", "/blog", "/services", "/photography", "/videography", "/about", "/privacy"])
    );
    expect(routePatterns).toEqual(
      expect.arrayContaining(["/people/[slug]", "/services/[slug]", "/blog/[slug]", "/photography/[tag]", "/videography/[tag]"])
    );
  });

  it.each(treePaths)("revalidatePublicTree(%s) reaches the index and every page under it", async (target) => {
    const [tag] = tagsFrom(() => revalidatePublicTree(target));
    const hit = await pagesTaggedWith(tag);
    const expected = publicPages.filter((p) => p.pathname === target || p.pathname.startsWith(`${target}/`));
    expect(expected.length).toBeGreaterThan(0);
    expect(hit.sort()).toEqual(expected.map((p) => p.route).sort());
  });

  it.each(routePatterns)("revalidatePublicPattern(%s) reaches that page", async (pattern) => {
    const [tag] = tagsFrom(() => revalidatePublicPattern(pattern));
    expect(await pagesTaggedWith(tag)).toEqual([`/(site)${pattern}/page`]);
  });

  it("a path without the route group reaches no page", async () => {
    expect(await pagesTaggedWith("_N_T_/people/layout")).toEqual([]);
  });

  it("only the shared helpers pass a layout or page type", () => {
    const offenders = sourceFiles(fromRoot("app"), /\.tsx?$/)
      .concat(sourceFiles(fromRoot("lib"), /\.tsx?$/))
      .filter((file) => !file.endsWith(path.join("app", "api", "_lib", "revalidate.ts")))
      .flatMap((file) =>
        [...readSource(file).matchAll(/revalidatePath\(([^)]*),\s*"(layout|page)"\)/g)]
          .filter((m) => m[1].trim() !== '"/"')
          .map((m) => `${relativePath(file)}: ${m[0]}`)
      );
    expect(offenders).toEqual([]);
  });
});
