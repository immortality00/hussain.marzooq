"use client";

import { useEffect, useMemo, useState } from "react";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  category: string | null;
  serviceId: string | null;
  serviceName: string | null;
  status: string;
  adminNotes: string;
  isArchived: boolean;
  createdAt: string | null;
};

const STATUSES = ["new", "pending", "replied", "approved", "rejected", "resolved"] as const;

function fmt(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function statusPill(status: string) {
  const s = status.toLowerCase();
  if (s === "new") return "bg-blue-500/10 border-blue-500/30";
  if (s === "pending") return "bg-yellow-500/10 border-yellow-500/30";
  if (s === "replied") return "bg-purple-500/10 border-purple-500/30";
  if (s === "approved") return "bg-green-500/10 border-green-500/30";
  if (s === "rejected") return "bg-red-500/10 border-red-500/30";
  return "bg-muted border-border";
}

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string>("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showArchived, setShowArchived] = useState(false);

  async function load() {
    setMsg(null);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (showArchived) params.set("all", "1");
    const q = params.toString() ? `?${params.toString()}` : "";

    const res = await fetch(`/api/inquiries${q}`, { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; items?: Inquiry[]; error?: string };

    if (!res.ok || !data.ok || !Array.isArray(data.items)) {
      setMsg({ type: "err", text: data.error ?? "Failed to load inquiries." });
      return;
    }

    const list = showArchived ? data.items : data.items.filter((x) => !x.isArchived);
    setItems(list);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, showArchived]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) m.set(it.status, (m.get(it.status) ?? 0) + 1);
    return m;
  }, [items]);

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
  }

  async function archive(id: string) {
    const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error(data.error ?? "Archive failed");
  }

  async function hardDelete(id: string) {
    const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}?hard=1`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error(data.error ?? "Delete failed");
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? "" : id));
    setMsg(null);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Inquiries</h1>
          <p className="mt-2 text-sm text-muted-foreground">Click an inquiry to expand details and actions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({counts.get(s) ?? 0})
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            Show archived
          </label>

          <button className="rounded-xl border px-4 py-2 text-sm hover:bg-accent" onClick={() => void load()}>
            Refresh
          </button>
        </div>
      </div>

      {msg ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            msg.type === "ok" ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-3">Service</div>
          <div className="col-span-2">Status</div>
        </div>

        {items.map((it) => {
          const expanded = expandedId === it.id;
          return (
            <div key={it.id} className="border-b">
              <button
                type="button"
                onClick={() => toggleExpand(it.id)}
                className="grid w-full grid-cols-12 gap-2 px-4 py-3 text-left text-sm hover:bg-accent/20"
              >
                <div className="col-span-2 text-xs text-muted-foreground">{fmt(it.createdAt)}</div>
                <div className="col-span-2 truncate">{it.name}</div>
                <div className="col-span-3 truncate">{it.email}</div>
                <div className="col-span-3 truncate">{it.serviceName ?? it.serviceId ?? "Other"}</div>
                <div className="col-span-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusPill(it.status)}`}>
                    {it.status}
                    {it.isArchived ? " (archived)" : ""}
                  </span>
                </div>
              </button>

              {expanded ? (
                <div className="px-4 pb-4">
                  <div className="grid gap-4 rounded-2xl border p-4 bg-background">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">Category</div>
                        <div className="font-medium">{it.category ?? "others"}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">ServiceId</div>
                        <div className="font-mono text-xs break-all text-muted-foreground">{it.serviceId ?? "-"}</div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Message</div>
                      <div className="whitespace-pre-wrap">{it.message}</div>
                    </div>

                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            className={`rounded-xl border px-3 py-2 text-sm hover:bg-accent ${
                              it.status === s ? "bg-accent" : ""
                            }`}
                            onClick={async () => {
                              try {
                                await patch(it.id, { status: s });
                                setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: s } : p)));
                                setMsg({ type: "ok", text: "✅ Status updated." });
                              } catch (e: unknown) {
                                setMsg({ type: "err", text: e instanceof Error ? e.message : "Status update failed." });
                              }
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Internal notes</div>
                      <textarea
                        value={it.adminNotes ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, adminNotes: v } : p)));
                        }}
                        className="mt-2 h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="What did you do? Next step?"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
                          onClick={async () => {
                            try {
                              const current = items.find((x) => x.id === it.id);
                              await patch(it.id, { adminNotes: current?.adminNotes ?? "" });
                              setMsg({ type: "ok", text: "✅ Notes saved." });
                            } catch (e: unknown) {
                              setMsg({ type: "err", text: e instanceof Error ? e.message : "Save notes failed." });
                            }
                          }}
                        >
                          Save notes
                        </button>

                        {!it.isArchived ? (
                          <button
                            className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10"
                            onClick={async () => {
                              const ok = confirm("Archive this inquiry? (good for spam/test)");
                              if (!ok) return;
                              try {
                                await archive(it.id);
                                setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, isArchived: true } : p)));
                                setMsg({ type: "ok", text: "✅ Inquiry archived." });
                              } catch (e: unknown) {
                                setMsg({ type: "err", text: e instanceof Error ? e.message : "Archive failed." });
                              }
                            }}
                          >
                            Archive
                          </button>
                        ) : (
                          <button
                            className="rounded-xl border px-4 py-2 text-sm hover:bg-red-500/10"
                            onClick={async () => {
                              const ok = confirm("Delete forever? This cannot be undone.");
                              if (!ok) return;
                              try {
                                await hardDelete(it.id);
                                setItems((prev) => prev.filter((p) => p.id !== it.id));
                                setExpandedId("");
                                setMsg({ type: "ok", text: "✅ Deleted forever." });
                              } catch (e: unknown) {
                                setMsg({ type: "err", text: e instanceof Error ? e.message : "Delete failed." });
                              }
                            }}
                          >
                            Delete forever
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {items.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No inquiries.</div> : null}
      </div>
    </main>
  );
}