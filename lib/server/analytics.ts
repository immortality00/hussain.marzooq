export type AnalyticsRow = { name: string; count: number };

export type AnalyticsStats = {
  configured: boolean;
  days: number;
  total: number;
  topPages: AnalyticsRow[];
  referrers: AnalyticsRow[];
  siteUrl: string | null;
};

export function goatCounterPeriod(now: Date, days: number): { start: string; end: string } {
  const end = new Date(now);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - days);
  return { start: start.toISOString(), end: end.toISOString() };
}

function toRows(
  items: unknown,
  nameKey: string,
): AnalyticsRow[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const rawName = record[nameKey];
      const name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : "(none)";
      const count = Number(record.count);
      return Number.isFinite(count) ? { name, count } : null;
    })
    .filter((row): row is AnalyticsRow => row !== null);
}

export async function getGoatCounterStats(days = 30): Promise<AnalyticsStats> {
  const code = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE?.trim();
  const token = process.env.GOATCOUNTER_API_TOKEN?.trim();
  const empty: AnalyticsStats = {
    configured: false,
    days,
    total: 0,
    topPages: [],
    referrers: [],
    siteUrl: code ? `https://${code}.goatcounter.com` : null,
  };
  if (!code || !token) return empty;

  const base = `https://${code}.goatcounter.com/api/v0`;
  const { start, end } = goatCounterPeriod(new Date(), days);
  const query = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const init = { headers, next: { revalidate: 300 } } as const;

  try {
    const [totalRes, hitsRes, refsRes] = await Promise.all([
      fetch(`${base}/stats/total?${query}`, init),
      fetch(`${base}/stats/hits?${query}&limit=10`, init),
      fetch(`${base}/stats/toprefs?${query}&limit=10`, init),
    ]);
    if (!totalRes.ok && !hitsRes.ok && !refsRes.ok) return { ...empty, configured: true };

    const totalJson = totalRes.ok ? await totalRes.json() : {};
    const hitsJson = hitsRes.ok ? await hitsRes.json() : {};
    const refsJson = refsRes.ok ? await refsRes.json() : {};

    const total = Number((totalJson as Record<string, unknown>)?.total) || 0;

    return {
      configured: true,
      days,
      total,
      topPages: toRows((hitsJson as Record<string, unknown>)?.hits, "path"),
      referrers: toRows((refsJson as Record<string, unknown>)?.refs, "name"),
      siteUrl: `https://${code}.goatcounter.com`,
    };
  } catch {
    return { ...empty, configured: true };
  }
}
