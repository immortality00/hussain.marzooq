import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminButton } from "@/components/admin/AdminButton";
import { getAdminNotificationCount } from "@/lib/server/admin-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin");

  const notificationCount = await getAdminNotificationCount();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="text-xl font-semibold tracking-tight">HM Visuals</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AdminThemeToggle />
            <AdminButton href="/" variant="ghost" size="sm">
              View site
            </AdminButton>
            <AdminButton href="/admin/logout" variant="ghost" size="sm">
              Logout
            </AdminButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <aside className="rounded-2xl border bg-card p-3 shadow-[var(--shadow-soft)]">
            <AdminSidebarNav notificationCount={notificationCount} />
          </aside>

          <section className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
