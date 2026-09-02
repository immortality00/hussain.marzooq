import { afterEach, describe, expect, test, vi } from "vitest";
import { getClientAddress } from "@/app/api/_lib/public-form-security";

function headersFrom(map: Record<string, string>) {
  return {
    get(name: string) {
      return map[name.toLowerCase()] ?? null;
    },
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getClientAddress", () => {
  test("prefers the Netlify trusted header in every environment", () => {
    vi.stubEnv("NODE_ENV", "production");
    const source = headersFrom({
      "x-nf-client-connection-ip": "203.0.113.7",
      "x-forwarded-for": "1.1.1.1",
      "x-real-ip": "2.2.2.2",
    });
    expect(getClientAddress(source)).toBe("203.0.113.7");
  });

  test("ignores spoofable headers in production and falls back to anonymous", () => {
    vi.stubEnv("NODE_ENV", "production");
    const source = headersFrom({
      "x-forwarded-for": "6.6.6.6",
      "x-real-ip": "7.7.7.7",
    });
    expect(getClientAddress(source)).toBe("anonymous");
  });

  test("outside production, honors x-forwarded-for first entry", () => {
    vi.stubEnv("NODE_ENV", "development");
    const source = headersFrom({
      "x-forwarded-for": " 9.9.9.9 , 8.8.8.8 ",
      "x-real-ip": "7.7.7.7",
    });
    expect(getClientAddress(source)).toBe("9.9.9.9");
  });

  test("outside production, falls back to x-real-ip then anonymous", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(getClientAddress(headersFrom({ "x-real-ip": "7.7.7.7" }))).toBe("7.7.7.7");
    expect(getClientAddress(headersFrom({}))).toBe("anonymous");
  });

  test("accepts a Request and reads from its headers", () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = new Request("https://x.test/api/x", {
      headers: { "x-nf-client-connection-ip": "198.51.100.4" },
    });
    expect(getClientAddress(req)).toBe("198.51.100.4");
  });
});
