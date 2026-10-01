"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedText } from "@/components/shared/AnimatedText";
import { Button } from "@/components/shared/Button";

export default function GalleryPasswordForm({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description: string | null;
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
      const res = await fetch("/api/private-galleries/access", {
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
        <h1 className="text-3xl font-semibold tracking-tight">
          <AnimatedText>{title}</AnimatedText>
        </h1>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}

        <div className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          {msg ? <div className="text-sm text-muted-foreground">{msg}</div> : null}

          <Button
            variant="solid"
            disabled={loading}
            onClick={() => void submit()}
            className="w-full justify-center"
          >
            {loading ? "Opening..." : "Open gallery"}
          </Button>
        </div>
      </section>
    </main>
  );
}