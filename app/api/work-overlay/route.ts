import { noStoreJson } from "@/app/api/_lib/common";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { DISCIPLINES } from "@/lib/disciplines";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function GET(req: Request) {
  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "work-overlay",
    key: getClientAddress(req),
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const pageSettings = await getAllPageSettings();
  const settingsBySlug = new Map(pageSettings.map((p) => [p.slug, p]));

  // The card image is admin-controlled per discipline (Work layout image). Empty
  // means no image — there is no auto-pick fallback.
  const cards = DISCIPLINES.filter(({ slug }) => settingsBySlug.get(slug)?.isActive).map(
    ({ slug, label, href }) => ({
      slug,
      label,
      href,
      imageUrl: settingsBySlug.get(slug)?.cardImage.url || null,
    }),
  );

  return noStoreJson(cards);
}
