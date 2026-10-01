import { pushDeviceLabel } from "@/lib/client/push-support";
import { adminWrite, type AdminSlice } from "@/lib/client/admin-store";

const SW_URL = "/admin-sw.js";
const SW_SCOPE = "/admin/";
const PUSH_API = "/api/admin/push";
const SAVED_KEY = "hm.admin.push.saved";

type PushApiResponse = { error?: string; sent?: number; failed?: number } | null;

async function pushRequest(method: "POST" | "DELETE", url: string, touches: readonly AdminSlice[], body?: unknown) {
  const res = await adminWrite(
    url,
    {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    },
    touches
  );
  const json = (await res.json().catch(() => null)) as PushApiResponse;
  if (!res.ok) throw new Error(json?.error ?? `Request failed (${res.status}).`);
  return json;
}

export function registerAdminWorker() {
  return navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
}

export function savedPushEndpoint() {
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
  const json = await pushRequest("POST", PUSH_API, ["push"], {
    subscription: subscription.toJSON(),
    label: pushDeviceLabel(),
  });
  writeSaved(subscription.endpoint);
  return json;
}

export function forgetSavedPushDevice() {
  writeSaved(null);
}

export function deletePushDevice(target: { endpoint: string } | { id: string }) {
  return pushRequest("DELETE", PUSH_API, ["push"], target);
}

export function sendTestPush() {
  return pushRequest("POST", `${PUSH_API}/test`, []);
}
