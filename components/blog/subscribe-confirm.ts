export type ConfirmView = "confirming" | "done" | "expired" | "incomplete" | "retry";
export type ConfirmResult = { view: Exclude<ConfirmView, "confirming" | "incomplete">; reason?: string };

export const CONFIRM_COPY: Record<Exclude<ConfirmView, "confirming">, { heading: string; body: string }> = {
  done: {
    heading: "You’re on the list.",
    body: "Every new story finds its way to your inbox the moment it’s published — and nothing else does.",
  },
  expired: {
    heading: "This link has run its course.",
    body: "Links last 24 hours. Subscribe again from the blog — it takes a moment.",
  },
  incomplete: {
    heading: "This link is incomplete.",
    body: "Open it again from the email, end to end.",
  },
  retry: {
    heading: "Not confirmed yet.",
    body: "No connection.",
  },
};

/** The token travels after `#`, so it never reaches a server log or the analytics count. */
export function linkToken(hash: string) {
  return new URLSearchParams(hash.replace(/^#/, "")).get("t") ?? "";
}

export async function confirmLink(token: string): Promise<ConfirmResult> {
  try {
    const res = await fetch("/api/subscribe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (res.ok && data?.ok) return { view: "done" };
    if (res.status === 400 || res.status === 410) return { view: "expired" };
    return { view: "retry", reason: data?.error };
  } catch {
    return { view: "retry" };
  }
}
