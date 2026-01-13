import Link from "next/link";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  service: string | null;
  category: string | null;
  status: string;
  createdAt: string | null;
};

function looksTruthy(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "ok" || s.length > 10;
}

async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const knownNames = ["admin", "admin_auth", "admin_session", "admin_token", "hm_admin"];

  for (const name of knownNames) {
    const v = store.get(name)?.value;
    if (typeof v === "string" && looksTruthy(v)) return true;
  }

  for (const c of store.getAll()) {
    const name = c.name.toLowerCase();
    if (name.includes("admin") && looksTruthy(c.value)) return true;
  }

  return false;
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default async function AdminInquiriesPage() {
  const okAdmin = await isAdminRequest();

  if (!okAdmin) {
    return (
      <div className="rounded-2xl border p-6">
        <div className="text-sm font-medium">Unauthorized</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Please log in to view inquiries.
        </p>
        <div className="mt-4">
          <Link
            href="/admin"
            className="rounded-full border px-4 py-2 text-sm hover:bg-accent transition-colors inline-block"
          >
            Go to Admin login
          </Link>
        </div>
      </div>
    );
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("inquiries")
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const items: Inquiry[] = docs.map((d) => ({
    id: String(d._id),
    name: asString(d.name) ?? "",
    email: asString(d.email) ?? "",
    message: asString(d.message) ?? "",
    service: asString(d.service),
    category: asString(d.category),
    status: asString(d.status) ?? "new",
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inquiries</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New booking requests from Contact/Services.
          </p>
        </div>

        <Link
          href="/admin/inquiries"
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Refresh
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border p-6 text-sm text-muted-foreground">
          No inquiries yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col">
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.email}</div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {it.service ? (
                    <span className="rounded-full border px-3 py-1 text-xs">
                      {it.service}
                      {it.category ? (
                        <span className="text-muted-foreground"> • {it.category}</span>
                      ) : null}
                    </span>
                  ) : null}

                  <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    {it.status}
                  </span>

                  {it.createdAt ? (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(it.createdAt)}
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                {it.message}
              </p>

              <div className="mt-4 text-xs text-muted-foreground">
                ID: <span className="font-mono">{it.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}