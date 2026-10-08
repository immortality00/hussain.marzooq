import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FORM_TOKEN_MAX_AGE_MS,
  checkFormToken,
  formTokenRefusal,
  isFormKind,
  issueFormToken,
} from "@/lib/server/form-token";

const NOW = 1_800_000_000_000;

beforeEach(() => vi.stubEnv("ADMIN_COOKIE_SECRET", "form-token-secret"));

describe("form token", () => {
  it("accepts a token for the same form between 2.5 s and 24 h old", () => {
    const token = issueFormToken("inquiry", NOW);
    expect(checkFormToken(token, "inquiry", NOW + 2500)).toBe("ok");
    expect(checkFormToken(token, "inquiry", NOW + FORM_TOKEN_MAX_AGE_MS)).toBe("ok");
  });

  it("refuses a token used too soon or too late", () => {
    const token = issueFormToken("review", NOW);
    expect(checkFormToken(token, "review", NOW + 1000)).toBe("fast");
    expect(checkFormToken(token, "review", NOW + FORM_TOKEN_MAX_AGE_MS + 1)).toBe("expired");
    expect(checkFormToken(token, "review", NOW - 10 * 60_000)).toBe("expired");
  });

  it("refuses a token issued for another form", () => {
    expect(checkFormToken(issueFormToken("removal", NOW), "inquiry", NOW + 60_000)).toBe("forged");
  });

  it("refuses a token whose time was changed or that another secret signed", () => {
    const token = issueFormToken("inquiry", NOW)!;
    const [v, form, , sig] = token.split(".");
    expect(checkFormToken(`${v}.${form}.1.${sig}`, "inquiry", NOW + 60_000)).toBe("forged");

    vi.stubEnv("ADMIN_COOKIE_SECRET", "other-secret");
    expect(checkFormToken(token, "inquiry", NOW + 60_000)).toBe("forged");
  });

  it("treats a missing, non-text or oversized value as missing", () => {
    for (const value of [undefined, null, 1, "", {}, "x".repeat(500)]) {
      expect(checkFormToken(value, "inquiry", NOW)).toBe("missing");
    }
    expect(checkFormToken("v1.inquiry.1.zz", "inquiry", NOW)).toBe("forged");
  });

  it("issues nothing without a secret", () => {
    vi.stubEnv("ADMIN_COOKIE_SECRET", "");
    expect(issueFormToken("inquiry", NOW)).toBeNull();
  });

  it("gives a visitor-readable reason only when refused", () => {
    const token = issueFormToken("inquiry", NOW);
    expect(formTokenRefusal(token, "inquiry", NOW + 60_000)).toBeNull();
    expect(formTokenRefusal(token, "inquiry", NOW)).toBe("Submission was too fast. Please try again.");
    expect(formTokenRefusal(undefined, "inquiry", NOW)).toBe("Reload the page and try again.");
  });

  it("knows only the three forms", () => {
    expect(["inquiry", "review", "removal"].every(isFormKind)).toBe(true);
    expect(isFormKind("admin")).toBe(false);
  });
});

describe("client wait before sending", () => {
  it("waits out the rest of 2.7 s after the token arrived, never a negative time", async () => {
    const { tokenWaitMs } = await import("@/hooks/useFormToken");
    expect(tokenWaitMs(NOW, NOW)).toBe(2700);
    expect(tokenWaitMs(NOW, NOW + 1000)).toBe(1700);
    expect(tokenWaitMs(NOW, NOW + 60_000)).toBe(0);
  });
});
