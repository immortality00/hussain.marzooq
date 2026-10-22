import { startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import { ADMIN_LOGIN_PATH } from "./admin-next-path";
import { refusalMessage } from "./admin-login";

const PASSKEY_PATH = `${ADMIN_LOGIN_PATH}/passkey`;
const APPROVAL_PATH = `${ADMIN_LOGIN_PATH}/approval`;
const REQUEST_TIMEOUT_MS = 20_000;

export type StepResult = { ok: true; next: string } | { ok: false; message: string; restart: boolean };
export type ApprovalCheck = { status: "pending" } | StepResult;

type Body = { ok?: unknown; next?: unknown; options?: unknown; number?: unknown; status?: unknown; error?: unknown } | null;

async function call(path: string, init: RequestInit = {}): Promise<{ res: Response; body: Body } | null> {
  try {
    const res = await fetch(path, { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), ...init });
    return { res, body: (await res.json().catch(() => null)) as Body };
  } catch {
    return null;
  }
}

function failure(reply: { res: Response; body: Body } | null): { ok: false; message: string; restart: boolean } {
  if (!reply) return { ok: false, message: "No connection.", restart: false };
  const error = reply.body?.error;
  return {
    ok: false,
    message: refusalMessage(reply.body, reply.res.status),
    restart: error === "expired" || error === "rejected",
  };
}

const post = (path: string, body?: unknown) =>
  call(path, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

/** Face ID / Touch ID, or a phone's QR code on a computer without the passkey. */
export async function signInWithPasskey(): Promise<StepResult> {
  const options = await post(`${PASSKEY_PATH}/options`);
  if (!options?.res.ok || !options.body?.options) return failure(options);

  let answer: unknown;
  try {
    answer = await startAuthentication({ optionsJSON: options.body.options as PublicKeyCredentialRequestOptionsJSON });
  } catch {
    return { ok: false, message: "No passkey was used.", restart: false };
  }

  const reply = await post(PASSKEY_PATH, answer);
  if (reply?.res.ok && typeof reply.body?.next === "string") return { ok: true, next: reply.body.next };
  return failure(reply);
}

export async function askForApproval(): Promise<{ ok: true; number: number } | { ok: false; message: string; restart: boolean }> {
  const reply = await post(APPROVAL_PATH);
  if (reply?.res.ok && typeof reply.body?.number === "number") return { ok: true, number: reply.body.number };
  return failure(reply);
}

export async function checkApproval(): Promise<ApprovalCheck> {
  const reply = await call(APPROVAL_PATH);
  if (reply?.res.ok && reply.body?.status === "pending") return { status: "pending" };
  if (reply?.res.ok && typeof reply.body?.next === "string") return { ok: true, next: reply.body.next };
  if (!reply) return { status: "pending" };
  return failure(reply);
}
