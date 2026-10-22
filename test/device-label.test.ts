import { describe, expect, it } from "vitest";
import { deviceLabelOf } from "@/lib/device-label";

describe("deviceLabelOf", () => {
  it("names the system and browser from a user agent", () => {
    expect(deviceLabelOf("Mozilla/5.0 (iPhone; CPU iPhone OS 27_2 like Mac OS X) AppleWebKit/605.1.15 Version/27.2 Mobile/15E148 Safari/604.1")).toBe("iPhone · Safari");
    expect(deviceLabelOf("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36 Edg/141.0")).toBe("Windows · Edge");
    expect(deviceLabelOf("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/27.2 Safari/605.1.15")).toBe("Mac · Safari");
    expect(deviceLabelOf("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15", 5)).toBe("iPad · Safari");
    expect(deviceLabelOf("Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0")).toBe("Linux · Firefox");
    expect(deviceLabelOf("Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/141.0 Mobile Safari/537.36")).toBe("Android · Chrome");
  });

  it("never fails on a missing or odd value", () => {
    expect(deviceLabelOf(null)).toBe("Device · Browser");
    expect(deviceLabelOf("x".repeat(10_000))).toBe("Device · Browser");
  });
});
