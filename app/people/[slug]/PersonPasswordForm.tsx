"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SmartImage from "@/components/shared/SmartImage";

export default function PersonPasswordForm({
  slug,
  name,
  bio,
  avatarUrl,
}: {
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setMsg("");
    if (!password.trim()) {
      setMsg("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/people/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setMsg(data?.error ?? "Access failed.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setMsg("Access failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <section className="rounded-[2rem] border p-6 text-center">
        <div className="flex justify-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
            {avatarUrl ? (
              <SmartImage src={avatarUrl} alt={name} fill className="object-cover" sizes="80px" />
            ) : null}
          </div>
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight">{name}</h1>
        {bio ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{bio}</p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This profile is private. Enter the password to view it.
          </p>
        )}

        <div className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
            placeholder="Enter password"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          {msg ? <div className="text-sm text-muted-foreground">{msg}</div> : null}

          <button
            type="button"
            disabled={loading}
            onClick={() => void submit()}
            className="w-full rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Opening..." : "Open profile"}
          </button>
        </div>
      </section>
    </main>
  );
}
