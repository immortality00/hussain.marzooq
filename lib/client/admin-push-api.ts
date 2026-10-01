import { pushDeviceLabel } from "@/lib/client/push-support";

const SW_URL = "/admin-sw.js";
const SW_SCOPE = "/admin/";
const PUSH_API = "/api/admin/push";
const SAVED_KEY = "hm.admin.push.saved";
export const RESAVE_AFTER_MS = 24 * 60 * 60 * 1000;

type PushApiResponse = { error?: string; sent?: number; failed?: number } | null;

async function pushRequest(method: "POST" | "DELETE", url: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => null)) as PushApiResponse;
  if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status}).`);
  return json;
}

export function registerAdminWorker() {
  return navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
}

export function pushDeviceNeedsSave(endpoint: string, saved: string | null, now = Date.now()) {
  try {
    const record = JSON.parse(saved ?? "null") as { endpoint?: unknown; at?: unknown } | null;
    if (!record || record.endpoint !== endpoint || typeof record.at !== "number") return true;
    return now - record.at >= RESAVE_AFTER_MS || now < record.at;
  } catch {
    return true;
  }
}

function readSaved() {
  try {
    return localStorage.getItem(SAVED_KEY);
  } catch {
    return null;
  }
}

function writeSaved(value: string | null) {
  try {
    if (value === null) localStorage.removeItem(SAVED_KEY);
    else localStorage.setItem(SAVED_KEY, value);
  } catch {}
}

export async function savePushDevice(subscription: PushSubscription) {
  const json = await pushRequest("POST", PUSH_API, {
    subscription: subscription.toJSON(),
    label: pushDeviceLabel(),
  });
  writeSaved(JSON.stringify({ endpoint: subscription.endpoint, at: Date.now() }));
  return json;
}

export async function resavePushDevice(subscription: PushSubscription) {
  if (pushDeviceNeedsSave(subscription.endpoint, readSaved())) await savePushDevice(subscription);
}

export function forgetSavedPushDevice() {
  writeSaved(null);
}

export function deletePushDevice(target: { endpoint: string } | { id: string }) {
  return pushRequest("DELETE", PUSH_API, target);
}

export function sendTestPush() {
  return pushRequest("POST", `${PUSH_API}/test`);
}
