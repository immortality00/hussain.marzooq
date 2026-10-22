import { noStoreJson } from "@/app/api/_lib/common";
import { requireAdminObjectId } from "@/app/api/_lib/admin-route";
import { loadAdminSecurity } from "@/lib/server/admin-security-state";
import { removePasskey } from "@/lib/server/passkeys";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminObjectId(ctx);
  if (guard instanceof Response) return guard;

  const outcome = await removePasskey(guard.oid);
  if (outcome === "missing") return noStoreJson({ ok: false, error: "This passkey is already gone." }, { status: 404 });
  if (outcome === "last") return noStoreJson({ ok: false, error: "The last passkey can't be removed." }, { status: 409 });
  return noStoreJson({ ok: true, security: await loadAdminSecurity() });
}
