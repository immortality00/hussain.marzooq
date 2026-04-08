import type { Service } from "./types";

type JsonObject = Record<string, unknown>;

async function readJson(res: Response): Promise<JsonObject> {
  const data = (await res.json().catch(() => ({}))) as unknown;
  return (typeof data === "object" && data !== null ? (data as JsonObject) : {}) as JsonObject;
}

function getError(data: JsonObject): string {
  const e = data.error;
  return typeof e === "string" && e.trim() ? e : "Request failed";
}

export async function createService(payload: Partial<Service>): Promise<JsonObject> {
  const res = await fetch("/api/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await readJson(res);
  if (!res.ok) throw new Error(getError(data));
  return data;
}

export async function patchService(id: string, patch: Partial<Service>): Promise<JsonObject> {
  const res = await fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const data = await readJson(res);
  if (!res.ok) throw new Error(getError(data));
  return data;
}

export async function deleteServiceForever(id: string): Promise<JsonObject> {
  const res = await fetch(`/api/services/${encodeURIComponent(id)}?hard=1`, {
    method: "DELETE",
  });

  const data = await readJson(res);
  if (!res.ok) throw new Error(getError(data));
  return data;
}

export async function deactivateService(id: string): Promise<JsonObject> {
  return patchService(id, { isActive: false });
}

export async function activateService(id: string): Promise<JsonObject> {
  return patchService(id, { isActive: true });
}

export async function saveOrder(servicesInOrder: Service[]): Promise<void> {
  await Promise.all(servicesInOrder.map((s, idx) => patchService(s.id, { order: idx })));
}