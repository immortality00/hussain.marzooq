import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminServiceWorker } from "@/components/admin/AdminServiceWorker";
import { AdminStickyRegion } from "@/components/admin/AdminStickyStack";
import { AdminButton } from "@/components/admin/AdminButton";
import { ADMIN_CONTENT_ID } from "@/components/admin/AdminPageCover";
import { AdminDataProvider } from "@/components/admin/AdminDataProvider";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminSessionNotice } from "@/components/admin/AdminSessionNotice";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <div className="mx-auto max-w-6xl px-2 pt-4 pb-24 md:px-4 md:py-8">
        <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
          <div>
            <span role="img" aria-label="Hussain.Art" className="hm-wordmark h-9" />
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AdminThemeToggle />
            <AdminButton href="/" variant="ghost" size="sm">
              View site
            </AdminButton>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <aside className="hidden rounded-2xl border bg-card p-3 shadow-[var(--shadow-soft)] md:block">
            <AdminSidebarNav />
          </aside>

          <section
            id={ADMIN_CONTENT_ID}
            className="relative rounded-2xl border bg-card p-3 shadow-[var(--shadow-soft)] md:p-5"
          >
            {children}
          </section>
        </div>
      </div>

      <AdminStickyRegion />
      <AdminSessionNotice />
      <AdminDataProvider />
      <AdminServiceWorker />
      <AdminMobileNav />
    </div>
  );
}
