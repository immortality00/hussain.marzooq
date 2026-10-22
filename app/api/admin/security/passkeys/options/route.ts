import { generateRegistrationOptions } from "@simplewebauthn/server";
import { requireAdminOr401, verifyAdminPassword } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { passkeyUserId, saveRegistrationChallenge } from "@/lib/server/admin-security";
import { PASSKEY_TIMEOUT_MS, credentialDescriptors, relyingParty } from "@/lib/server/passkeys";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";

export const dynamic = "force-dynamic";

/** Adding a passkey asks for the password again, so a copied session cookie cannot add its own. */
export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const limit = await consumeFixedWindowRateLimit({
    bucket: "admin-step-up",
    key: getClientAddress(req.headers),
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limit.limited) return noStoreJson({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });

  const body = await readJsonObject(req, 2048);
  const password = typeof body?.password === "string" ? body.password.trim() : "";
  if (!password || !verifyAdminPassword(password)) {
    return noStoreJson({ ok: false, error: "Wrong password." }, { status: 401 });
  }

  const { rpID, rpName } = relyingParty();
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: "Admin",
    userDisplayName: rpName,
    userID: new Uint8Array(Buffer.from(await passkeyUserId(), "base64url")),
    attestationType: "none",
    excludeCredentials: await credentialDescriptors(),
    authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
    timeout: PASSKEY_TIMEOUT_MS,
  });
  await saveRegistrationChallenge(options.challenge);
  return noStoreJson({ ok: true, options });
}
