import { NextResponse } from "next/server";
import { currentAdminSession, setAdminSession } from "@/lib/auth/admin";
import { bumpSessionGeneration } from "@/lib/server/admin-security";

export const dynamic = "force-dynamic";

/** Ends every session and un-trusts every device, then signs this one back in under the new counter. */
export async function POST() {
  const session = await currentAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const generation = await bumpSessionGeneration();
  console.warn(`[admin-auth] signed out everywhere (generation ${generation})`);

  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  await setAdminSession(res, { remember: session.remember, generation, trust: true });
  return res;
}
