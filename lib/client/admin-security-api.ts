import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import { adminWrite, type AdminSlice } from "@/lib/client/admin-store";
import { thisDeviceLabel } from "@/lib/client/push-support";
import type { AdminSecurity } from "@/lib/server/admin-security-state";

const SECURITY_API = "/api/admin/security";

type Reply = { error?: string; options?: unknown; security?: AdminSecurity } | null;

async function securityRequest(
  method: "POST" | "DELETE",
  url: string,
  touches: readonly AdminSlice[],
  body?: unknown
) {
  const res = await adminWrite(
    url,
    {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    },
    touches
  );
  const json = (await res.json().catch(() => null)) as Reply;
  if (!res.ok) throw Object.assign(new Error(json?.error ?? `Request failed (${res.status}).`), { reply: json });
  return json;
}

async function passkeyAnswer<T>(run: () => Promise<T>) {
  try {
    return await run();
  } catch {
    throw new Error("No passkey was used.");
  }
}

export async function addPasskey(password: string) {
  const start = await securityRequest("POST", `${SECURITY_API}/passkeys/options`, [], { password });
  const optionsJSON = start?.options as PublicKeyCredentialCreationOptionsJSON;
  const response = await passkeyAnswer(() => startRegistration({ optionsJSON }));
  const saved = await securityRequest("POST", `${SECURITY_API}/passkeys`, ["security"], {
    response,
    name: thisDeviceLabel(),
  });
  return saved?.security ?? null;
}

export async function removePasskey(id: string) {
  const json = await securityRequest("DELETE", `${SECURITY_API}/passkeys/${encodeURIComponent(id)}`, ["security"]);
  return json?.security ?? null;
}

export function signOutEverywhere() {
  return securityRequest("POST", `${SECURITY_API}/sign-out-everywhere`, []);
}

export async function rejectSignIn(id: string) {
  const json = await securityRequest("POST", `${SECURITY_API}/sign-ins/${encodeURIComponent(id)}`, ["security"], {
    decision: "reject",
  });
  return json?.security ?? null;
}

/** Picking the number and answering Face ID / Touch ID approves; a wrong number refuses the sign-in. */
export async function approveSignIn(id: string, choice: number) {
  const url = `${SECURITY_API}/sign-ins/${encodeURIComponent(id)}`;
  const start = await securityRequest("POST", `${url}/options`, []);
  const optionsJSON = start?.options as PublicKeyCredentialRequestOptionsJSON;
  const response = await passkeyAnswer(() => startAuthentication({ optionsJSON }));
  const json = await securityRequest("POST", url, ["security"], { decision: "approve", choice, response });
  return json?.security ?? null;
}
