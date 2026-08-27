import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard" }],
  },
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

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">Admin</div>
            <div className="text-xs text-muted-foreground">HM Visuals</div>
          </div>

          <div className="flex items-center gap-3">
            <AdminThemeToggle />

            <Link
              href="/"
              className="rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-accent/40"
            >
              View site
            </Link>

            <Link
              href="/admin/logout"
              className="rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-accent/40"
            >
              Logout
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
          <aside className="space-y-4 rounded-2xl border p-3">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <div className="px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-accent/40"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </aside>

          <section className="rounded-2xl border p-4">{children}</section>
        </div>
      </div>
    </div>
  );
}
