import Link from "next/link";
import Image from "next/image";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MediaDoc = {
  _id: string;
  type: "image" | "video" | "embed";
  title: string;
  location: string | null;
  event: string | null;
  year: number | null;
  tags: string[];
  asset: {
    secureUrl?: string;
    publicId?: string;
    resourceType?: string;
    bytes?: number | null;
    embedUrl?: string;
  };
  createdAt?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function getString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function getNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function getStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x : String(x)))
    .filter((x) => x.trim().length > 0);
}

export default async function AdminMediaListPage() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("media")
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const items: MediaDoc[] = docs.map((d) => {
    const assetRaw = isRecord(d.asset) ? d.asset : {};

    // Our create endpoint currently stores Cloudinary under asset.secureUrl
    const secureUrl = getString(assetRaw.secureUrl);

    // If for some reason it was stored as secure_url earlier, support that too
    const fallbackSecureUrl = isRecord(assetRaw) ? getString(assetRaw.secure_url) : undefined;

    return {
      _id: String(d._id),
      type: d.type === "video" || d.type === "embed" || d.type === "image" ? d.type : "image",
      title: String(d.title ?? ""),
      location: d.location ? String(d.location) : null,
      event: d.event ? String(d.event) : null,
      year: typeof d.year === "number" ? d.year : null,
      tags: getStringArray(d.tags),
      asset: {
        secureUrl: secureUrl ?? fallbackSecureUrl,
        publicId: getString(assetRaw.publicId),
        resourceType: getString(assetRaw.resourceType),
        bytes: getNumber(assetRaw.bytes) ?? null,
        embedUrl: getString(assetRaw.embedUrl),
      },
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : undefined,
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media • Saved</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Latest 50 media items saved in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/media"
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            Upload new
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            No media saved yet.
          </div>
        ) : (
          items.map((m) => {
            const url = m.asset.secureUrl ?? "";
            const canPreviewImage = m.type === "image" && url.length > 0;
            const canPreviewVideo = m.type === "video" && url.length > 0;

            return (
              <div key={m._id} className="rounded-2xl border p-5">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  {/* Preview */}
                  <div className="overflow-hidden rounded-2xl border bg-muted">
                    {canPreviewImage ? (
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={url}
                          alt={m.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 220px"
                          priority={false}
                        />
                      </div>
                    ) : canPreviewVideo ? (
                      <video
                        className="h-full w-full"
                        controls
                        preload="metadata"
                        src={url}
                      />
                    ) : (
                      <div className="flex h-[165px] items-center justify-center text-xs text-muted-foreground">
                        No preview
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{m.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="rounded-full border px-2 py-0.5 text-xs">{m.type}</span>
                      {m.year ? <span className="ml-2">• {m.year}</span> : null}
                      {m.location ? <span className="ml-2">• {m.location}</span> : null}
                      {m.event ? <span className="ml-2">• {m.event}</span> : null}
                    </div>

                    {m.tags.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.tags.slice(0, 12).map((t) => (
                          <span
                            key={`${m._id}-${t}`}
                            className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 text-sm">
                      {m.type === "embed" && m.asset.embedUrl ? (
                        <a className="underline" href={m.asset.embedUrl} target="_blank" rel="noreferrer">
                          Open embed URL
                        </a>
                      ) : url ? (
                        <a className="underline" href={url} target="_blank" rel="noreferrer">
                          Open Cloudinary file
                        </a>
                      ) : (
                        <span className="text-muted-foreground">No asset URL</span>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      ID: <span className="font-mono">{m._id}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}