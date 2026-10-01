import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { getGoatCounterStats } from "@/lib/server/analytics";
import { ANALYTICS_DAYS } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  return noStoreJson({ ok: true, stats: await getGoatCounterStats(ANALYTICS_DAYS) });
}
