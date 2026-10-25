import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NftPrice } from "@/components/nft/NftPrice";
import { buildInquiryContext } from "@/components/nft/lib";
import type { PublicNftItem } from "@/lib/server/public-nfts";

type Currency = PublicNftItem["nft"]["currency"];

const CURRENCIES: Currency[] = ["ETH", "SOL", "XTZ", "BTC"];
const TYPED_SIGNS = /[Ξ◎ꜩ₿]/;

function nft(currency: Currency, price: number | null = 4): PublicNftItem {
  return {
    id: "n1",
    title: "Seed Collectible",
    description: null,
    location: null,
    event: null,
    year: null,
    tags: [],
    people: [],
    categories: ["nft"],
    appearances: [],
    mediaUrl: null,
    mediaType: "image",
    nft: {
      price,
      currency,
      editionType: "1/1",
      editionsTotal: null,
      editionsRemaining: null,
      openUntil: null,
      status: "available",
      marketplaceUrl: null,
    },
  };
}

describe("NftPrice", () => {
  it.each(CURRENCIES)("draws the %s mark after the number, named by its code", (currency) => {
    const html = renderToStaticMarkup(createElement(NftPrice, { item: nft(currency) }));

    expect(html).toMatch(new RegExp(`^<span[^>]*>4 <svg[^>]*role="img"[^>]*aria-label="${currency}"`));
    expect(html).toMatch(/<path d="M[^"]+"/);
    expect(html).not.toMatch(TYPED_SIGNS);
  });

  it("says Price on request when there is no price", () => {
    expect(renderToStaticMarkup(createElement(NftPrice, { item: nft("XTZ", null) }))).toBe("Price on request");
  });
});

describe("buildInquiryContext", () => {
  it("writes the price with the currency's code", () => {
    const text = buildInquiryContext(nft("XTZ", 12.5));

    expect(text).toContain("Price: 12.5 XTZ");
    expect(text).not.toMatch(TYPED_SIGNS);
  });

  it("writes Price on request when there is no price", () => {
    expect(buildInquiryContext(nft("ETH", null))).toContain("Price: Price on request");
  });
});
