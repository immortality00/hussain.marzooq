import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const nav = [
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/media/list", label: "Media" },
  { href: "/admin/showreel", label: "Showreel" },
  { href: "/admin/people", label: "People" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/nfts", label: "NFTs" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/private-galleries", label: "Private Galleries" },
  { href: "/admin/removal-requests", label: "Removal Requests" },
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin");

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="text-xl font-semibold">Admin</div>
          <Link
            href="/admin/logout"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-accent/40 transition-colors"
          >
            Logout
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </aside>

          <section>{children}</section>
        </div>
      </div>
    </div>
  );
}