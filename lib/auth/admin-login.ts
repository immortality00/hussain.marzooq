import { ADMIN_LOGIN_PATH } from "./admin-next-path";

export type LoginRefusal = "wrong" | "locked" | "config" | "origin";
export type LoginResult = { ok: true; next: string } | { ok: false; message: string };

const REFUSALS: Record<LoginRefusal, string> = {
  wrong: "Wrong password.",
  locked: "Too many failed attempts. Please wait before trying again.",
  config:
    "Admin is not configured. Check .env.local for ADMIN_PASSWORD_HASH and ADMIN_COOKIE_SECRET, then restart the dev server.",
  origin: "Could not sign in: the request did not come from this site.",
};

function refusalMessage(body: unknown, status: number) {
  const error = (body as { error?: unknown } | null)?.error;
  return typeof error === "string" && error in REFUSALS
    ? REFUSALS[error as LoginRefusal]
    : `Could not sign in (error ${status}).`;
}

export async function requestAdminLogin(form: FormData): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(ADMIN_LOGIN_PATH, { method: "POST", body: form, cache: "no-store" });
  } catch {
    return { ok: false, message: "No connection." };
  }
  const body = (await res.json().catch(() => null)) as { ok?: unknown; next?: unknown } | null;
  if (res.ok && body?.ok === true && typeof body.next === "string") return { ok: true, next: body.next };
  return { ok: false, message: refusalMessage(body, res.status) };
}
