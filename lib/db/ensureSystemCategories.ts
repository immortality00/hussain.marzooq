import type { Db } from "mongodb";

/**
 * Ensures required system categories exist.
 * Currently: Others (slug: "others")
 * Also migrates legacy category "general" -> "others"
 */
export async function ensureOthersCategory(db: Db) {
  const now = new Date();

  // 1) Ensure "others" exists
  const exists = await db.collection("service_categories").findOne(
    { slug: "others" },
    { projection: { _id: 1 } }
  );

  if (!exists) {
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

    await db.collection("service_categories").insertOne({
      name: "Others",
      slug: "others",
      isActive: true,
      order: minOrder - 1,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    });
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
}