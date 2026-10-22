import { MongoClient } from "mongodb";
import { ensureIndexes } from "./db-indexes";

// Relative imports only: bundled into netlify/functions/deploy-succeeded.mts.

const NOT_PRODUCTION = new Set(["deploy-preview", "branch-deploy", "dev"]);

/** Previews and branch deploys have no database; anything else, including an unknown context, is production. */
export function isProductionDeploy(payload: unknown) {
  const context = (payload as { context?: unknown } | null)?.context;
  return !(typeof context === "string" && NOT_PRODUCTION.has(context));
}

/** Runs after every successful deploy: creates any index the code needs, with the live site's own login. */
export async function ensureIndexesAfterDeploy(body: unknown) {
  const payload = (body as { payload?: unknown } | null)?.payload ?? null;
  const context = (payload as { context?: unknown } | null)?.context;
  if (!isProductionDeploy(payload)) {
    console.info(`[db-indexes] skipped: ${String(context)} deploy`);
    return;
  }

  const client = new MongoClient(process.env.MONGODB_URI ?? "", { serverSelectionTimeoutMS: 5_000 });
  try {
    await client.connect();
    const { total, recreated } = await ensureIndexes(client.db(process.env.MONGODB_DB_NAME || "hm_visuals"));
    const rebuilt = recreated.length ? `, recreated ${recreated.join(", ")}` : "";
    console.info(`[db-indexes] ${total} indexes in place${rebuilt}`);
  } catch (error) {
    console.error("[db-indexes] failed", error);
  } finally {
    await client.close();
  }
}
