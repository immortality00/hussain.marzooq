import clientPromise from "@/lib/mongodb";

const DEFAULT_DB_NAME = "hm_visuals";

export function getDbName() {
  const configured = (process.env.MONGODB_DB_NAME ?? "").trim();
  return configured || DEFAULT_DB_NAME;
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(getDbName());
}