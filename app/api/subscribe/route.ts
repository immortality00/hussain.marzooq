import { createHash } from "node:crypto";
import { asNullableString, noStoreJson } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { getClientAddress, isValidEmail } from "@/app/api/_lib/public-form-security";
import { withRouteErrors } from "@/app/api/_lib/route-errors";
import { confirmationEmail, confirmationLink } from "@/lib/server/blog-emails";
import { createSignup, deleteSignup } from "@/lib/server/blog-signups";
import { subscriptionsReady } from "@/lib/server/blog-subscribers";
import { replyToAddress, sendVisitorEmail } from "@/lib/server/email";
import { formTokenRefusal } from "@/lib/server/form-token";
import { getBlogActive } from "@/lib/server/page-settings";
import {
  claimDuplicateWindow,
  consumeFixedWindowRateLimit,
  releaseDuplicateWindow,
} from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

const IP_LIMIT = 5;
const IP_WINDOW_MS = 10 * 60_000;
const DAY_MS = 24 * 60 * 60_000;
/** Confirmation emails share Resend's 100-a-day limit with the admin alerts; this leaves 70 for the alerts. */
export const DAILY_CONFIRMATION_LIMIT = 30;

const CHECK_INBOX = { ok: true, message: "Check your inbox to confirm." };

function refuse(error: string, status: number) {
  return noStoreJson({ ok: false, error }, { status });
}

async function handlePost(req: Request) {
  const body = await readJsonObject(req, 4 * 1024);
  if (!body) return refuse("Email is required.", 400);
  if ((asNullableString(body.website) ?? "").trim()) return noStoreJson(CHECK_INBOX);

  const email = (asNullableString(body.email) ?? "").trim().toLowerCase();
  if (!email) return refuse("Email is required.", 400);
  if (email.length > 254 || !isValidEmail(email) || !replyToAddress(email)) {
    return refuse("Email format is invalid.", 400);
  }

  if (!subscriptionsReady()) return refuse("Subscriptions are not available right now.", 503);
  if (!(await getBlogActive())) return refuse("The blog is not available.", 404);

  const tokenRefusal = formTokenRefusal(body.formToken, "subscribe");
  if (tokenRefusal) return refuse(tokenRefusal, 400);

  const perIp = await consumeFixedWindowRateLimit({
    bucket: "blog-subscribe",
    key: getClientAddress(req),
    limit: IP_LIMIT,
    windowMs: IP_WINDOW_MS,
  });
  if (perIp.limited) return refuse("Too many requests. Try again later.", 429);

  const address = { bucket: "blog-subscribe-address", key: createHash("sha256").update(email).digest("hex") };
  const claim = await claimDuplicateWindow({ ...address, windowMs: DAY_MS });
  if (claim.duplicated) return noStoreJson(CHECK_INBOX);

  const today = await consumeFixedWindowRateLimit({
    bucket: "blog-subscribe-site",
    key: new Date().toISOString().slice(0, 10),
    limit: DAILY_CONFIRMATION_LIMIT,
    windowMs: DAY_MS,
  });
  if (today.limited) {
    await releaseDuplicateWindow(address);
    return refuse("Too many sign-ups today. Try again tomorrow.", 429);
  }

  const token = await createSignup(email);
  try {
    await sendVisitorEmail("press", email, confirmationEmail(confirmationLink(token)));
  } catch (error) {
    console.error("[blog-subscribe] confirmation email failed", error);
    await deleteSignup(token);
    await releaseDuplicateWindow(address);
    return refuse("The confirmation email could not be sent. Try again shortly.", 502);
  }

  return noStoreJson(CHECK_INBOX);
}

export const POST = withRouteErrors(handlePost);
