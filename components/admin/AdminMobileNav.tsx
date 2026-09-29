"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminNavBadge } from "./AdminNavBadge";
import { NAV_GROUPS } from "./nav-groups";

export function AdminMobileNav({ notificationCount }: { notificationCount: Promise<number> }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const activeIndex = NAV_GROUPS.findIndex((group) =>
    group.items.some((item) => isItemActive(item.href)),
  );

  const openGroup = openIndex !== null ? NAV_GROUPS[openIndex] : null;

  return (
    <div className="md:hidden">
      {openGroup ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpenIndex(null)}
            aria-hidden
          />
          <div className="fixed inset-x-0 bottom-16 z-50 border-t bg-card p-2 shadow-[var(--shadow-elevated)]">
            <div className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {openGroup.label}
            </div>
            <div className="grid gap-1">
              {openGroup.items.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenIndex(null)}
                    aria-current={isItemActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm transition-colors",
                      isItemActive(item.href)
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.href === "/admin/dashboard" ? (
                      <AdminNavBadge count={notificationCount} />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t bg-card/95 backdrop-blur">
        {NAV_GROUPS.map((group, index) => {
          const Icon = group.icon;
          const isOpen = index === openIndex;
          const active = index === activeIndex;
          return (
            <button
              key={group.label}
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] tracking-wide transition-colors",
                active || isOpen ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{group.label}</span>
              {group.label === "Overview" ? (
                <AdminNavBadge count={notificationCount} variant="tab" />
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
