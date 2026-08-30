import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getGoatCounterStats, type AnalyticsRow } from "@/lib/server/analytics";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DAYS = 30;

export default async function AdminAnalytics() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/analytics");

  const stats = await getGoatCounterStats(DAYS);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Analytics"
        description={`Cookieless traffic from GoatCounter — last ${DAYS} days.`}
        actions={
          stats.siteUrl ? (
            <AdminButton
              href={stats.siteUrl}
              variant="ghost"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open GoatCounter
              <ExternalLink className="size-3.5" />
            </AdminButton>
          ) : undefined
        }
      />

      {!stats.configured ? (
        <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">
          <p className="text-foreground">Analytics is not configured yet.</p>
          <p className="mt-2 max-w-prose">
            Create a free site at goatcounter.com, then set{" "}
            <code className="font-mono text-xs">NEXT_PUBLIC_GOATCOUNTER_CODE</code> (your site
            code) and <code className="font-mono text-xs">GOATCOUNTER_API_TOKEN</code> (a
            read-statistics API key) in the deploy environment. The tracking script and this
            dashboard both stay dormant until they are set.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border bg-card p-5">
            <div className="font-mono text-4xl font-semibold tabular-nums tracking-tight">
              {stats.total.toLocaleString()}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Pageviews · last {stats.days} days
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <StatList title="Top pages" rows={stats.topPages} />
            <StatList title="Referrers" rows={stats.referrers} />
          </section>
        </>
      )}
    </div>
  );
}

function StatList({ title, rows }: { title: string; rows: AnalyticsRow[] }) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="border-b px-5 py-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-8 text-sm text-muted-foreground">No data yet.</div>
      ) : (
        <div className="divide-y">
          {rows.map((row) => (
            <div key={row.name} className="relative px-5 py-3">
              <div
                className="absolute inset-y-0 left-0 bg-accent/50"
                style={{ width: max > 0 ? `${(row.count / max) * 100}%` : "0%" }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between gap-4">
                <span className="truncate text-sm">{row.name}</span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {row.count.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
