"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicNftItem } from "@/lib/server/public-nfts";

const currencySymbol: Record<PublicNftItem["nft"]["currency"], string> = {
  ETH: "Ξ",
  SOL: "◎",
  XTZ: "ꜩ",
  BTC: "₿",
};

function formatStableDateTime(value: string | null) {
  if (!value) return null;

  const raw = value.trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hours, minutes] = match;
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;

  const year = String(d.getFullYear());
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

function hasOpenEditionEndedByDate(item: PublicNftItem) {
  if (item.nft.editionType !== "open" || !item.nft.openUntil) return false;
  const end = new Date(item.nft.openUntil).getTime();
  return !Number.isNaN(end) && end <= Date.now();
}

function displayStatus(item: PublicNftItem) {
  if (item.nft.status === "sold") return "sold";
  return item.nft.status;
}

function statusClasses(status: ReturnType<typeof displayStatus>) {
  if (status === "sold") {
    return "bg-rose-600 text-white shadow-[0_8px_24px_rgba(0,0,0,0.32)]";
  }
  if (status === "coming-soon") {
    return "border border-black/40 bg-black/84 text-amber-200 shadow-[0_8px_24px_rgba(0,0,0,0.32)]";
  }
  return "border border-black/40 bg-black/84 text-emerald-200 shadow-[0_8px_24px_rgba(0,0,0,0.32)]";
}

function editionLabel(item: PublicNftItem) {
  if (item.nft.editionType === "1/1") return "Unique edition";
  if (item.nft.editionType === "limited") return "Limited edition";
  return "Open edition";
}

function editionSubline(item: PublicNftItem) {
  if (item.nft.editionType === "1/1") return "1/1 left";

  if (item.nft.editionType === "limited") {
    const remaining = item.nft.editionsRemaining ?? 0;
    const total = item.nft.editionsTotal ?? 0;
    return `${remaining}/${total} left`;
  }

  if (item.nft.status === "sold") {
    return "Unavailable, open edition ended";
  }

  if (hasOpenEditionEndedByDate(item)) {
    return "Unavailable, open edition ended";
  }

  const formatted = formatStableDateTime(item.nft.openUntil);
  if (formatted) {
    return `Available until ${formatted}`;
  }

  return "Unavailable, open edition ended";
}

function buildInquiryContext(item: PublicNftItem) {
  const priceText =
    item.nft.price !== null ? `${item.nft.price} ${currencySymbol[item.nft.currency]} (${item.nft.currency})` : "Price on request";

  const editionText =
    item.nft.editionType === "open"
      ? editionSubline(item)
      : item.nft.editionType === "1/1"
        ? "Unique edition • 1/1 left"
        : `Limited edition • ${item.nft.editionsRemaining}/${item.nft.editionsTotal} left`;

  return [
    "NFT inquiry",
    `Item: ${item.title}`,
    `Price: ${priceText}`,
    `Edition: ${editionText}`,
    `Status: ${displayStatus(item)}`,
    `Reference: /nft#nft-${item.id}`,
  ].join("\n");
}

