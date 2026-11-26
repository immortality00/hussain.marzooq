import { describe, expect, it } from "vitest";
import { fromRoot, readSource, relativePath, sourceFiles } from "@/test/support/source-files";

// The browser's own boxes, called bare or on window / globalThis / self — never a method of something else
// (discard.confirm()) and never a function of that name being declared.
const NATIVE_BOX = /(?<![.\w$])(?<!function\s+)(?:(?:window|globalThis|self)\.)?(?:confirm|alert|prompt)\(/;
// The feedback box is already green or red; a message carries no mark of its own.
const MESSAGE_MARK = /[✅❌]/;

function findings(source: string, pattern: RegExp) {
  return source.split("\n").flatMap((line, i) => (pattern.test(line) ? [`${i + 1}: ${line.trim()}`] : []));
}

function offenders(pattern: RegExp) {
  const sources = [
    ...sourceFiles(fromRoot("app/admin"), /\.(ts|tsx)$/),
    ...sourceFiles(fromRoot("components/admin"), /\.(ts|tsx)$/),
    ...sourceFiles(fromRoot("hooks"), /\.(ts|tsx)$/),
    ...sourceFiles(fromRoot("lib/client"), /\.(ts|tsx)$/),
  ];
  return sources.flatMap((file) => findings(readSource(file), pattern).map((line) => `${relativePath(file)}:${line}`));
}

describe("admin questions and messages", () => {
  it("ask every question in the shared dialog, never the browser's confirm, alert or prompt", () => {
    expect(offenders(NATIVE_BOX)).toEqual([]);
  });

  it("keep messages plain, with no ✅ or ❌", () => {
    expect(offenders(MESSAGE_MARK)).toEqual([]);
  });

  it("finds a native box or a marked message when one is added", () => {
    expect(findings('if (!confirm("Delete?")) return;', NATIVE_BOX)).toHaveLength(1);
    expect(findings('window.alert("Saved")', NATIVE_BOX)).toHaveLength(1);
    expect(findings('const name = globalThis.prompt("Name?");', NATIVE_BOX)).toHaveLength(1);
    expect(findings("if (await discard.confirm()) go();", NATIVE_BOX)).toHaveLength(0);
    expect(findings("function confirm() {}", NATIVE_BOX)).toHaveLength(0);
    expect(findings("void confirmApprove(id);", NATIVE_BOX)).toHaveLength(0);
    expect(findings('notify("ok", "✅ Saved.");', MESSAGE_MARK)).toHaveLength(1);
  });
});
