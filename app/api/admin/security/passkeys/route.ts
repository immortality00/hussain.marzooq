import { NextResponse } from "next/server";
import { verifyRegistrationResponse, type RegistrationResponseJSON } from "@simplewebauthn/server";
import { requireAdminOr401, trustDevice } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { readJsonObject } from "@/app/api/_lib/json-body";
import { readSessionGeneration, takeRegistrationChallenge } from "@/lib/server/admin-security";
import { loadAdminSecurity } from "@/lib/server/admin-security-state";
import { relyingParty, savePasskey } from "@/lib/server/passkeys";

export const dynamic = "force-dynamic";

function refuse(error: string, status: number) {
  return noStoreJson({ ok: false, error }, { status });
}

/** Stores the new passkey; this device has just passed Face ID / Touch ID, so it is trusted too. */
export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const body = await readJsonObject(req);
  const response = body?.response;
  if (!response || typeof response !== "object") return refuse("The passkey could not be read.", 400);

  const challenge = await takeRegistrationChallenge();
  if (!challenge) return refuse("Adding the passkey took too long. Try again.", 400);

  const { rpID, origin } = relyingParty();
  const result = await verifyRegistrationResponse({
    response: response as RegistrationResponseJSON,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  }).catch(() => null);
  if (!result?.verified) return refuse("The passkey could not be checked.", 400);

  const { credential, credentialBackedUp } = result.registrationInfo;
  try {
    await savePasskey({
      credentialId: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports ?? [],
      name: typeof body?.name === "string" ? body.name : "",
      synced: credentialBackedUp,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return refuse("This passkey is already added.", 409);
    throw error;
  }

  const res = NextResponse.json({ ok: true, security: await loadAdminSecurity() }, { headers: { "Cache-Control": "no-store" } });
  trustDevice(res, await readSessionGeneration());
  return res;
}
