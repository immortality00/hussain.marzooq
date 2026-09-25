import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { isPushConfigured, sendAdminPush } from "@/lib/server/push";

export const dynamic = "force-dynamic";

export async function POST() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  if (!isPushConfigured()) {
    return noStoreJson({ ok: false, error: "Push is not configured on the server." }, { status: 503 });
  }

  const result = await sendAdminPush({
    title: "Hussain.Art admin",
    body: "Test notification — alerts for this device are working.",
    url: "/admin/dashboard",
  });

  return noStoreJson({ ok: true, ...result });
}
