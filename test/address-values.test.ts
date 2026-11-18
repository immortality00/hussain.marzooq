import { describe, expect, it } from "vitest";
import {
  ADDRESS_WRITE_GAP_MS,
  addressValuesKey,
  addressWriteDelay,
  readAddressValues,
  withAddressValues,
} from "@/lib/address-values";
import { adminScreenAddress } from "@/lib/admin-screen-address";

describe("address values", () => {
  it("reads the keys it is given, missing ones as empty", () => {
    const params = new URLSearchParams("q=Seed+Photo+3&category=photography&other=1");
    expect(readAddressValues(params, ["q", "category", "type"])).toEqual({
      q: "Seed Photo 3",
      category: "photography",
      type: "",
    });
  });

  it("sets values, drops empty ones and leaves every other parameter as it was", () => {
    expect(withAddressValues("?edit=abc&q=old", { q: "new words", category: "" })).toBe("?edit=abc&q=new+words");
    expect(withAddressValues("?q=old", { q: "" })).toBe("");
    expect(withAddressValues("", { status: "pending" })).toBe("?status=pending");
  });

  it("keeps words exactly as typed, spaces included", () => {
    const search = withAddressValues("", { q: "seed  photo " });
    expect(new URLSearchParams(search).get("q")).toBe("seed  photo ");
  });

  it("compares values whatever order their keys were made in", () => {
    expect(addressValuesKey({ q: "a", category: "b" })).toBe(addressValuesKey({ category: "b", q: "a" }));
    expect(addressValuesKey({ q: "a" })).not.toBe(addressValuesKey({ q: "b" }));
  });

  it("writes at least a second apart", () => {
    expect(addressWriteDelay(null, 5000)).toBe(0);
    expect(addressWriteDelay(5000, 5300)).toBe(ADDRESS_WRITE_GAP_MS - 300);
    expect(addressWriteDelay(5000, 9000)).toBe(0);
  });
});

describe("adminScreenAddress", () => {
  it("leaves out the parameters a screen keeps its filters in, so they don't open it afresh", () => {
    const params = new URLSearchParams("q=x&category=photography&create=Sara");
    expect(adminScreenAddress("/admin/people", params, ["q"])).toBe("/admin/people?category=photography&create=Sara");
    expect(adminScreenAddress("/admin/media/list", new URLSearchParams("q=x"), ["q"])).toBe("/admin/media/list?");
  });

  it("keeps every parameter when the screen lists none", () => {
    expect(adminScreenAddress("/admin/media", new URLSearchParams("edit=a"))).toBe("/admin/media?edit=a");
  });
});
