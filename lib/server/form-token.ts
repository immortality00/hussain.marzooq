import { createHmac, timingSafeEqual } from "node:crypto";

export const FORM_KINDS = ["inquiry", "review", "removal"] as const;
export type FormKind = (typeof FORM_KINDS)[number];

export const FORM_TOKEN_MIN_AGE_MS = 2500;
export const FORM_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_TOKEN_LENGTH = 200;

export type FormTokenCheck = "ok" | "missing" | "forged" | "fast" | "expired";

export function isFormKind(value: unknown): value is FormKind {
  return typeof value === "string" && (FORM_KINDS as readonly string[]).includes(value);
}

function formTokenSecret() {
  const base = (process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  return base ? createHmac("sha256", base).update("hm-form-token").digest() : null;
}

function sign(key: Buffer, payload: string) {
  return createHmac("sha256", key).update(payload).digest("hex");
}

export function issueFormToken(form: FormKind, now: number = Date.now()) {
  const key = formTokenSecret();
  if (!key) return null;
  const payload = `v1.${form}.${now}`;
  return `${payload}.${sign(key, payload)}`;
}

export function checkFormToken(value: unknown, form: FormKind, now: number = Date.now()): FormTokenCheck {
  if (typeof value !== "string" || !value || value.length > MAX_TOKEN_LENGTH) return "missing";

  const key = formTokenSecret();
  const parts = value.split(".");
  if (!key || parts.length !== 4 || parts[0] !== "v1") return "forged";

  const [version, kind, issuedRaw, signature] = parts;
  const expected = Buffer.from(sign(key, `${version}.${kind}.${issuedRaw}`));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return "forged";
  if (kind !== form || !/^\d{1,15}$/.test(issuedRaw)) return "forged";

  const age = now - Number(issuedRaw);
  if (age < -CLOCK_SKEW_MS || age > FORM_TOKEN_MAX_AGE_MS) return "expired";
  if (age < FORM_TOKEN_MIN_AGE_MS) return "fast";
  return "ok";
}

const REFUSALS: Record<Exclude<FormTokenCheck, "ok">, string> = {
  missing: "Reload the page and try again.",
  forged: "Reload the page and try again.",
  fast: "Submission was too fast. Please try again.",
  expired: "This form expired. Reload the page and try again.",
};

export function formTokenRefusal(value: unknown, form: FormKind, now: number = Date.now()) {
  const check = checkFormToken(value, form, now);
  return check === "ok" ? null : REFUSALS[check];
}
