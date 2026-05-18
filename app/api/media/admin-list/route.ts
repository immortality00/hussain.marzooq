import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 120), 1), 300);

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("media")
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    categories: normalizeStringArray(doc.categories),
    tags: normalizeStringArray(doc.tags),
    location: typeof doc.location === "string" ? doc.location : null,
    people: normalizeStringArray(doc.people),
    event: typeof doc.event === "string" ? doc.event : null,
  }));

  return noStoreJson({ ok: true, items });
}