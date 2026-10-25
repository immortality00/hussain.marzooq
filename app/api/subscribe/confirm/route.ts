import { noStoreJson } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { findSignup, isSignupToken, markSignupConfirmed } from "@/lib/server/blog-signups";
import { addSubscriber, subscriptionsReady } from "@/lib/server/blog-subscribers";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const IP_LIMIT = 20;
const IP_WINDOW_MS = 15 * 60_000;

function refuse(error: string, status: number) {
  return noStoreJson({ ok: false, error }, { status });
}

async function handlePost(req: Request) {
  const token = (await readJsonObject(req, 1024))?.token;
  if (!isSignupToken(token)) return refuse("This link is not valid.", 400);

  const perIp = await consumeFixedWindowRateLimit({
    bucket: "blog-subscribe-confirm",
    key: getClientAddress(req),
    limit: IP_LIMIT,
    windowMs: IP_WINDOW_MS,
  });
  if (perIp.limited) return refuse("Too many requests. Try again later.", 429);
  if (!subscriptionsReady()) return refuse("Subscriptions are not available right now.", 503);

  const signup = await findSignup(token);
  if (!signup) return refuse("This link expired. Subscribe again from the blog.", 410);

  if (signup.confirmedAt) return noStoreJson({ ok: true });

  try {
    await addSubscriber(signup.email);
  } catch (error) {
    console.error("[blog-subscribe] could not add the subscriber", error);
    return refuse("Not subscribed. Try again shortly.", 502);
  }

  await markSignupConfirmed(token);
  return noStoreJson({ ok: true });
}

export const POST = withRouteErrors(handlePost);
