"use client";

import { AdminLink } from "@/components/admin/AdminLink";
import {
  Star,
  Inbox,
  ImageOff,
  EyeOff,
  UserX,
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
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PushNotificationsCard } from "@/components/admin/push/PushNotificationsCard";
import { DashboardCopy } from "@/components/admin/DashboardCopy";
import { useAdminPreview } from "@/hooks/useAdminData";
import { AttentionRow, LibraryTile } from "./DashboardParts";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  photography: Camera,
  videography: Video,
  showreel: Clapperboard,
  nft: Bitcoin,
  art: Palette,
};

export default function DashboardClient() {
  const snapshot = useAdminPreview();
  if (!snapshot) return null;
  const { stats, missingImage, hidden } = snapshot.dashboard;

  const attention = [
    { icon: Star, label: "Testimonials to review", count: stats.testimonials.pending, href: "/admin/testimonials" },
    { icon: Inbox, label: "New inquiries", count: stats.inquiries.new, href: "/admin/inquiries" },
    { icon: UserX, label: "Removal requests", count: stats.removalRequests, href: "/admin/removal-requests" },
    { icon: ImageOff, label: "Pages missing an image", count: missingImage, href: "/admin/pages" },
    { icon: EyeOff, label: "Pages hidden from the site", count: hidden, href: "/admin/pages" },
  ];

  const categoryTotal = stats.media.byCategory.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <div className="space-y-10">
        <DashboardCopy />
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
                  <AdminLink
                    key={c.key}
                    href="/admin/media/list"
                    className="flex items-center gap-2.5 rounded-lg py-1 text-sm transition-colors hover:text-foreground"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1 text-muted-foreground">{c.label}</span>
                    <span className="font-mono tabular-nums">{c.count}</span>
                  </AdminLink>
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

        <PushNotificationsCard publicKey={snapshot.push.publicKey} devices={snapshot.push.devices} />
      </div>
    </>
  );
}
