import type { MediaItem } from "./types";
import { validateEmbed } from "./utils";

export async function fetchMediaItem(id: string): Promise<MediaItem> {
  const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; item?: MediaItem; error?: string };

  if (!res.ok || !data?.ok || !data.item) {
    throw new Error(data?.error ?? "Failed to load media.");
  }

  return data.item;
}

export function buildMediaPayload(args: {
  editingId: string;
  mode: "upload" | "embed";
  title: string;
  description: string;
  location: string;
  event: string;
  year: string;
  tags: string[];
  categories: string[];
  people: string[];
  isPublic: boolean;
  appearances: unknown[];
  embedUrl: string;
  uploaded: { secureUrl: string; publicId: string; resourceType: string } | null;
  nftPrice: string;
  nftCurrency: string;
  nftEditionType: string;
  nftEditionsTotal: string;
  nftEditionsRemaining: string;
  nftOpenUntil: string;
  nftStatus: string;
  nftMarketplaceUrl: string;
}) {
  if (args.categories.length === 0) {
    throw new Error("Choose a category first.");
  }

  const isNft = args.categories.includes("nft");

  if (isNft && args.mode === "embed") {
    throw new Error("NFT items must use an uploaded image or video.");
  }

  const yearNum = args.year.trim() ? Number(args.year.trim()) : null;
  const yearValue = yearNum !== null && Number.isFinite(yearNum) ? yearNum : null;

  const payloadBase: Record<string, unknown> = {
    title: args.title.trim(),
    description: args.description.trim() || null,
    location: args.location.trim() || null,
    event: args.event.trim() || null,
    year: yearValue,
    tags: args.tags,
    categories: args.categories,
    people: args.people,
    isPublic: args.isPublic,
    appearances: args.appearances,
    nft: isNft
      ? {
          price: args.nftPrice.trim() === "" ? null : Number(args.nftPrice),
          currency: args.nftCurrency,
          editionType: args.nftEditionType,
          editionsTotal: args.nftEditionsTotal.trim() === "" ? null : Number(args.nftEditionsTotal),
          editionsRemaining:
            args.nftEditionsRemaining.trim() === "" ? null : Number(args.nftEditionsRemaining),
          openUntil: args.nftOpenUntil.trim() || null,
          status: args.nftStatus,
          marketplaceUrl: args.nftMarketplaceUrl.trim() || null,
        }
      : null,
  };

  let payloadWithAsset: Record<string, unknown> | null = null;

  if (args.mode === "embed") {
    if (!validateEmbed(args.embedUrl)) {
      throw new Error("Please paste a valid YouTube/Vimeo URL (https://...).");
    }
    payloadWithAsset = { ...payloadBase, type: "embed", embedUrl: args.embedUrl.trim() };
  } else {
    if (args.uploaded) {
      payloadWithAsset = {
        ...payloadBase,
        type: args.uploaded.resourceType === "video" ? "video" : "image",
        secureUrl: args.uploaded.secureUrl,
        publicId: args.uploaded.publicId,
        resourceType: args.uploaded.resourceType,
      };
    } else if (!args.editingId) {
      throw new Error("Upload a file first.");
    }
  }

  return { payloadBase, payloadWithAsset };
}

export async function saveMediaItem(args: {
  editingId: string;
  payloadBase: Record<string, unknown>;
  payloadWithAsset: Record<string, unknown> | null;
}) {
  if (!args.editingId) {
    const res = await fetch("/api/media/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args.payloadWithAsset),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; id?: string; error?: string };
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error ?? "Save failed.");
    }
    return { mode: "created" as const, id: data.id ?? null };
  }

  const updateBody = args.payloadWithAsset ?? args.payloadBase;

  const res = await fetch(`/api/media/${encodeURIComponent(args.editingId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateBody),
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error ?? "Update failed.");
  }

  return { mode: "updated" as const, id: args.editingId };
}

export async function deleteMediaItem(id: string) {
  const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error ?? "Delete failed.");
  }
}