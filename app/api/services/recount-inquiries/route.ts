import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { AnyBulkWriteOperation, Document } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { isValidObjectIdString, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

export async function POST() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  try {
    const client = await clientPromise;
    const db = client.db("hm_visuals");

    const servicesCol = db.collection("services");
    const inquiriesCol = db.collection("inquiries");

    const now = new Date();

    await servicesCol.updateMany({}, { $set: { inquiriesCount: 0, updatedAt: now } });

    const rows = await inquiriesCol
      .aggregate([
        {
          $match: {
            serviceId: { $type: "string", $ne: "" },
            isArchived: { $ne: true },
          },
        },
        {
          $group: {
            _id: "$serviceId",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const ops: AnyBulkWriteOperation<Document>[] = [];

    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      const obj = r as Record<string, unknown>;

      const serviceId = typeof obj._id === "string" ? obj._id : "";
      const count = typeof obj.count === "number" ? obj.count : 0;

      if (!serviceId || !isValidObjectIdString(serviceId)) continue;

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

    return noStoreJson({
      ok: true,
      groupedInquiryServices: rows.length,
      syncedServices: ops.length,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return noStoreJson({ ok: false, error: message }, { status: 500 });
  }
}