"use client";

import { useState } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import Image from "next/image";
import { AdminLink } from "@/components/admin/AdminLink";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { adminWrite } from "@/lib/client/admin-store";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { adminInputClasses } from "@/components/admin/admin-input";

const MIN_PASSWORD_LENGTH = 8;

type DecisionReply = {
  ok?: boolean;
  error?: string;
  removal?: AdminSnapshot["removal"];
  person?: AdminSnapshot["people"][number] | null;
};

async function decide(id: string, body: Record<string, string>): Promise<DecisionReply> {
  const res = await adminWrite(
    `/api/people/${encodeURIComponent(id)}/removal`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    ["removal", "people", "media", "dashboard"]
  );
  const data = (await res.json().catch(() => null)) as DecisionReply | null;
  if (!res.ok || !data?.ok || !data.removal) throw new Error(data?.error ?? "Action failed.");
  return data;
}

export default function RemovalRequestsClient() {
  const [removal, setRemoval] = useAdminSlice("removal");
  const [, setPeople] = useAdminSlice("people");
  const rows = removal.items;
  const historyRows = removal.history;
  const [busyId, setBusyId] = useState("");
  const [approvingId, setApprovingId] = useState("");
  const [approvePassword, setApprovePassword] = useState("");
  const { feedback, setFeedback } = useAdminAction();

  function startApprove(id: string) {
    if (busyId) return;
    setApprovePassword("");
    setApprovingId(id);
    setFeedback(null);
  }

  async function run(id: string, busyText: string, body: Record<string, string>, okText: string) {
    setBusyId(id);
    setFeedback({ type: "info", text: busyText });
    try {
      const reply = await decide(id, body);
      setRemoval(reply.removal!);
      const person = reply.person;
      if (person) setPeople((prev) => prev.map((p) => (p.id === person.id ? person : p)));
      setApprovingId("");
      setApprovePassword("");
      setFeedback({ type: "ok", text: okText });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: errorMessage(e, "Action failed.") });
    } finally {
      setBusyId("");
    }
  }

  function confirmApprove(id: string) {
    if (busyId) return;
    if (approvePassword.trim().length < MIN_PASSWORD_LENGTH) {
      setFeedback({ type: "err", text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
      return;
    }
    return run(
      id,
      "Approving…",
      { action: "approve", password: approvePassword.trim() },
      "✅ Removal approved. Linked media hidden and the profile is password-only."
    );
  }

  function dismiss(id: string) {
    if (busyId || !confirm("Dismiss this request?")) return;
    return run(id, "Dismissing…", { action: "dismiss" }, "✅ Request dismissed.");
  }

  return (
    <main className="mx-auto max-w-5xl px-0 py-3 md:px-6 md:py-10">
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
              <div className="flex flex-wrap items-start gap-4">
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
                  <AdminLink
                    href={`/people/${item.slug}`}
                    className="mt-0.5 block text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    /people/{item.slug}
                  </AdminLink>
                  {item.email ? (
                    <div className="mt-2 text-xs text-muted-foreground">Contact: {item.email}</div>
                  ) : null}
                  {item.reason ? (
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                      “{item.reason}”
                    </p>
                  ) : null}
                </div>

                <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto sm:shrink-0">
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
                    className={adminInputClasses("md", "max-w-sm")}
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
