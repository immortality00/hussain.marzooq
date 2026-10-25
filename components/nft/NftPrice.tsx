import type { PublicNftItem } from "@/lib/server/public-nfts";
import { CurrencyMark } from "./CurrencyMark";

// The price on the card and in the window: the number, then its currency's mark.
export function NftPrice({ item }: { item: PublicNftItem }) {
  if (item.nft.price === null) return <>Price on request</>;
  return (
    <span className="whitespace-nowrap">
      {item.nft.price} <CurrencyMark currency={item.nft.currency} />
    </span>
  );
}