function NftModal({
  item,
  onClose,
}: {
  item: PublicNftItem;
  onClose: () => void;
}) {
  const priceText =
    item.nft.price !== null ? `${item.nft.price} ${currencySymbol[item.nft.currency]}` : "Price on request";

  const inquiryHref = `/contact?service=${encodeURIComponent("NFT Inquiry")}&category=${encodeURIComponent(
    "nft"
  )}&context=${encodeURIComponent(buildInquiryContext(item))}`;

  const shownStatus = displayStatus(item);

  return (
    <div className="fixed inset-0 z-50 bg-black/72 p-4" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{item.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{editionLabel(item)}</div>
          </div>

          <button
            className="rounded-xl border px-3 py-2 text-sm hover:bg-accent"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid h-[82vh] min-h-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-h-0 bg-black/5 p-4">
            <div className="h-full w-full overflow-hidden rounded-[1.5rem] border bg-black">
              {item.mediaUrl ? (
                item.mediaType === "video" ? (
                  <video
                    className="h-full w-full object-contain"
                    controls
                    preload="metadata"
                    playsInline
                    src={item.mediaUrl}
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={item.mediaUrl}
                      alt={item.title}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                    />
                  </div>
                )
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/70">
                  No media
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs ${statusClasses(shownStatus)}`}>
                      {shownStatus}
                    </span>
                    <span className="inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
                      {item.nft.currency}
                    </span>
                    {item.year ? (
                      <span className="inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        {item.year}
                      </span>
                    ) : null}
                  </div>

                  {item.description ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Description
                      </div>
                      <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Price
                      </div>
                      <div className="mt-3 text-lg font-semibold">{priceText}</div>
                    </div>

                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Edition
                      </div>
                      <div className="mt-3 text-lg font-semibold">{editionLabel(item)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{editionSubline(item)}</div>
                    </div>
                  </div>

                  {(item.location || item.event || item.year || item.people.length || item.categories.length) ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Media details
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {item.location ? <div>Location: {item.location}</div> : null}
                        {item.event ? <div>Event: {item.event}</div> : null}
                        {item.year ? <div>Year: {item.year}</div> : null}
                        {item.people.length ? <div>People: {item.people.join(", ")}</div> : null}
                        {item.categories.length ? <div>Categories: {item.categories.join(", ")}</div> : null}
                      </div>
                    </div>
                  ) : null}

                  {item.tags.length ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Tags
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={`${item.id}-${tag}`}
                            className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.appearances.length ? (
                    <div className="rounded-2xl border bg-background/50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Appearances
                      </div>
                      <div className="mt-3 space-y-3">
                        {item.appearances.map((appearance, index) => (
                          <div key={`${item.id}-appearance-${index}`} className="rounded-xl border px-3 py-3 text-sm text-muted-foreground">
                            <div className="font-medium text-foreground">{appearance.title || appearance.venue}</div>
                            <div className="mt-1">
                              {[appearance.venue, appearance.city, appearance.country].filter(Boolean).join(" • ")}
                            </div>
                            <div className="mt-1">
                              {[appearance.dateFrom, appearance.dateTo].filter(Boolean).join(" → ")}
                            </div>
                            {appearance.notes ? <div className="mt-2 whitespace-pre-wrap">{appearance.notes}</div> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t bg-background p-4">
                {item.nft.marketplaceUrl && shownStatus !== "sold" ? (
                  <a
                    href={item.nft.marketplaceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                  >
                    Buy
                  </a>
                ) : (
                  <Link
                    href={inquiryHref}
                    className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                  >
                    Inquire
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NftCollection({ items }: { items: PublicNftItem[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "available" | "sold" | "coming-soon">("");
  const [active, setActive] = useState<PublicNftItem | null>(null);

  useEffect(() => {
    if (active) window.dispatchEvent(new Event("hm_modal_open"));
    else window.dispatchEvent(new Event("hm_modal_close"));
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery = q
        ? `${item.title} ${item.description ?? ""} ${item.tags.join(" ")} ${item.people.join(" ")}`
            .toLowerCase()
            .includes(q)
        : true;

      const shownStatus = displayStatus(item);
      const matchesStatus = statusFilter ? shownStatus === statusFilter : true;

      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  return (
    <div className="mt-10 space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or tags..."
          className="w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-md"
        />

        <div className="flex flex-wrap gap-2">
          {[
            { value: "", label: "All" },
            { value: "available", label: "Available" },
            { value: "sold", label: "Sold" },
            { value: "coming-soon", label: "Coming soon" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setStatusFilter(item.value as "" | "available" | "sold" | "coming-soon")}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                statusFilter === item.value ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-[2rem] border p-8 text-sm text-muted-foreground">
          No NFT items match these filters.
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const priceText =
              item.nft.price !== null ? `${item.nft.price} ${currencySymbol[item.nft.currency]}` : "Price on request";
            const shownStatus = displayStatus(item);
            const inquiryHref = `/contact?service=${encodeURIComponent("NFT Inquiry")}&category=${encodeURIComponent(
              "nft"
            )}&context=${encodeURIComponent(buildInquiryContext(item))}`;

            return (
              <article
                key={item.id}
                id={`nft-${item.id}`}
                className="overflow-hidden rounded-[2rem] border bg-background/60"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActive(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActive(item);
                    }
                  }}
                  className="group cursor-pointer"
                >
                  <div className="relative h-80 overflow-hidden bg-muted">
                    {item.mediaUrl ? (
                      item.mediaType === "video" ? (
                        <video
                          className="h-full w-full object-contain bg-black"
                          preload="metadata"
                          src={item.mediaUrl}
                        />
                      ) : (
                        <Image
                          src={item.mediaUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      )
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-muted to-background" />
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/12 to-transparent" />

                    {shownStatus === "sold" ? (
                      <div className="pointer-events-none absolute -left-18 top-8 w-72 rotate-[-35deg] bg-rose-600 py-3 text-center text-base font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                        Sold
                      </div>
                    ) : (
                      <div className={`absolute left-4 top-4 inline-flex rounded-full px-3 py-1 text-xs ${statusClasses(shownStatus)}`}>
                        {shownStatus}
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="text-2xl font-semibold tracking-tight text-white">{item.title}</div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {item.description ? (
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  ) : null}

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        Price
                      </div>
                      <div className="mt-2 text-base font-semibold">{priceText}</div>
                    </div>

                    <div className="text-right">
                      <div className="mt-2 text-base font-semibold">{editionLabel(item)}</div>
                      <div className="mt-1 text-xs font-semibold text-muted-foreground">{editionSubline(item)}</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    {item.nft.marketplaceUrl && shownStatus !== "sold" ? (
                      <a
                        href={item.nft.marketplaceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                      >
                        Buy
                      </a>
                    ) : (
                      <Link
                        href={inquiryHref}
                        onClick={(e) => e.stopPropagation()}
                        className="flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                      >
                        Inquire
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {active ? <NftModal item={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}