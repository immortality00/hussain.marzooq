import { isRecord, noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { issueFormToken, isFormKind } from "@/lib/server/form-token";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const TOKEN_RATE_LIMIT_MAX = 30;
const TOKEN_RATE_LIMIT_WINDOW_MS = 10 * 60_000;

async function handlePost(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const form = isRecord(body) ? body.form : null;
  if (!isFormKind(form)) {
    return noStoreJson({ ok: false, error: "Unknown form." }, { status: 400 });
  }

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "form-token",
    key: getClientAddress(req),
    limit: TOKEN_RATE_LIMIT_MAX,
    windowMs: TOKEN_RATE_LIMIT_WINDOW_MS,
  });
  if (rateLimit.limited) {
    return noStoreJson({ ok: false, error: "Too many requests. Try again later." }, { status: 429 });
  }

  const token = issueFormToken(form);
  if (!token) {
    return noStoreJson({ ok: false, error: "Forms are not configured." }, { status: 503 });
  }

  return noStoreJson({ ok: true, token });
}

export const POST = withRouteErrors(handlePost);
