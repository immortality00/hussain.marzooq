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
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
