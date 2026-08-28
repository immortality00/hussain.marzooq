"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  { label: "Overview", items: [{ href: "/admin/dashboard", label: "Dashboard" }] },
  {
    label: "Content",
    items: [
      { href: "/admin/media/list", label: "Media" },
      { href: "/admin/tags", label: "Tags" },
      { href: "/admin/pages", label: "Pages" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/people", label: "People" },
      { href: "/admin/removal-requests", label: "Removal Requests" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/inquiries", label: "Inquiries" },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/admin/services", label: "Services" },
      { href: "/admin/service-categories", label: "Service Categories" },
    ],
  },
  {
    label: "Private",
    items: [{ href: "/admin/private-galleries", label: "Private Galleries" }],
  },
];

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
