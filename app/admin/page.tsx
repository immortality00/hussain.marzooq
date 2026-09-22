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
} from "@/lib/server/request-guards";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { AdminLoginForm } from "./AdminLoginForm";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getSafeNextPath(nextPath: string) {
  if (!nextPath.startsWith("/admin")) return "/admin/dashboard";
  if (nextPath === "/admin" || nextPath.startsWith("/admin?")) return "/admin/dashboard";

  return nextPath;
}

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin/dashboard");
  const adminCookieSecret = String(process.env.ADMIN_COOKIE_SECRET ?? "").trim();

  if (!isAdminPasswordConfigured() || !adminCookieSecret) {
    redirect("/admin?error=config");
  }

  const headerList = await headers();
  const clientKey = getClientAddress(headerList);

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "admin-login",
    key: clientKey,
    limit: MAX_LOGIN_ATTEMPTS,
    windowMs: LOGIN_WINDOW_MS,
  });

  if (rateLimit.limited) {
    redirect("/admin?error=locked");
  }

  if (!verifyAdminPassword(password)) {
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
        <span role="img" aria-label="Hussain.Art" className="hm-wordmark h-12" />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Admin</h1>

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

        <AdminLoginForm login={login} nextPath={nextPath} />
      </div>
    </main>
  );
}