import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { AnyBulkWriteOperation, Document } from "mongodb";

export const dynamic = "force-dynamic";

function isAdminCookie(v: string | undefined): boolean {
  // ✅ accept the value your login sets
  return v === "ok" || v === "1" || v === "true";
}

function looksLikeObjectId(s: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(s.trim());
}

export async function POST() {
  const c = await cookies();
  const admin = isAdminCookie(c.get("hm_admin")?.value);

  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("hm_visuals");

    const servicesCol = db.collection("services");
    const inquiriesCol = db.collection("inquiries");

    await servicesCol.updateMany({}, { $set: { inquiriesCount: 0 } });

    const rows = await inquiriesCol
      .aggregate([
        { $match: { serviceId: { $type: "string", $ne: "" } } },
        { $group: { _id: "$serviceId", count: { $sum: 1 } } },
      ])
      .toArray();

    const ops: AnyBulkWriteOperation<Document>[] = [];

    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      const obj = r as Record<string, unknown>;

      const serviceId = typeof obj._id === "string" ? obj._id : "";
      const count = typeof obj.count === "number" ? obj.count : 0;

      if (!serviceId || !looksLikeObjectId(serviceId)) continue;

      ops.push({
        updateOne: {
          filter: { _id: new ObjectId(serviceId) },
          update: { $set: { inquiriesCount: count } },
        },
      });
    }

    if (ops.length > 0) {
      await servicesCol.bulkWrite(ops, { ordered: false });
    }

    const res = NextResponse.json({ ok: true, updated: ops.length });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}