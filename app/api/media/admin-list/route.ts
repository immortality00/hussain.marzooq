import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { listAdminMedia, listAdminMediaWithItems } from "@/lib/server/admin-media";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const params = new URL(req.url).searchParams;
  const page = params.get("full") === "1" ? await listAdminMediaWithItems(params) : await listAdminMedia(params);
  return noStoreJson({ ok: true, ...page });
}
