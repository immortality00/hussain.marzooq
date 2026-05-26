import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";

type SearchParams = { [key: string]: string | string[] | undefined };

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const loginLockouts = new Map<string, number>();

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

function isLockedOut(clientKey: string) {
  const lockedUntil = loginLockouts.get(clientKey);
  if (!lockedUntil) return false;

  if (lockedUntil <= Date.now()) {
    loginLockouts.delete(clientKey);
    return false;
  }

  return true;
}

function registerFailedAttempt(clientKey: string) {
  const now = Date.now();
  const existing = loginAttempts.get(clientKey);

  if (!existing || existing.resetAt <= now) {
    loginAttempts.set(clientKey, {
      count: 1,
      resetAt: now + ATTEMPT_WINDOW_MS,
    });
    return;
  }

  existing.count += 1;

  if (existing.count >= MAX_ATTEMPTS) {
    loginLockouts.set(clientKey, now + LOCKOUT_MS);
    loginAttempts.delete(clientKey);
  }
}

function clearFailedAttempts(clientKey: string) {
  loginAttempts.delete(clientKey);
  loginLockouts.delete(clientKey);
}

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin/inquiries");
  const expectedRaw = process.env.ADMIN_PASSWORD;
  const expected = String(expectedRaw ?? "").trim();
  const secret = String(process.env.ADMIN_COOKIE_SECRET ?? "").trim();
  const headerList = await headers();
  const clientKey = `${getClientAddress(headerList)}|${headerList.get("user-agent") ?? ""}`;

  if (!expected || !secret) {
    redirect("/admin?error=config");
  }

  if (isLockedOut(clientKey)) {
    redirect("/admin?error=locked");
  }

  if (password !== expected) {
    registerFailedAttempt(clientKey);

    if (isLockedOut(clientKey)) {
      redirect("/admin?error=locked");
    }

    redirect("/admin?error=wrong");
  }

  clearFailedAttempts(clientKey);

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
          Admin is not configured. Check <code>.env.local</code> for{" "}
          <code>ADMIN_PASSWORD</code> and <code>ADMIN_COOKIE_SECRET</code>, then restart the dev
          server.
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