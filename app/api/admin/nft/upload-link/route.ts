import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson, parseObjectId } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { errorMessage } from "@/lib/error-message";
import { isMintFileKind, MINT_FILE_RULES } from "@/lib/nft/mint-fields";
import { createUploadLink, pinataReady } from "@/lib/server/pinata";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const refuse = (status: number, error: string) => noStoreJson({ ok: false, error }, { status });

const FIXED_NAMES = { display: "display.jpg", thumbnail: "thumbnail.jpg" } as const;

function artifactName(value: unknown) {
  const name = typeof value === "string" ? value.replace(/[^A-Za-z0-9._-]/g, "-").replace(/^[.-]+/, "").slice(0, 100) : "";
  return name || "original";
}

async function handlePost(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  if (!pinataReady()) return refuse(503, "Pinata is not configured yet.");

  const body = await readJsonObject(req, 2 * 1024);
  const mediaId = typeof body?.mediaId === "string" ? body.mediaId : "";
  const kind = body?.kind;
  if (!body || !parseObjectId(mediaId) || !isMintFileKind(kind)) return refuse(400, "Send the artwork and the kind of file.");

  const limit = await consumeFixedWindowRateLimit({ bucket: "nft-upload-link", key: "admin", limit: 120, windowMs: 10 * 60_000 });
  if (limit.limited) return refuse(429, "Too many uploads. Try again in a few minutes.");

  try {
    const url = await createUploadLink({
      mediaId,
      kind,
      fileName: kind === "artifact" ? artifactName(body.fileName) : FIXED_NAMES[kind],
    });
    return noStoreJson({ ok: true, url, maxBytes: MINT_FILE_RULES[kind].maxBytes });
  } catch (error) {
    if (!(error instanceof Error) || !/Pinata/.test(error.message)) throw error;
    return refuse(502, errorMessage(error, "Pinata did not answer."));
  }
}

export const POST = withRouteErrors(handlePost);
