"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav-groups";

export function AdminSidebarNav({ notificationCount = 0 }: { notificationCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1">
          <div className="px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const badge = item.href === "/admin/dashboard" ? notificationCount : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                )}
              >
                <span>{item.label}</span>
                {badge > 0 ? (
                  <span
                    aria-label={`${badge} pending`}
                    className="inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none tabular-nums text-white"
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
