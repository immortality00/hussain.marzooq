import Link from "next/link";

const nav = [
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/media", label: "Media (soon)" },
  { href: "/admin/people", label: "People (soon)" },
  { href: "/admin/services", label: "Services (soon)" },
  { href: "/admin/nfts", label: "NFTs (soon)" },
  { href: "/admin/testimonials", label: "Testimonials (soon)" },
  { href: "/admin/private-galleries", label: "Private Galleries (soon)" },
  { href: "/admin/removal-requests", label: "Removal Requests (soon)" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/admin/inquiries" className="font-semibold">
            HM Admin
          </Link>
          <Link
            href="/admin/logout"
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            Logout
          </Link>
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
