import { describe, expect, it } from "vitest";
import { fromRoot, readSource, relativePath, sourceFiles } from "@/test/support/source-files";

const READ_ONLY_POSTS = [
  "app/admin/(protected)/media/batch/components/BatchLinkInput.tsx",
  "lib/client/media-usage-api.ts",
  "lib/client/cloudinary-direct-upload.ts",
  "lib/client/admin-store/write.ts",
  "hooks/useFormToken.ts",
];

function callAt(source: string, start: number) {
  let depth = 0;
  for (let i = source.indexOf("(", start); i < source.length; i += 1) {
    if (source[i] === "(") depth += 1;
    if (source[i] === ")" && --depth === 0) return source.slice(start, i + 1);
  }
  return source.slice(start);
}

function writesWithFetch(source: string) {
  const calls: string[] = [];
  for (const match of source.matchAll(/\bfetch\(/g)) {
    const call = callAt(source, match.index ?? 0);
    if (/method:\s*(["'](POST|PATCH|DELETE|PUT)["']|editingId)/.test(call)) calls.push(call.split("\n")[0]!);
  }
  return calls;
}

describe("admin writes", () => {
  it("send every change through adminWrite, so each one triggers exactly one data check", () => {
    const sources = [
      ...sourceFiles(fromRoot("app/admin"), /\.(ts|tsx)$/),
      ...sourceFiles(fromRoot("components/admin"), /\.(ts|tsx)$/),
      ...sourceFiles(fromRoot("hooks"), /\.(ts|tsx)$/),
      ...sourceFiles(fromRoot("lib/client"), /\.(ts|tsx)$/),
    ];
    const offenders = sources
      .filter((file) => !READ_ONLY_POSTS.includes(relativePath(file)))
      .flatMap((file) => writesWithFetch(readSource(file)).map((call) => `${relativePath(file)}: ${call}`));
    expect(offenders).toEqual([]);
  });

  it("finds a raw write when one is added", () => {
    expect(writesWithFetch('await fetch("/api/x", { method: "DELETE" });')).toHaveLength(1);
    expect(writesWithFetch('await fetch("/api/x", { cache: "no-store" });')).toHaveLength(0);
  });
});
