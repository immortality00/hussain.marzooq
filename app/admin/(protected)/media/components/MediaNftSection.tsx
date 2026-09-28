"use client";

import type { CryptoCurrency, NftEditionType, NftStatus } from "../lib/types";
import { adminFieldShellClasses, adminInputClasses } from "@/components/admin/admin-input";

const currencies: Array<{ value: CryptoCurrency; label: string; symbol: string }> = [
  { value: "ETH", label: "ETH", symbol: "Ξ" },
  { value: "SOL", label: "SOL", symbol: "◎" },
  { value: "XTZ", label: "XTZ", symbol: "ꜩ" },
  { value: "BTC", label: "BTC", symbol: "₿" },
];

export default function MediaNftSection({
  nftPrice,
  setNftPrice,
  nftCurrency,
  setNftCurrency,
  nftEditionType,
  setNftEditionType,
  nftEditionsTotal,
  setNftEditionsTotal,
  nftEditionsRemaining,
  setNftEditionsRemaining,
  nftOpenUntil,
  setNftOpenUntil,
  nftStatus,
  setNftStatus,
  nftMarketplaceUrl,
  setNftMarketplaceUrl,
}: {
  nftPrice: string;
  setNftPrice: (value: string) => void;
  nftCurrency: CryptoCurrency;
  setNftCurrency: (value: CryptoCurrency) => void;
  nftEditionType: NftEditionType;
  setNftEditionType: (value: NftEditionType) => void;
  nftEditionsTotal: string;
  setNftEditionsTotal: (value: string) => void;
  nftEditionsRemaining: string;
  setNftEditionsRemaining: (value: string) => void;
  nftOpenUntil: string;
  setNftOpenUntil: (value: string) => void;
  nftStatus: NftStatus;
  setNftStatus: (value: NftStatus) => void;
  nftMarketplaceUrl: string;
  setNftMarketplaceUrl: (value: string) => void;
}) {
  const isSold = nftStatus === "sold";
  const isUnique = nftEditionType === "1/1";
  const isOpen = nftEditionType === "open";

  return (
    <section className="rounded-3xl border p-5">
      <div>
        <div className="text-sm font-medium">NFT details</div>
        <div className="mt-1 text-xs text-muted-foreground">
          These fields are required because the primary category is NFT.
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Price</span>
          <div className={adminFieldShellClasses("flex overflow-hidden")}>
            <input
              value={nftPrice}
              onChange={(e) => setNftPrice(e.target.value)}
              inputMode="decimal"
              className="w-full bg-transparent px-3 py-2 outline-none"
              placeholder="0.35"
            />
            <div className="flex items-center border-l px-3 text-sm text-muted-foreground">
              {currencies.find((c) => c.value === nftCurrency)?.symbol ?? "Ξ"}
            </div>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Currency</span>
          <select
            value={nftCurrency}
            onChange={(e) => setNftCurrency((e.target.value as CryptoCurrency) || "ETH")}
            className={adminInputClasses()}
          >
            {currencies.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} — {item.symbol}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Edition type</span>
          <select
            value={nftEditionType}
            onChange={(e) => setNftEditionType((e.target.value as NftEditionType) || "1/1")}
            className={adminInputClasses()}
          >
            <option value="1/1">Unique edition</option>
            <option value="limited">Limited edition</option>
            <option value="open">Open edition</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            value={nftStatus}
            onChange={(e) => setNftStatus((e.target.value as NftStatus) || "available")}
            className={adminInputClasses()}
          >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="coming-soon">Coming soon</option>
          </select>
        </label>

        {!isOpen ? (
          <>
            <label className="space-y-2">
              <span className="text-sm font-medium">Total editions</span>
              <input
                value={nftEditionsTotal}
                onChange={(e) => setNftEditionsTotal(e.target.value)}
                inputMode="numeric"
                disabled={isUnique}
                className={adminInputClasses()}
                placeholder="1"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">Remaining editions</span>
              <input
                value={nftEditionsRemaining}
                onChange={(e) => setNftEditionsRemaining(e.target.value)}
                inputMode="numeric"
                disabled={isSold || isUnique}
                className={adminInputClasses()}
                placeholder="1"
              />
            </label>
          </>
        ) : (
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Available until</span>
            <input
              type="datetime-local"
              value={nftOpenUntil}
              onChange={(e) => setNftOpenUntil(e.target.value)}
              className={adminInputClasses()}
            />
          </label>
        )}

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Marketplace URL</span>
          <input
            value={nftMarketplaceUrl}
            onChange={(e) => setNftMarketplaceUrl(e.target.value)}
            className={adminInputClasses()}
            placeholder="https://exchange.art/... or other marketplace URL"
          />
        </label>
      </div>
    </section>
  );
}