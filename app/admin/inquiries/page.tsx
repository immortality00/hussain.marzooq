import clientPromise from "@/lib/mongodb";

type Inquiry = {
  _id: string;
  name: string;
  email: string;
  service: string;
  location: string | null;
  message: string;
  status: string;
  createdAt: string;
};

export default async function AdminInquiriesPage() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("inquiries")
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const inquiries: Inquiry[] = docs.map((d) => ({
    _id: String(d._id),
    name: String(d.name ?? ""),
    email: String(d.email ?? ""),
    service: String(d.service ?? ""),
    location: d.location ? String(d.location) : null,
    message: String(d.message ?? ""),
    status: String(d.status ?? "new"),
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : "",
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Admin • Inquiries</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Latest 50 booking inquiries (read-only for now).
      </p>

      <div className="mt-8 space-y-4">
        {inquiries.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            No inquiries yet.
          </div>
        ) : (
          inquiries.map((q) => (
            <div key={q._id} className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{q.name}</div>
                <div className="text-xs text-muted-foreground">
                  {q.createdAt ? new Date(q.createdAt).toLocaleString() : ""}
                </div>
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{q.service}</span>
                {q.location ? <span> • {q.location}</span> : null}
                <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">
                  {q.status}
                </span>
              </div>

              <div className="mt-3 text-sm">{q.message}</div>

              <div className="mt-3 text-sm">
                <a className="underline" href={`mailto:${q.email}`}>
                  {q.email}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
