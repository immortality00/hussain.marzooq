import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type SearchParams = { [key: string]: string | string[] | undefined };

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const nextPath = String(formData.get("next") ?? "/admin/inquiries");

  const expectedRaw = process.env.ADMIN_PASSWORD;
  const expected = String(expectedRaw ?? "").trim();

  if (!expected) {
    redirect("/admin?error=config");
  }

  if (password !== expected) {
    redirect("/admin?error=wrong");
  }

  // cookies() is async in your setup
  const cookieStore = await cookies();

  // ✅ RESTORE the original value your admin pages were built around
  cookieStore.set("hm_admin", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
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

  const nextPath = typeof sp.next === "string" ? sp.next : "/admin/inquiries";
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <main className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
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
          <code>ADMIN_PASSWORD</code>, then restart the dev server.
        </div>
      )}

      <form action={login} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
        >
          Login
        </button>
      </form>
    </main>
  );
}