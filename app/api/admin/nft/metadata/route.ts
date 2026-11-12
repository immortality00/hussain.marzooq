import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson, parseObjectId } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { errorMessage } from "@/lib/error-message";
import { savedAdminMedia } from "@/lib/server/admin-media";
import { getDb } from "@/lib/server/db";
import { buildNftMetadata } from "@/lib/server/nft-metadata";
import { pinataReady } from "@/lib/server/pinata";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const refuse = (status: number, error: string) => noStoreJson({ ok: false, error }, { status });

async function handlePost(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  if (!pinataReady()) return refuse(503, "Pinata is not configured yet.");

  const body = await readJsonObject(req);
  const oid = parseObjectId(typeof body?.mediaId === "string" ? body.mediaId : "");
  if (!body || !oid) return refuse(400, "Send the artwork and its files.");

  const limit = await consumeFixedWindowRateLimit({ bucket: "nft-metadata", key: "admin", limit: 30, windowMs: 10 * 60_000 });
  if (limit.limited) return refuse(429, "Too many metadata builds. Try again in a few minutes.");

  const db = await getDb();
  const doc = await db.collection("media").findOne({ _id: oid });
  if (!doc) return refuse(404, "Artwork not found.");

  let result;
  try {
    result = await buildNftMetadata(db, doc, body);
  } catch (error) {
    if (!(error instanceof Error) || !/Pinata/.test(error.message)) throw error;
    return refuse(502, errorMessage(error, "Pinata did not answer."));
  }
  if (!result.ok) return refuse(result.status, result.error);

  const saved = await db.collection("media").findOne({ _id: oid });
  return noStoreJson({ ok: true, mint: result.mint, ...(saved ? await savedAdminMedia(db, saved) : {}) });
}

export const POST = withRouteErrors(handlePost);
