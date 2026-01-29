import type { Service } from "./types";

export async function createService(payload: Partial<Service>) {
  const res = await fetch("/api/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

export async function patchService(id: string, patch: Partial<Service>) {
  const res = await fetch(`/api/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteService(id: string, hard = false) {
  const res = await fetch(`/api/services/${encodeURIComponent(id)}?hard=${hard ? "1" : "0"}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function saveOrder(servicesInOrder: Service[]) {
  await Promise.all(servicesInOrder.map((s, idx) => patchService(s.id, { order: idx })));
}