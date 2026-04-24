"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function statusPill(status: string) {
  const s = status.toLowerCase();

  if (s === "new") {
    return "border-sky-400/50 bg-sky-950 text-sky-100";
  }

  if (s === "pending") {
    return "border-amber-400/50 bg-amber-950 text-amber-100";
  }

  if (s === "replied") {
    return "border-violet-400/50 bg-violet-950 text-violet-100";
  }

  if (s === "approved") {
    return "border-emerald-400/50 bg-emerald-950 text-emerald-100";
  }

  if (s === "rejected") {
    return "border-rose-400/50 bg-rose-950 text-rose-100";
  }

  return "border-zinc-400/40 bg-zinc-900 text-zinc-100";
}

type ApiInquiriesResponse =
  | { ok: true; items: Inquiry[] }
  | { ok: false; error?: string };

function isApiResponse(v: unknown): v is ApiInquiriesResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) return Array.isArray(r.items);
  if (r.ok === false) return true;
  return false;
}

function IconButton({
  title,
  tone = "default",
  children,
  onClick,
}: {
  title: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        tone === "danger"
          ? "hover:border-rose-500/30 hover:bg-rose-500/10"
          : "hover:bg-accent",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M3 7h18" />
      <path d="M5 7h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z" />
      <path d="M9 12h6" />
      <path d="M5 4h14v3H5z" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [expandedId, setExpandedId] = useState<string>("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showArchivedSection, setShowArchivedSection] = useState(false);

  const notesRef = useRef<Record<string, string>>({});

  async function load() {
    setMsg(null);

    const params = new URLSearchParams();
    params.set("all", "1");
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/inquiries?${params.toString()}`, { cache: "no-store" });
    const raw = (await res.json().catch(() => null)) as unknown;

    if (!isApiResponse(raw) || raw.ok !== true || !Array.isArray(raw.items)) {
      const errText =
        isApiResponse(raw) && raw.ok === false && typeof raw.error === "string"
          ? raw.error
          : "Failed to load inquiries.";
      setMsg({ type: "err", text: errText });
      return;
    }

    setItems(raw.items);

    for (const it of raw.items) {
      if (notesRef.current[it.id] === undefined) {
        notesRef.current[it.id] = it.adminNotes ?? "";
      }
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const active = useMemo(() => items.filter((x) => !x.isArchived), [items]);
  const archived = useMemo(() => items.filter((x) => x.isArchived), [items]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of active) m.set(it.status, (m.get(it.status) ?? 0) + 1);
    return m;
  }, [active]);

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

  async function restore(id: string) {
    await patch(id, { isArchived: false });
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? "" : id));
    setMsg(null);
  }

  async function handleArchive(id: string) {
    const ok = confirm("Archive this inquiry?");
    if (!ok) return;

    try {
      await archive(id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: true } : p)));
      if (expandedId === id) setExpandedId("");
      setMsg({ type: "ok", text: "✅ Archived." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Archive failed." });
    }
  }

  async function handleRestore(id: string) {
    try {
      await restore(id);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, isArchived: false } : p)));
      setMsg({ type: "ok", text: "✅ Restored." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Restore failed." });
    }
  }

  async function handleDeleteForever(id: string) {
    const ok = confirm("Delete forever? This cannot be undone.");
    if (!ok) return;

    try {
      await hardDelete(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      if (expandedId === id) setExpandedId("");
      setMsg({ type: "ok", text: "✅ Deleted forever." });
    } catch (err: unknown) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Delete failed." });
    }
  }

  function Section({ title, list, archivedMode }: { title: string; list: Inquiry[]; archivedMode: boolean }) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border bg-background/70">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{list.length} item(s)</div>
        </div>

        <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {list.map((it) => {
          const expanded = expandedId === it.id;

          return (
            <div key={it.id} className="border-b last:border-b-0">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm hover:bg-accent/20">
                <button
                  type="button"
                  onClick={() => toggleExpand(it.id)}
                  className="col-span-11 grid grid-cols-11 gap-2 text-left"
                >
                  <div className="col-span-2 self-center text-xs text-muted-foreground">{fmt(it.createdAt)}</div>
                  <div className="col-span-2 truncate self-center font-medium">{it.name}</div>
                  <div className="col-span-3 truncate self-center text-muted-foreground">{it.email}</div>
                  <div className="col-span-2 truncate self-center">{it.serviceName ?? it.serviceId ?? "Other"}</div>
                  <div className="col-span-2 self-center">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusPill(it.status)}`}>
                      {it.status}
                    </span>
                  </div>
                </button>

                <div
                  className="col-span-1 flex items-center justify-end gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!archivedMode ? (
                    <IconButton
                      title="Archive inquiry"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await handleArchive(it.id);
                      }}
                    >
                      <ArchiveIcon />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton
                        title="Restore inquiry"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await handleRestore(it.id);
                        }}
                      >
                        <RestoreIcon />
                      </IconButton>
                      <IconButton
                        title="Delete forever"
                        tone="danger"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await handleDeleteForever(it.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>

              {expanded ? (
                <div className="px-4 pb-4">
                  <div className="grid gap-4 rounded-2xl border bg-background p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">Category</div>
                        <div className="font-medium">{it.category ?? "others"}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">ServiceId</div>
                        <div className="break-all font-mono text-xs text-muted-foreground">{it.serviceId ?? "-"}</div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Message</div>
                      <div className="whitespace-pre-wrap rounded-xl border bg-muted/25 px-3 py-3">{it.message}</div>
                    </div>

                    {!archivedMode ? (
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              className={`rounded-xl border px-3 py-2 text-sm hover:bg-accent ${
                                it.status === s ? "bg-accent" : ""
                              }`}
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                  await patch(it.id, { status: s });
                                  setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: s } : p)));
                                  setMsg({ type: "ok", text: "✅ Status updated." });
                                } catch (err: unknown) {
                                  setMsg({
                                    type: "err",
                                    text: err instanceof Error ? err.message : "Status update failed.",
                                  });
                                }
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="text-sm">
                      <div className="text-xs text-muted-foreground">Internal notes</div>

                      <textarea
                        key={it.id}
                        defaultValue={notesRef.current[it.id] ?? it.adminNotes ?? ""}
                        onInput={(e) => {
                          const v = (e.target as HTMLTextAreaElement).value;
                          notesRef.current[it.id] = v;
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="mt-2 h-28 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />

                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              const value = notesRef.current[it.id] ?? "";
                              await patch(it.id, { adminNotes: value });
                              setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, adminNotes: value } : p)));
                              setMsg({ type: "ok", text: "✅ Notes saved." });
                            } catch (err: unknown) {
                              setMsg({ type: "err", text: err instanceof Error ? err.message : "Save notes failed." });
                            }
                          }}
                        >
                          Save notes
                        </button>

                        {!archivedMode ? (
                          <button
                            className="rounded-xl border px-4 py-2 text-sm hover:bg-rose-500/10"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handleArchive(it.id);
                            }}
                          >
                            Archive
                          </button>
                        ) : (
                          <>
                            <button
                              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                await handleRestore(it.id);
                              }}
                            >
                              Restore
                            </button>

                            <button
                              className="rounded-xl border px-4 py-2 text-sm hover:bg-rose-500/10"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                await handleDeleteForever(it.id);
                              }}
                            >
                              Delete forever
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {list.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No items.</div> : null}
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Inquiries</h1>
          <p className="mt-2 text-sm text-muted-foreground">Active on top, archived below.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="">All active statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({counts.get(s) ?? 0})
              </option>
            ))}
          </select>

          <button className="rounded-xl border px-4 py-2 text-sm hover:bg-accent" onClick={() => void load()}>
            Refresh
          </button>
        </div>
      </div>

      {msg ? (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            msg.type === "ok" ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      <Section title="Active" list={active} archivedMode={false} />

      <div className="mt-6">
        <button
          type="button"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent"
          onClick={() => setShowArchivedSection((p) => !p)}
        >
          {showArchivedSection ? "Hide Archived" : `Show Archived (${archived.length})`}
        </button>
      </div>

      {showArchivedSection ? <Section title="Archived" list={archived} archivedMode={true} /> : null}
    </main>
  );
}