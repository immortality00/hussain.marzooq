import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import type { Db } from "mongodb";
import { ASSET_HOLDING_COLLECTIONS, isCloudinaryAssetReferenced } from "@/lib/server/asset-references";

const COLLECTIONS_WITHOUT_ASSETS = [
  "service_categories",
  "private_galleries",
  "blog_categories",
  "media_tags",
  "inquiries",
  "removal_requests",
  "request_guards",
  "testimonial_upload_sessions",
  "upload_ledger",
];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : sourceFiles(full);
    return /\.(ts|tsx|mjs)$/.test(entry.name) ? [full] : [];
  });
}

function collectionsUsedInSource(): Set<string> {
  const names = new Set<string>();
  for (const root of ["app", "lib", "hooks", "components"]) {
    for (const file of sourceFiles(path.join(process.cwd(), root))) {
      for (const match of fs.readFileSync(file, "utf8").matchAll(/collection(?:<[^>]*>)?\(\s*"([a-z_]+)"\s*\)/g)) {
        names.add(match[1]);
      }
    }
  }
  return names;
}

describe("the 'is this asset still used' check covers every collection that can hold one", () => {
  test("every collection in the codebase is either checked for assets or explicitly declared asset-free", () => {
    const classified = new Set<string>([...ASSET_HOLDING_COLLECTIONS, ...COLLECTIONS_WITHOUT_ASSETS]);
    const unclassified = [...collectionsUsedInSource()].filter((name) => !classified.has(name));

    expect(
      unclassified,
      `New collection(s) ${unclassified.join(", ")}: if they can store a Cloudinary URL or public id, add them to ASSET_HOLDING_COLLECTIONS and to isCloudinaryAssetReferenced; otherwise list them as asset-free here. Skipping this lets the upload sweep delete an image a document still uses.`
    ).toEqual([]);
  });

  test("isCloudinaryAssetReferenced actually queries every declared asset-holding collection", async () => {
    const queried = new Set<string>();
    const db = {
      collection(name: string) {
        queried.add(name);
        return {
          findOne: async () => null,
          find: () => ({ toArray: async () => [] }),
        };
      },
    } as unknown as Db;

    await isCloudinaryAssetReferenced(db, "hm_visuals/sections/x");

    expect([...queried].sort()).toEqual([...ASSET_HOLDING_COLLECTIONS].sort());
  });
});
