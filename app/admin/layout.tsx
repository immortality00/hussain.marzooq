import Link from "next/link";
import { cookies } from "next/headers";

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("hm_admin")?.value === "ok";

  // If not logged in, do NOT show admin chrome (sidebar/header)
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin/inquiries" className="font-semibold">
            HM Admin
          </Link>

          {/* Use a normal <a> to force a full reload on logout */}
          <a
            href="/admin/logout"
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            Logout
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
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
  );
}
