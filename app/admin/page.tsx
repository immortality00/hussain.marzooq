import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAdminSessionCookies,
  isAdminPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import {
  clearFixedWindowRateLimit,
  consumeFixedWindowRateLimit,
  getFixedWindowRateLimitStatus,
} from "@/lib/server/request-guards";
import { getClientAddress } from "@/app/api/_lib/public-form-security";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getSafeNextPath(nextPath: string) {
  if (!nextPath.startsWith("/admin")) return "/admin/inquiries";
  if (nextPath === "/admin" || nextPath.startsWith("/admin?")) return "/admin/inquiries";

  return nextPath;
}

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin/inquiries");
  const adminCookieSecret = String(process.env.ADMIN_COOKIE_SECRET ?? "").trim();

  if (!isAdminPasswordConfigured() || !adminCookieSecret) {
    redirect("/admin?error=config");
  }

  const headerList = await headers();
  const clientKey = getClientAddress(headerList);

  const currentLimit = await getFixedWindowRateLimitStatus({
    bucket: "admin-login",
    key: clientKey,
    limit: MAX_LOGIN_ATTEMPTS,
  });

  if (currentLimit.limited) {
    redirect("/admin?error=locked");
  }

  if (!verifyAdminPassword(password)) {
    const updatedLimit = await consumeFixedWindowRateLimit({
      bucket: "admin-login",
      key: clientKey,
      limit: MAX_LOGIN_ATTEMPTS,
      windowMs: LOGIN_WINDOW_MS,
    });

    if (updatedLimit.limited) {
      redirect("/admin?error=locked");
    }

    redirect("/admin?error=wrong");
  }

  await clearFixedWindowRateLimit({
    bucket: "admin-login",
    key: clientKey,
  });

  const cookieStore = await cookies();

  for (const cookie of createAdminSessionCookies(adminCookieSecret)) {
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }

  redirect(getSafeNextPath(nextPath));
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const error = getSearchParamValue(params.error);
  const nextPath = getSearchParamValue(params.next);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-[2rem] border bg-background/80 p-7 shadow-sm backdrop-blur">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border text-xs tracking-[0.18em] text-muted-foreground">
          HM
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Admin</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter your admin password to manage HM Visuals content, inquiries, services, galleries,
          testimonials, and public pages.
        </p>

        {error === "wrong" ? (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Wrong password.
          </div>
        ) : null}

        {error === "locked" ? (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Too many failed attempts. Please wait before trying again.
          </div>
        ) : null}

        {error === "config" ? (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Admin is not configured. Check <code>.env.local</code> for{" "}
            <code>ADMIN_PASSWORD_HASH</code> and <code>ADMIN_COOKIE_SECRET</code>, then
            restart the dev server.
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

          <input type="hidden" name="next" value={nextPath} />

          <button className="w-full rounded-xl bg-foreground px-3 py-2 text-sm text-background hover:opacity-90">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}