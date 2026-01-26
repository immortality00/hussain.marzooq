import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

type SearchParams = { [key: string]: string | string[] | undefined };

function hmacHex(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin/inquiries");

  const expectedRaw = process.env.ADMIN_PASSWORD;
  const expected = String(expectedRaw ?? "").trim();
  const secret = String(process.env.ADMIN_COOKIE_SECRET ?? "").trim();

  if (!expected || !secret) {
    redirect("/admin?error=config");
  }

  if (password !== expected) {
    redirect("/admin?error=wrong");
  }

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
  const error = String(sp?.error ?? "");

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your admin password to continue.
      </p>

      {error === "wrong" && (
        <div className="mt-6 rounded-2xl border bg-destructive/10 p-4 text-sm">
          Wrong password.
        </div>
      )}

      {error === "config" && (
        <div className="mt-6 rounded-2xl border bg-destructive/10 p-4 text-sm">
          Admin is not configured. Check <code>.env.local</code> for{" "}
          <code>ADMIN_PASSWORD</code> and <code>ADMIN_COOKIE_SECRET</code>, then
          restart the dev server.
        </div>
      )}

      <form action={login} className="mt-8 space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          autoComplete="current-password"
        />
        <input type="hidden" name="next" value={String(sp?.next ?? "")} />
        <button className="w-full rounded-xl bg-foreground px-3 py-2 text-sm text-background hover:opacity-90">
          Login
        </button>
      </form>
    </main>
  );
}