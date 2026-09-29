"use client";

import { Suspense, use } from "react";

const BADGE_CLASSES = {
  item: "inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none tabular-nums text-white",
  tab: "absolute left-1/2 top-2 ml-2 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[10px] font-semibold leading-none text-white",
};

type BadgeVariant = keyof typeof BADGE_CLASSES;

function PendingCount({ count, variant }: { count: Promise<number>; variant: BadgeVariant }) {
  const value = use(count);
  if (value <= 0) return null;

  const text = value > 99 ? "99+" : value;
  if (variant === "tab") return <span className={BADGE_CLASSES.tab}>{text}</span>;

  return (
    <span aria-label={`${value} pending`} className={BADGE_CLASSES.item}>
      {text}
    </span>
  );
}

export function AdminNavBadge({
  count,
  variant = "item",
}: {
  count: Promise<number>;
  variant?: BadgeVariant;
}) {
  return (
    <Suspense fallback={null}>
      <PendingCount count={count} variant={variant} />
    </Suspense>
  );
}
