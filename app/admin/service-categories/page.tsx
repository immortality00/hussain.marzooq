import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
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
    const n = c.name.toLowerCase();
    if (n.includes("admin") && looksTruthy(c.value)) return true;
  }

  return false;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

async function getCategories(): Promise<Category[]> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("service_categories")
    .find({})
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  return docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
  }));
}

type CategoryCountRow = {
  _id: unknown;
  count: unknown;
};

async function getServiceCountsByCategory(): Promise<Record<string, number>> {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const rows = await db
    .collection("services")
    .aggregate<CategoryCountRow>([{ $group: { _id: "$category", count: { $sum: 1 } } }])
    .toArray();

  const out: Record<string, number> = {};
  for (const r of rows) {
    const key = asString(r._id) ?? "";
    const count = typeof r.count === "number" && Number.isFinite(r.count) ? r.count : 0;
    if (key) out[key] = count;
  }
  return out;
}

/* -------------------- Server Actions -------------------- */

async function requireAdmin() {
  const ok = await isAdminRequest();
  if (!ok) throw new Error("Unauthorized");
}

async function addCategoryAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const slug = slugify(name);
  if (!slug) return;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const exists = await db.collection("service_categories").findOne({ slug });
  if (exists) return;

  await db.collection("service_categories").insertOne({
    name,
    slug,
    isActive: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/contact");
}

async function renameCategoryAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const newName = String(formData.get("name") ?? "").trim();

  if (!ObjectId.isValid(id)) return;
  if (!newName) return;

  const newSlug = slugify(newName);
  if (!newSlug) return;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const existing = await db.collection("service_categories").findOne({ _id: new ObjectId(id) });
  if (!existing) return;

  const oldSlug = typeof existing.slug === "string" ? existing.slug : "";

  if (newSlug !== oldSlug) {
    const dup = await db.collection("service_categories").findOne({ slug: newSlug });
    if (dup) return;

    await db.collection("service_categories").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: newName, slug: newSlug, updatedAt: new Date() } }
    );

    if (oldSlug) {
      await db.collection("services").updateMany(
        { category: oldSlug },
        { $set: { category: newSlug, updatedAt: new Date() } }
      );
    }
  } else {
    await db.collection("service_categories").updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: newName, updatedAt: new Date() } }
    );
  }

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/contact");
}

async function toggleCategoryAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "").trim() === "1";

  if (!ObjectId.isValid(id)) return;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("service_categories").updateOne(
    { _id: new ObjectId(id) },
    { $set: { isActive, updatedAt: new Date() } }
  );

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/contact");
}

async function deleteCategoryAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!ObjectId.isValid(id)) return;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const cat = await db.collection("service_categories").findOne({ _id: new ObjectId(id) });
  if (!cat) return;

  const slug = typeof cat.slug === "string" ? cat.slug : "";

  if (slug) {
    await db.collection("services").updateMany(
      { category: slug },
      { $set: { category: "general", updatedAt: new Date() } }
    );
  }

  await db.collection("service_categories").deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/service-categories");
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/contact");
}

/* -------------------- Page -------------------- */

export default async function AdminServiceCategoriesPage() {
  const okAdmin = await isAdminRequest();
  if (!okAdmin) {
    return (
      <div className="rounded-2xl border p-6">
        <div className="text-sm font-medium">Unauthorized</div>
        <p className="mt-2 text-sm text-muted-foreground">Please log in to manage categories.</p>
      </div>
    );
  }

  const [cats, counts] = await Promise.all([getCategories(), getServiceCountsByCategory()]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Service Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Central categories used across Services page + Booking form + Admin.
          </p>
        </div>

        <a
          href="/admin/service-categories"
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Refresh
        </a>
      </div>

      {/* Add */}
      <div className="mt-8 rounded-2xl border p-6">
        <div className="text-sm font-medium">Add category</div>
        <form action={addCategoryAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name="name"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. weddings, portraits, videography, dance…"
          />
          <button
            type="submit"
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </form>

        <p className="mt-3 text-xs text-muted-foreground">
          Category slug is generated automatically (used internally for filters).
        </p>
      </div>

      {/* List */}
      <div className="mt-8">
        {cats.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            No categories yet. Add your first category above.
          </div>
        ) : (
          <div className="space-y-3">
            {cats.map((c) => (
              <div key={c.id} className="rounded-2xl border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">
                      {c.name}{" "}
                      {!c.isActive ? <span className="text-xs text-muted-foreground">(disabled)</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      slug: <span className="font-mono">{c.slug}</span> • services:{" "}
                      <span className="font-mono">{counts[c.slug] ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={toggleCategoryAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="isActive" value={c.isActive ? "0" : "1"} />
                      <button
                        type="submit"
                        className="rounded-full border px-3 py-1 text-xs hover:bg-accent transition-colors"
                      >
                        {c.isActive ? "Disable" : "Enable"}
                      </button>
                    </form>

                    <form action={deleteCategoryAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-full border px-3 py-1 text-xs hover:bg-accent transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                {/* Rename */}
                <form action={renameCategoryAction} className="mt-4 grid gap-3 md:grid-cols-3">
                  <input type="hidden" name="id" value={c.id} />
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground">Rename</div>
                    <input
                      name="name"
                      defaultValue={c.name}
                      className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Renaming updates the slug and migrates services automatically.
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
                    >
                      Save rename
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}