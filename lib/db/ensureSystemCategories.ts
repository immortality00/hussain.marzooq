import type { Db, ObjectId } from "mongodb";

/**
 * Ensures required system categories exist.
 * Currently: Others (slug: "others")
 * Also migrates legacy category "general" -> "others"
 */
export async function ensureOthersCategory(db: Db): Promise<{ _id: ObjectId; slug: string }> {
  const now = new Date();

  // 1) Ensure "others" exists
  const exists = await db.collection("service_categories").findOne(
    { slug: "others" },
    { projection: { _id: 1, slug: 1 } }
  );

  let others = exists ? { _id: exists._id, slug: typeof exists.slug === "string" ? exists.slug : "others" } : null;

  if (!others) {
    // Put it first by default
    const min = await db
      .collection("service_categories")
      .find({})
      .sort({ order: 1 })
      .limit(1)
      .toArray();

    const minOrder =
      min.length && typeof min[0]?.order === "number" && Number.isFinite(min[0].order)
        ? (min[0].order as number)
        : 0;

    const inserted = await db.collection("service_categories").insertOne({
      name: "Others",
      slug: "others",
      isActive: true,
      order: minOrder - 1,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });
    others = { _id: inserted.insertedId, slug: "others" };
  }

  // 2) Migrate legacy "general" services to "others" — skip if none exist
  const hasLegacy = await db.collection("services").findOne(
    { category: "general" },
    { projection: { _id: 1 } }
  );
  if (hasLegacy) {
    await db.collection("services").updateMany(
      { category: "general" },
      { $set: { category: "others", updatedAt: now } }
    );
  }

  return others;
}
