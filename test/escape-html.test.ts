import { describe, expect, test } from "vitest";
import { escapeHtml } from "@/lib/server/escape-html";

describe("escapeHtml", () => {
  test("neutralizes a script tag", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  test("neutralizes an injected anchor", () => {
    expect(escapeHtml('<a href="https://evil.example">click</a>')).toBe(
      "&lt;a href=&quot;https://evil.example&quot;&gt;click&lt;/a&gt;",
    );
  });

  test("escapes ampersand before other entities so output cannot re-decode", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  test("escapes single and double quotes for attribute safety", () => {
    expect(escapeHtml(`a"b'c`)).toBe("a&quot;b&#39;c");
  });

  test("leaves plain text untouched", () => {
    expect(escapeHtml("Hussain Marzooq")).toBe("Hussain Marzooq");
  });
});
