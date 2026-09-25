import { pushDeviceLabel } from "@/lib/client/push-support";

const SW_URL = "/admin-sw.js";
const SW_SCOPE = "/admin/";
const PUSH_API = "/api/admin/push";

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

export function savePushDevice(subscription: PushSubscription) {
  return pushRequest("POST", PUSH_API, {
    subscription: subscription.toJSON(),
    label: pushDeviceLabel(),
  });
}

export function deletePushDevice(target: { endpoint: string } | { id: string }) {
  return pushRequest("DELETE", PUSH_API, target);
}

export function sendTestPush() {
  return pushRequest("POST", `${PUSH_API}/test`);
}
