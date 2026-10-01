"use client";

import { AdminLink } from "@/components/admin/AdminLink";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminNavBadge } from "./AdminNavBadge";
import { NAV_GROUPS } from "./nav-groups";

export function AdminSidebarNav() {
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
            return (
              <AdminLink
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
                {item.href === "/admin/dashboard" ? (
                  <AdminNavBadge />
                ) : null}
              </AdminLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
