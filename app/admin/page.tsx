import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  createAdminSessionCookies,
  isAdminPasswordConfigured,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { safeAdminNextPath } from "@/lib/auth/admin-next-path";
import {
  clearFixedWindowRateLimit,
  consumeFixedWindowRateLimit,
} from "@/lib/server/request-guards";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { AdminLoginForm } from "./AdminLoginForm";
import { LoginNotice } from "./LoginNotice";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "");
  const remember = formData.get("remember") === "on";
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

  after(() =>
    clearFixedWindowRateLimit({
      bucket: "admin-login",
      key: clientKey,
    })
  );

  const cookieStore = await cookies();

  for (const cookie of await createAdminSessionCookies(adminCookieSecret, remember)) {
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }

  redirect(safeAdminNextPath(nextPath));
}

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-[2rem] border bg-background/80 p-7 shadow-sm backdrop-blur">
        <span role="img" aria-label="Hussain.Art" className="hm-wordmark h-12" />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Admin</h1>

        <Suspense fallback={null}>
          <LoginNotice />
        </Suspense>

        <AdminLoginForm login={login} />
      </div>
    </main>
  );
}
