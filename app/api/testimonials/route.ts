import { requireAdminOr401 } from "@/lib/auth/admin";
import { listAdminTestimonials } from "@/lib/server/admin-lists";
import { noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  return noStoreJson({ ok: true, items: await listAdminTestimonials() });
}
