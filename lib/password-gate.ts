import crypto from "crypto";

export const MIN_PERSON_PASSWORD_LENGTH = 8;

function scryptAsync(password: string, salt: Buffer, keylen: number) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

function timingSafeStringEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, hashHex] = stored.split(":");
  if (algo !== "scrypt" || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scryptAsync(password, salt, expected.length);

  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function makeAccessToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function personGateCookieName(personId: string) {
  return `hm_person_${personId}`;
}

function signGatePayload(secret: string, personId: string, accessToken: string) {
  if (!secret) return null;
  return crypto
    .createHmac("sha256", secret)
    .update(`person.${personId}.${accessToken}`)
    .digest("hex");
}

export function createPersonGateCookieValue(secret: string, personId: string, accessToken: string) {
  const id = personId.trim();
  const token = accessToken.trim();
  if (!id || !token) return null;

  const signature = signGatePayload(secret, id, token);
  if (!signature) return null;

  return `v1.${token}.${signature}`;
}

export function verifyPersonGateCookieValue(params: {
  secret: string;
  personId: string;
  accessToken: string;
  cookieValue: string;
}) {
  const secret = params.secret;
  const personId = params.personId.trim();
  const accessToken = params.accessToken.trim();
  const cookieValue = params.cookieValue.trim();

  if (!secret || !personId || !accessToken || !cookieValue) return false;

  const [version, tokenFromCookie, signatureFromCookie] = cookieValue.split(".");
  if (version !== "v1" || tokenFromCookie !== accessToken || !signatureFromCookie) return false;

  const expectedSignature = signGatePayload(secret, personId, accessToken);
  if (!expectedSignature) return false;

  return timingSafeStringEqual(signatureFromCookie, expectedSignature);
}

export function getPersonGateSecret() {
  return (
    (process.env.PERSON_GATE_COOKIE_SECRET ?? "").trim() ||
    (process.env.ADMIN_COOKIE_SECRET ?? "").trim()
  );
}
