import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminPasswordConfigured, verifyAdminPassword } from "@/lib/auth/admin";
import {
  clearFixedWindowRateLimit,
  consumeFixedWindowRateLimit,
  getFixedWindowRateLimitStatus,
} from "@/lib/server/request-guards";

type SearchParams = { [key: string]: string | string[] | undefined };

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function hmacHex(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function getClientAddress(headerList: Awaited<ReturnType<typeof headers>>) {
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerList.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "anonymous";
}

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin/inquiries");
  const secret = String(process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  const headerList = await headers();
  const clientKey = `${getClientAddress(headerList)}|${headerList.get("user-agent") ?? ""}`;

  if (!isAdminPasswordConfigured() || !secret) {
    redirect("/admin?error=config");
  }

  const status = await getFixedWindowRateLimitStatus({
    bucket: "admin-login",
    key: clientKey,
    limit: MAX_ATTEMPTS,
  });

  if (status.limited) {
    redirect("/admin?error=locked");
  }

  if (!verifyAdminPassword(password)) {
    const afterFailure = await consumeFixedWindowRateLimit({
      bucket: "admin-login",
      key: clientKey,
      limit: MAX_ATTEMPTS,
      windowMs: ATTEMPT_WINDOW_MS,
    });

    if (afterFailure.limited) {
      redirect("/admin?error=locked");
    }

    redirect("/admin?error=wrong");
  }

  await clearFixedWindowRateLimit({ bucket: "admin-login", key: clientKey });

  const cookieStore = await cookies();
  const sig = hmacHex("ok", secret);

  cookieStore.set("hm_admin", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("hm_admin_sig", sig, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const safeNext = nextPath.startsWith("/") ? nextPath : "/admin/inquiries";
  redirect(safeNext);
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const error = getSearchParamValue(sp?.error);
  const nextValue = getSearchParamValue(sp?.next);

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your admin password to continue.
      </p>

      {error === "wrong" ? (
        <div className="mt-6 rounded-2xl border bg-destructive/10 p-4 text-sm">
          Wrong password.
        </div>
      ) : null}

      {error === "locked" ? (
        <div className="mt-6 rounded-2xl border bg-destructive/10 p-4 text-sm">
          Too many failed attempts. Please wait before trying again.
        </div>
      ) : null}

      {error === "config" ? (
        <div className="mt-6 rounded-2xl border bg-destructive/10 p-4 text-sm">
          Admin is not configured. Check <code>.env.local</code> for <code>ADMIN_PASSWORD_HASH</code>{" "}
          or <code>ADMIN_PASSWORD</code> and <code>ADMIN_COOKIE_SECRET</code>, then restart the
          dev server.
        </div>
      ) : null}

      <form action={login} className="mt-8 space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          autoComplete="current-password"
          required
        />
        <input type="hidden" name="next" value={nextValue} />
        <button className="w-full rounded-xl bg-foreground px-3 py-2 text-sm text-background hover:opacity-90">
          Login
        </button>
      </form>
    </main>
  );
}