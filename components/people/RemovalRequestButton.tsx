"use client";

import { useState } from "react";

export default function RemovalRequestButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setMsg("");

    if (!email.trim()) {
      setMsg("Email is required.");
      return;
    }
    if (!reason.trim()) {
      setMsg("A message is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/people/removal-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email, reason }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setMsg(data?.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="mt-16 text-center text-xs leading-6 text-muted-foreground">
        Your removal request has been received and will be reviewed.
      </p>
    );
  }

  return (
    <div className="mt-16 text-center">
      {open ? (
        <div className="mx-auto max-w-md space-y-3 rounded-2xl border p-5 text-left">
          <div className="text-sm font-medium">Request removal of this profile</div>
          <p className="text-xs leading-5 text-muted-foreground">
            Ask for your images to be taken off the public site. Your request is reviewed before
            anything changes.
          </p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Your message"
            className="h-24 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {msg ? <div className="text-xs text-muted-foreground">{msg}</div> : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => void submit()}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send request"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setOpen(false)}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-accent/40 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Request removal of this profile
        </button>
      )}
    </div>
  );
}
