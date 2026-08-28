import { ObjectId } from "mongodb";
import { getDb } from "@/lib/server/db";

export type RemovalRequestItem = {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  email: string | null;
  reason: string | null;
  requestedAt: string | null;
};

export type RemovalDecisionItem = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  reason: string | null;
  status: "approved" | "dismissed";
  requestedAt: string | null;
  decidedAt: string | null;
};

function toIso(value: unknown): string | null {
  return value instanceof Date ? value.toISOString() : null;
}

export async function getRemovalRequestQueue(): Promise<RemovalRequestItem[]> {
  const db = await getDb();

  const docs = await db
    .collection("removal_requests")
    .find({ status: "pending" })
    .sort({ createdAt: -1 })
    .toArray();

  const seen = new Set<string>();
  const rows: RemovalRequestItem[] = [];
  for (const doc of docs) {
    const personId = typeof doc.personId === "string" ? doc.personId : "";
    if (!personId || seen.has(personId)) continue;
    seen.add(personId);
    rows.push({
      id: personId,
      name: typeof doc.personName === "string" ? doc.personName : "",
      slug: typeof doc.slug === "string" ? doc.slug : "",
      avatarUrl: null,
      email: typeof doc.email === "string" ? doc.email : null,
      reason: typeof doc.reason === "string" ? doc.reason : null,
      requestedAt: toIso(doc.createdAt),
    });
  }

  const objectIds = rows.map((r) => r.id).filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (objectIds.length > 0) {
    const people = await db
      .collection("people_profiles")
      .find({ _id: { $in: objectIds } }, { projection: { avatarUrl: 1 } })
      .toArray();
    const avatarById = new Map(people.map((p) => [String(p._id), typeof p.avatarUrl === "string" ? p.avatarUrl : null]));
    for (const row of rows) row.avatarUrl = avatarById.get(row.id) ?? null;
  }

  return rows;
}

export async function getRemovalRequestHistory(limit = 100): Promise<RemovalDecisionItem[]> {
  const db = await getDb();

  const docs = await db
    .collection("removal_requests")
    .find({ status: { $in: ["approved", "dismissed"] } })
    .sort({ decidedAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: typeof doc.personName === "string" ? doc.personName : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    email: typeof doc.email === "string" ? doc.email : null,
    reason: typeof doc.reason === "string" ? doc.reason : null,
    status: doc.status === "approved" ? "approved" : "dismissed",
    requestedAt: toIso(doc.createdAt),
    decidedAt: toIso(doc.decidedAt),
  }));
}

export async function countPendingRemovalRequests(): Promise<number> {
  const db = await getDb();
  const ids = await db.collection("removal_requests").distinct("personId", { status: "pending" });
  return ids.length;
}
