import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { AnyBulkWriteOperation, Document } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function looksLikeObjectId(s: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(s.trim());
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  try {
    const client = await clientPromise;
    const db = client.db("hm_visuals");

    const servicesCol = db.collection("services");
    const inquiriesCol = db.collection("inquiries");

    // Reset all to 0 first
    await servicesCol.updateMany({}, { $set: { inquiriesCount: 0, updatedAt: new Date() } });

    const rows = await inquiriesCol
      .aggregate([
        { $match: { serviceId: { $type: "string", $ne: "" } } },
        { $group: { _id: "$serviceId", count: { $sum: 1 } } },
      ])
      .toArray();

    const ops: AnyBulkWriteOperation<Document>[] = [];
    const now = new Date();

    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      const obj = r as Record<string, unknown>;

      const serviceId = typeof obj._id === "string" ? obj._id : "";
      const count = typeof obj.count === "number" ? obj.count : 0;

      if (!serviceId || !looksLikeObjectId(serviceId)) continue;

      ops.push({
        updateOne: {
          filter: { _id: new ObjectId(serviceId) },
          update: { $set: { inquiriesCount: count, updatedAt: now } },
        },
      });
    }

    if (ops.length > 0) {
      await servicesCol.bulkWrite(ops, { ordered: false });
    }

    return noStoreJson({ ok: true, updated: ops.length });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return noStoreJson({ ok: false, error: message }, { status: 500 });
  }
}