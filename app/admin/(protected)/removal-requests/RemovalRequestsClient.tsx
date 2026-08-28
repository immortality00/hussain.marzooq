"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { useAdminAction } from "@/hooks/useAdminAction";
import type { RemovalDecisionItem, RemovalRequestItem } from "@/lib/server/removal-requests";

const MIN_PASSWORD_LENGTH = 8;

export default function RemovalRequestsClient({
  items,
  history,
}: {
  items: RemovalRequestItem[];
  history: RemovalDecisionItem[];
}) {
  const [rows, setRows] = useState(items);
  const [historyRows, setHistoryRows] = useState(history);
  const [busyId, setBusyId] = useState("");
  const [approvingId, setApprovingId] = useState("");
  const [approvePassword, setApprovePassword] = useState("");
  const { feedback, setFeedback } = useAdminAction();

  function recordDecision(row: RemovalRequestItem, status: "approved" | "dismissed") {
    setHistoryRows((prev) => [
      {
        id: `${row.id}-${Date.now()}`,
        name: row.name,
        slug: row.slug,
        email: row.email,
        reason: row.reason,
        status,
        requestedAt: row.requestedAt,
        decidedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  function startApprove(id: string) {
    if (busyId) return;
    setApprovePassword("");
    setApprovingId(id);
    setFeedback(null);
  }

  async function confirmApprove(id: string) {
    if (busyId) return;
    if (approvePassword.trim().length < MIN_PASSWORD_LENGTH) {
      setFeedback({ type: "err", text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
      return;
    }

    setBusyId(id);
    setFeedback({ type: "info", text: "Approving…" });

    try {
      const res = await fetch(`/api/people/${encodeURIComponent(id)}/removal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", password: approvePassword.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setFeedback({ type: "err", text: data?.error ?? "Action failed." });
        return;
      }
      const row = rows.find((r) => r.id === id);
      if (row) recordDecision(row, "approved");
      setRows((prev) => prev.filter((r) => r.id !== id));
      setApprovingId("");
      setApprovePassword("");
      setFeedback({ type: "ok", text: "✅ Removal approved. Linked media hidden and the profile is password-only." });
    } catch {
      setFeedback({ type: "err", text: "Action failed." });
    } finally {
      setBusyId("");
    }
  }

  async function dismiss(id: string) {
    if (busyId) return;
    if (!confirm("Dismiss this request?")) return;

    setBusyId(id);
    setFeedback({ type: "info", text: "Dismissing…" });

    try {
      const res = await fetch(`/api/people/${encodeURIComponent(id)}/removal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setFeedback({ type: "err", text: data?.error ?? "Action failed." });
        return;
      }
      const row = rows.find((r) => r.id === id);
      if (row) recordDecision(row, "dismissed");
      setRows((prev) => prev.filter((r) => r.id !== id));
      setFeedback({ type: "ok", text: "✅ Request dismissed." });
    } catch {
      setFeedback({ type: "err", text: "Action failed." });
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <AdminPageHeader
        title="Removal Requests"
        description="People who asked to have their profile taken off the public site. Approving hides their linked media and locks the profile behind a password you set."
      />

      <AdminActionFeedback feedback={feedback} />

      <section className="mt-8 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-[2rem] border p-6 text-sm text-muted-foreground">
            No requests to review.
          </div>
        ) : (
          rows.map((item) => (
            <article key={item.id} className="rounded-[2rem] border p-4">
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border bg-muted">
                  {item.avatarUrl ? (
                    <Image src={item.avatarUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{item.name}</span>
                    {item.requestedAt ? (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {item.requestedAt.slice(0, 10)}
                      </span>
                    ) : null}
                  </div>
                  <Link
                    href={`/people/${item.slug}`}
                    className="mt-0.5 block text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    /people/{item.slug}
                  </Link>
                  {item.email ? (
                    <div className="mt-2 text-xs text-muted-foreground">Contact: {item.email}</div>
                  ) : null}
                  {item.reason ? (
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                      “{item.reason}”
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-2">
                  {approvingId === item.id ? null : (
                    <>
                      <button
                        type="button"
                        disabled={!!busyId}
                        onClick={() => startApprove(item.id)}
                        className={adminButtonClasses("danger", "md")}
                      >
                        Approve removal
                      </button>
                      <button
                        type="button"
                        disabled={!!busyId}
                        onClick={() => void dismiss(item.id)}
                        className={adminButtonClasses("default", "md")}
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>

              {approvingId === item.id ? (
                <div className="mt-4 space-y-2 rounded-2xl border p-4">
                  <label className="text-sm font-medium">Set a password for this profile</label>
                  <p className="text-xs leading-5 text-muted-foreground">
                    After approval the profile is reachable only at its direct link with this
                    password. Minimum {MIN_PASSWORD_LENGTH} characters.
                  </p>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={approvePassword}
                    disabled={!!busyId}
                    onChange={(e) => setApprovePassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void confirmApprove(item.id);
                    }}
                    placeholder="New password"
                    className="w-full max-w-sm rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={!!busyId}
                      onClick={() => void confirmApprove(item.id)}
                      className={adminButtonClasses("danger", "md")}
                    >
                      {busyId === item.id ? "Approving…" : "Confirm removal"}
                    </button>
                    <button
                      type="button"
                      disabled={!!busyId}
                      onClick={() => {
                        setApprovingId("");
                        setApprovePassword("");
                      }}
                      className={adminButtonClasses("default", "md")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          History
        </h2>
        <div className="mt-4 space-y-2">
          {historyRows.length === 0 ? (
            <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
              No decisions yet.
            </div>
          ) : (
            historyRows.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-start gap-x-4 gap-y-1 rounded-2xl border p-4"
              >
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${
                    item.status === "approved"
                      ? "border-destructive/40 text-destructive"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {item.status === "approved" ? "Approved" : "Dismissed"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">/people/{item.slug}</div>
                  {item.email ? (
                    <div className="mt-1 text-xs text-muted-foreground">Contact: {item.email}</div>
                  ) : null}
                  {item.reason ? (
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                      “{item.reason}”
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] text-muted-foreground">
                  {item.requestedAt ? <div>req {item.requestedAt.slice(0, 10)}</div> : null}
                  {item.decidedAt ? <div>dec {item.decidedAt.slice(0, 10)}</div> : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
