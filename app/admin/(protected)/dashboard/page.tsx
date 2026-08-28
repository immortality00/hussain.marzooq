import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Star,
  Inbox,
  ImageOff,
  EyeOff,
  UserX,
  Check,
  ChevronRight,
  Camera,
  Video,
  Clapperboard,
  Bitcoin,
  Palette,
  Users,
  Briefcase,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getAllPageSections, type HomeSections } from "@/lib/server/page-sections";
import { getAdminDashboardStats } from "@/lib/server/admin-dashboard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PAGE_ROWS, pageNeedsImage } from "../pages/lib/rows";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  photography: Camera,
  videography: Video,
  showreel: Clapperboard,
  nft: Bitcoin,
  art: Palette,
};

export default async function AdminDashboard() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/dashboard");

  const [stats, settings, sections] = await Promise.all([
    getAdminDashboardStats(),
    getAllPageSettings(),
    getAllPageSections(),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.slug, s]));
  const sectionsMap = Object.fromEntries(sections.map((s) => [s.slug, s.data]));

  const missingImage = PAGE_ROWS.filter((row) =>
    pageNeedsImage(row, {
      isActive: row.settingsSlug ? (settingsMap[row.settingsSlug]?.isActive ?? true) : true,
      cardImageUrl: row.settingsSlug ? settingsMap[row.settingsSlug]?.cardImage?.url : undefined,
      homeSections:
        row.sectionsSlug === "home" ? (sectionsMap["home"] as HomeSections | undefined) : undefined,
    }),
  ).length;

  const hidden = PAGE_ROWS.filter(
    (row) => row.settingsSlug && settingsMap[row.settingsSlug]?.isActive === false,
  ).length;

  const attention = [
    { icon: Star, label: "Testimonials to review", count: stats.testimonials.pending, href: "/admin/testimonials" },
    { icon: Inbox, label: "New inquiries", count: stats.inquiries.new, href: "/admin/inquiries" },
    { icon: UserX, label: "Removal requests", count: stats.removalRequests, href: "/admin/removal-requests" },
    { icon: ImageOff, label: "Pages missing an image", count: missingImage, href: "/admin/pages" },
    { icon: EyeOff, label: "Pages hidden from the site", count: hidden, href: "/admin/pages" },
  ];

  const categoryTotal = stats.media.byCategory.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-10">
      <AdminPageHeader title="Dashboard" />

      <section className="overflow-hidden rounded-2xl border">
        <div className="border-b px-5 py-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Needs attention
          </h2>
        </div>
        <div className="divide-y">
          {attention.map((item) => (
            <AttentionRow key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-4xl font-semibold tabular-nums tracking-tight">
                {stats.media.total}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Total media</div>
            </div>
            <div className="text-right font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <div>
                <span className="tabular-nums text-foreground">{stats.media.public}</span> public
              </div>
              <div className="mt-1">
                <span className="tabular-nums text-foreground">
                  {stats.media.total - stats.media.public}
                </span>{" "}
                hidden
              </div>
            </div>
          </div>

          {categoryTotal > 0 && (
            <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-muted">
              {stats.media.byCategory
                .filter((c) => c.count > 0)
                .map((c, i) => (
                  <div
                    key={c.key}
                    className="h-full"
                    style={{
                      width: `${(c.count / categoryTotal) * 100}%`,
                      backgroundColor: `color-mix(in oklch, var(--foreground) ${90 - i * 15}%, transparent)`,
                    }}
                  />
                ))}
            </div>
          )}

          <div className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {stats.media.byCategory.map((c) => {
              const Icon = CATEGORY_ICONS[c.key] ?? Camera;
              return (
                <Link
                  key={c.key}
                  href="/admin/media/list"
                  className="flex items-center gap-2.5 rounded-lg py-1 text-sm transition-colors hover:text-foreground"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-muted-foreground">{c.label}</span>
                  <span className="font-mono tabular-nums">{c.count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 content-start">
          <LibraryTile icon={Users} label="People" value={stats.people} href="/admin/people" />
          <LibraryTile icon={Briefcase} label="Services" value={stats.services} href="/admin/services" />
          <LibraryTile icon={Lock} label="Private galleries" value={stats.privateGalleries} href="/admin/private-galleries" />
          <LibraryTile icon={Star} label="Testimonials" value={stats.testimonials.total} href="/admin/testimonials" />
          <LibraryTile icon={Inbox} label="Active inquiries" value={stats.inquiries.active} href="/admin/inquiries" />
        </div>
      </section>
    </div>
  );
}

function AttentionRow({
  icon: Icon,
  label,
  count,
  href,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  href: string;
}) {
  const active = count > 0;
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
    >
      <span
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl border ${
          active ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "text-muted-foreground"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="flex-1 text-sm">{label}</span>
      <span
        className={`font-mono text-2xl font-semibold tabular-nums ${
          active ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/60"
        }`}
      >
        {count}
      </span>
      {active ? (
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      ) : (
        <Check className="size-4 text-muted-foreground/50" />
      )}
    </Link>
  );
}

function LibraryTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/40"
    >
      <Icon className="size-4 text-muted-foreground" />
      <div className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}
