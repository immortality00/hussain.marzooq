import Link from "next/link";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminNftsPage() {
  const db = await getDb();

  const docs = await db
    .collection("media")
    .find({ categories: "nft" }, { projection: { nft: 1, isPublic: 1 } })
    .toArray();

  const total = docs.length;
  const published = docs.filter((doc) => doc.isPublic === true).length;
  const sold = docs.filter(
    (doc) => doc.nft && typeof doc.nft === "object" && doc.nft.status === "sold"
  ).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">NFTs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            NFT items are managed through the unified media system. Use the category-first media
            editor and filter the media list by NFT.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/media?category=nft"
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            Create NFT item
          </Link>
          <Link
            href="/admin/media/list?category=nft"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
          >
            View NFT media
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] border p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Total items
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight">{total}</div>
        </div>

        <div className="rounded-[2rem] border p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Published
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight">{published}</div>
        </div>

        <div className="rounded-[2rem] border p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Sold
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight">{sold}</div>
        </div>
      </section>
    </main>
  );
}