import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FormStatus } from "@/components/shared/FormStatus";
import { SuccessCheck } from "@/components/shared/SuccessCheck";

const html = (status: Parameters<typeof FormStatus>[0]["status"]) => renderToStaticMarkup(createElement(FormStatus, { status }));

describe("SuccessCheck", () => {
  it("is decorative and draws the ring before the tick", () => {
    const svg = renderToStaticMarkup(createElement(SuccessCheck));
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('stroke="currentColor"');
    expect(svg.indexOf("hm-success-ring")).toBeLessThan(svg.indexOf("hm-success-tick"));
  });
});

describe("FormStatus", () => {
  it("shows the mark beside a success message, which stays the announced text", () => {
    const out = html({ type: "ok", text: "Sent." });
    expect(out).toContain('role="status"');
    expect(out).toContain("hm-success-tick");
    expect(out).toContain("<span");
    expect(out).toContain("Sent.");
  });

  it("never shows the mark on a failure", () => {
    const out = html({ type: "err", text: "Not sent: no connection." });
    expect(out).toContain('role="alert"');
    expect(out).not.toContain("hm-success");
  });

  it("renders nothing without a status", () => {
    expect(html(null)).toBe("");
  });
});
