import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const nav = [
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/media/list", label: "Media" },
  { href: "/admin/people", label: "People" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/service-categories", label: "Service Categories" },
  { href: "/admin/nfts", label: "NFTs" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/private-galleries", label: "Private Galleries" },
  { href: "/admin/removal-requests", label: "Removal Requests" },
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
          <aside className="rounded-2xl border p-3">
            <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
              Navigation
            </div>

            <div className="space-y-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-accent/40"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl border p-4">{children}</section>
        </div>
      </div>
    </div>
  );
}