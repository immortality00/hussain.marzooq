export function fmt(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function statusPill(status: string) {
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