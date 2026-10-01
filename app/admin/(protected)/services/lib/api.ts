import { adminWrite } from "@/lib/client/admin-store";
import { expectVersion, throwIfRecordChanged } from "@/lib/record-changed";
import type { Service } from "./types";

type JsonObject = Record<string, unknown>;

const SERVICE_TOUCHES = ["services", "serviceCategories"] as const;

async function readJson(res: Response): Promise<JsonObject> {
  const data = (await res.json().catch(() => ({}))) as unknown;
  return (typeof data === "object" && data !== null ? (data as JsonObject) : {}) as JsonObject;
}

function getError(data: JsonObject): string {
  const e = data.error;
  return typeof e === "string" && e.trim() ? e : "Request failed";
}

export async function createService(payload: Partial<Service>): Promise<Service> {
  const res = await adminWrite(
    "/api/services",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    SERVICE_TOUCHES
  );
  const data = await readJson(res);
  if (!res.ok || !data.item) throw new Error(getError(data));
  return data.item as Service;
}

export async function patchService(id: string, patch: Partial<Service>, expected?: string | null): Promise<Service | null> {
  const res = await adminWrite(
    `/api/services/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...expectVersion(expected) },
      body: JSON.stringify(patch),
    },
    SERVICE_TOUCHES
  );
  const data = await readJson(res);
  if (!res.ok) {
    throwIfRecordChanged(data);
    throw new Error(getError(data));
  }
  return (data.item as Service | undefined) ?? null;
}

export async function archiveService(id: string): Promise<JsonObject> {
  const res = await adminWrite(`/api/services/${encodeURIComponent(id)}`, { method: "DELETE" }, SERVICE_TOUCHES);
  const data = await readJson(res);
  if (!res.ok) throw new Error(getError(data));
  return data;
}

export async function deleteServiceForever(id: string): Promise<JsonObject> {
  const res = await adminWrite(`/api/services/${encodeURIComponent(id)}?hard=1`, { method: "DELETE" }, SERVICE_TOUCHES);
  const data = await readJson(res);
  if (!res.ok) throw new Error(getError(data));
  return data;
}

export async function syncInquiryCounts(): Promise<JsonObject> {
  const res = await adminWrite("/api/services/recount-inquiries", { method: "POST" }, ["services"]);
  const data = await readJson(res);
  if (!res.ok) throw new Error(getError(data));
  return data;
}