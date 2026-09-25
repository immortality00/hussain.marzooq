export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type PushDevice = {
  id: string;
  label: string;
  createdAt: string | null;
};

const MAX_ENDPOINT_LENGTH = 2048;
const MAX_LABEL_LENGTH = 80;
const BASE64URL = /^[A-Za-z0-9_-]+=*$/;

const PUSH_SERVICE_HOST_SUFFIXES = [
  "push.apple.com",
  "googleapis.com",
  "push.services.mozilla.com",
  "notify.windows.com",
];

function isPushServiceHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return PUSH_SERVICE_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

function parseEndpoint(value: unknown): string | null {
  const endpoint = typeof value === "string" ? value.trim() : "";
  if (!endpoint || endpoint.length > MAX_ENDPOINT_LENGTH) return null;

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return null;
  }
  return url.protocol === "https:" && isPushServiceHost(url.hostname) ? endpoint : null;
}

export function parsePushSubscription(value: unknown): PushSubscriptionInput | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;

  const endpoint = parseEndpoint(record.endpoint);
  if (!endpoint) return null;

  const keys =
    typeof record.keys === "object" && record.keys !== null
      ? (record.keys as Record<string, unknown>)
      : {};
  const p256dh = typeof keys.p256dh === "string" ? keys.p256dh : "";
  const auth = typeof keys.auth === "string" ? keys.auth : "";
  if (!BASE64URL.test(p256dh) || p256dh.length > 256) return null;
  if (!BASE64URL.test(auth) || auth.length > 64) return null;

  return { endpoint, keys: { p256dh, auth } };
}

export function cleanDeviceLabel(value: unknown): string {
  const label = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  return label.slice(0, MAX_LABEL_LENGTH) || "Unknown device";
}
