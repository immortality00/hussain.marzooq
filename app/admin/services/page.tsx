"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  category: string; // category slug
  description: string;
  startingPrice: number | null;
  currency: string;
  isActive: boolean;
  imageUrl: string;
  order?: number; // used for reorder sorting
  inquiriesCount?: number; // from DB
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
};

type Draft = {
  name: string;
  category: string;
  description: string;
  startingPrice: string;
  currency: string;
  imageUrl: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getOkFlag(json: unknown): boolean | null {
  if (!isRecord(json)) return null;
  return typeof json.ok === "boolean" ? (json.ok as boolean) : null;
}

function getErrorField(json: unknown): string | null {
  if (!isRecord(json)) return null;
  return typeof json.error === "string" ? (json.error as string) : null;
}

function extractItems<T>(json: unknown): T[] {
  if (!isRecord(json)) return [];
  const items = json.items;
  return Array.isArray(items) ? (items as T[]) : [];
}

function safeString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function safeNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function toNumberOrNull(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function same(a: unknown, b: unknown): boolean {
  return a === b;
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

async function readJson(res: Response): Promise<unknown> {
  return (await res.json().catch(() => null)) as unknown;
}

function serviceSort(a: ServiceItem, b: ServiceItem): number {
  const ao = safeNumber(a.order, 0);
  const bo = safeNumber(b.order, 0);
  if (ao !== bo) return ao - bo;
  return safeString(a.name).localeCompare(safeString(b.name));
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);

  // Create form
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState<string>("");
  const [currency, setCurrency] = useState("AED");
  const [createImageUrl, setCreateImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [mode, setMode] = useState<"manage" | "reorder">("manage");

  // Reorder state (Active services only)
  const [orderedActiveIds, setOrderedActiveIds] = useState<string[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const cloudName = safeString(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, "");
  const uploadPreset = safeString(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, "");
  const uploadingEnabled = Boolean(cloudName && uploadPreset);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive).slice().sort((a, b) => safeNumber(a.order) - safeNumber(b.order)),
    [categories]
  );

  const activeServices = useMemo(
    () => services.filter((s) => s.isActive).slice().sort(serviceSort),
    [services]
  );
  const disabledServices = useMemo(
    () => services.filter((s) => !s.isActive).slice().sort(serviceSort),
    [services]
  );

  // Keep orderedActiveIds in sync with current active services
  useEffect(() => {
    const ids = activeServices.map((s) => s.id);
    setOrderedActiveIds((prev) => {
      if (prev.length === 0) return ids;
      const prevSet = new Set(prev);
      if (prev.length !== ids.length) return ids;
      for (const id of ids) if (!prevSet.has(id)) return ids;
      return prev;
    });
  }, [activeServices]);

  async function load() {
    setLoading(true);
    setMsg("");

    try {
      const [svcRes, catRes] = await Promise.all([
        fetch("/api/services?all=1", { cache: "no-store" }),
        fetch("/api/service-categories", { cache: "no-store" }),
      ]);

      const svcJson = await readJson(svcRes);
      const catJson = await readJson(catRes);

      const svcOk = getOkFlag(svcJson);
      const catOk = getOkFlag(catJson);

      if (!svcRes.ok || svcOk === false) {
        setMsg(getErrorField(svcJson) ?? "Load services failed.");
        setServices([]);
        setCategories([]);
        setDrafts({});
        setLoading(false);
        return;
      }

      if (!catRes.ok || catOk === false) {
        setMsg(getErrorField(catJson) ?? "Load categories failed.");
        setServices([]);
        setCategories([]);
        setDrafts({});
        setLoading(false);
        return;
      }

      const svcs = extractItems<ServiceItem>(svcJson);
      const cats = extractItems<CategoryItem>(catJson);

      setServices(svcs);
      setCategories(cats);

      // Default category selection in create form
      if (!categorySlug) {
        const first = cats
          .filter((c) => c.isActive)
          .slice()
          .sort((a, b) => safeNumber(a.order) - safeNumber(b.order))[0];
        if (first?.slug) setCategorySlug(first.slug);
      }

      // Initialize drafts
      setDrafts((prev) => {
        const next: Record<string, Draft> = { ...prev };

        for (const s of svcs) {
          if (!next[s.id]) {
            next[s.id] = {
              name: safeString(s.name, ""),
              category: safeString(s.category, "general"),
              description: safeString(s.description, ""),
              startingPrice: typeof s.startingPrice === "number" ? String(s.startingPrice) : "",
              currency: safeString(s.currency, "AED"),
              imageUrl: safeString(s.imageUrl, ""),
            };
          }
        }

        for (const k of Object.keys(next)) {
          if (!svcs.some((s) => s.id === k)) delete next[k];
        }

        return next;
      });

      setLoading(false);
    } catch (e: unknown) {
      setMsg(`Load failed: ${getErrorMessage(e)}`);
      setServices([]);
      setCategories([]);
      setDrafts({});
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadServiceImage(file: File): Promise<string> {
    if (!cloudName || !uploadPreset) throw new Error("Upload disabled: missing NEXT_PUBLIC Cloudinary vars");
    if (file.size > 25 * 1024 * 1024) throw new Error("File too large for service image (max 25MB).");

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);
    fd.append("folder", "hm_visuals/service_images");

    const res = await fetch(url, { method: "POST", body: fd });
    const data = (await res.json().catch(() => null)) as unknown;

    const secureUrl = isRecord(data) && typeof data.secure_url === "string" ? (data.secure_url as string) : null;
    if (!res.ok || !secureUrl) throw new Error("Upload failed.");
    return secureUrl;
  }

  async function createService() {
    setMsg("");
    const nm = name.trim();
    if (!nm) return setMsg("Service name is required.");
    if (!categorySlug.trim()) return setMsg("Please select a category first.");

    setSaving(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: nm,
          category: categorySlug.trim(),
          description: description.trim(),
          startingPrice: toNumberOrNull(startingPrice),
          currency: currency.trim() || "AED",
          imageUrl: createImageUrl.trim(),
        }),
      });

      const data = await readJson(res);
      const ok = getOkFlag(data);

      if (!res.ok || ok !== true) {
        setMsg(getErrorField(data) ?? "Save failed.");
        setSaving(false);
        return;
      }

      setName("");
      setDescription("");
      setStartingPrice("");
      setCreateImageUrl("");
      setMsg("✅ Saved.");
      await load();
    } catch (e: unknown) {
      setMsg(`Save failed: ${getErrorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function patchService(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(patch),
    });

    const data = await readJson(res);
    const ok = getOkFlag(data);

    if (!res.ok || ok !== true) {
      throw new Error(getErrorField(data) ?? "Update failed.");
    }
  }

  function setDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => {
      const base: Draft =
        prev[id] ?? { name: "", category: "general", description: "", startingPrice: "", currency: "AED", imageUrl: "" };
      return { ...prev, [id]: { ...base, ...patch } };
    });
  }

  async function saveService(id: string) {
    setMsg("");
    const s = services.find((x) => x.id === id);
    const d = drafts[id];
    if (!s || !d) return;

    const patch: Record<string, unknown> = {};

    const nextName = safeString(d.name, "").trim();
    const nextCategory = safeString(d.category, "").trim().toLowerCase();
    const nextDesc = safeString(d.description, "").trim();
    const nextCurrency = safeString(d.currency, "AED").trim().toUpperCase();
    const nextImageUrl = safeString(d.imageUrl, "").trim();
    const nextPrice = toNumberOrNull(safeString(d.startingPrice, ""));

    if (!nextName) return setMsg("Service name cannot be empty.");
    if (!nextCategory) return setMsg("Category cannot be empty.");

    if (!same(nextName, s.name)) patch.name = nextName;
    if (!same(nextCategory, s.category)) patch.category = nextCategory;
    if (!same(nextDesc, s.description)) patch.description = nextDesc;
    if (!same(nextCurrency, s.currency)) patch.currency = nextCurrency;

    const currentPrice = typeof s.startingPrice === "number" ? s.startingPrice : null;
    if (!same(nextPrice, currentPrice)) patch.startingPrice = nextPrice;

    const currentImage = safeString(s.imageUrl, "");
    if (!same(nextImageUrl, currentImage)) patch.imageUrl = nextImageUrl;

    if (Object.keys(patch).length === 0) {
      setMsg("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      await patchService(id, patch);
      setMsg("✅ Saved.");
      await load();
    } catch (e: unknown) {
      setMsg(`Save failed: ${getErrorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function disableService(id: string) {
    setMsg("");
    setSaving(true);
    try {
      await patchService(id, { isActive: false });
      setMsg("✅ Disabled.");
      await load();
    } catch (e: unknown) {
      setMsg(`Disable failed: ${getErrorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function enableService(id: string) {
    setMsg("");
    setSaving(true);
    try {
      await patchService(id, { isActive: true });
      setMsg("✅ Enabled.");
      await load();
    } catch (e: unknown) {
      setMsg(`Enable failed: ${getErrorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  }

  async function hardDeleteService(id: string) {
    setMsg("");
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${id}?hard=1`, { method: "DELETE", credentials: "include" });
      const data = await readJson(res);
      const ok = getOkFlag(data);

      if (!res.ok || ok !== true) throw new Error(getErrorField(data) ?? "Delete failed.");

      setMsg("✅ Deleted.");
      await load();
    } catch (e: unknown) {
      setMsg(`Delete failed: ${getErrorMessage(e)}`);
    } finally {
      setSaving(false);
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const activeId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId || activeId === overId) return;

    setOrderedActiveIds((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function saveOrder() {
    setMsg("");
    setSavingOrder(true);
    try {
      const ids = orderedActiveIds.filter((id) => activeServices.some((s) => s.id === id));
      const updates = ids.map((id, idx) => ({ id, order: (idx + 1) * 10 }));
      await Promise.all(updates.map((u) => patchService(u.id, { order: u.order })));
      setMsg("✅ Order saved.");
      await load();
    } catch (e: unknown) {
      setMsg(`Save order failed: ${getErrorMessage(e)}`);
    } finally {
      setSavingOrder(false);
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const noCategories = activeCategories.length === 0;
  const createPreview = safeString(createImageUrl, "").trim();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage services, then use <span className="font-medium">Reorder</span> to control how they appear publicly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("manage")}
            className={[
              "rounded-full border px-4 py-2 text-xs transition-colors",
              mode === "manage" ? "bg-foreground text-background" : "hover:bg-accent",
            ].join(" ")}
          >
            Manage
          </button>
          <button
            type="button"
            onClick={() => setMode("reorder")}
            className={[
              "rounded-full border px-4 py-2 text-xs transition-colors",
              mode === "reorder" ? "bg-foreground text-background" : "hover:bg-accent",
            ].join(" ")}
          >
            Reorder
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full border px-4 py-2 text-xs hover:bg-accent transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-2xl border p-4 text-sm text-muted-foreground">{msg}</div> : null}

      {mode === "reorder" ? (
        <div className="mt-8 rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Reorder Active Services</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Drag to reorder. This changes the order on the public <span className="font-medium">/services</span> page.
              </div>
            </div>

            <button
              type="button"
              onClick={() => void saveOrder()}
              disabled={savingOrder || orderedActiveIds.length === 0}
              className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {savingOrder ? "Saving..." : "Save order"}
            </button>
          </div>

          <div className="mt-5">
            {activeServices.length === 0 ? (
              <div className="text-sm text-muted-foreground">No active services yet.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={orderedActiveIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {orderedActiveIds.map((id) => {
                      const s = activeServices.find((x) => x.id === id);
                      if (!s) return null;
                      const count = safeNumber(s.inquiriesCount, 0);
                      return (
                        <SortableRow
                          key={id}
                          id={id}
                          title={s.name}
                          subtitle={`${safeString(s.category, "").toUpperCase()} • Inquiries: ${count}`}
                          imageUrl={safeString(s.imageUrl, "")}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      ) : (
        <>
          {noCategories ? (
            <div className="mt-6 rounded-2xl border p-6 text-sm text-muted-foreground">
              You have no active categories yet. Create one in{" "}
              <a className="underline" href="/admin/service-categories">
                Service Categories
              </a>
              .
            </div>
          ) : null}

          {/* Create */}
          <div className="mt-8 rounded-2xl border p-6 space-y-4">
            <div className="text-sm font-medium">Add service</div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Wedding Photography"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {activeCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Service image (optional)</label>

                {createPreview ? (
                  <div className="overflow-hidden rounded-2xl border">
                    <img src={createPreview} alt="Service preview" className="h-[140px] w-full object-cover" />
                  </div>
                ) : null}

                <input
                  value={createImageUrl}
                  onChange={(e) => setCreateImageUrl(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Paste image URL (Cloudinary recommended)"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <label className="rounded-full border px-3 py-1.5 text-xs hover:bg-accent transition-colors cursor-pointer">
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!uploadingEnabled || saving}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.currentTarget.value = "";

                        void (async () => {
                          setMsg("");
                          setSaving(true);
                          try {
                            const url = await uploadServiceImage(file);
                            setCreateImageUrl(url);
                            setMsg("✅ Uploaded. Now you can save the service.");
                          } catch (err: unknown) {
                            setMsg(`Upload failed: ${getErrorMessage(err)}`);
                          } finally {
                            setSaving(false);
                          }
                        })();
                      }}
                    />
                  </label>

                  {!uploadingEnabled ? (
                    <span className="text-xs text-muted-foreground">Upload disabled. Paste URL instead.</span>
                  ) : null}

                  {createImageUrl ? (
                    <button
                      type="button"
                      className="rounded-full border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                      onClick={() => setCreateImageUrl("")}
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[90px] w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Short luxury description that sells the service…"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Starting price (optional)</label>
                <input
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. 1500"
                  inputMode="decimal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="AED"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => void createService()}
                disabled={saving || !name.trim() || noCategories}
                className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save service"}
              </button>
            </div>
          </div>

          {/* Lists */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ServiceList
              title="Active services"
              items={activeServices}
              categories={categories}
              drafts={drafts}
              setDraft={setDraft}
              onSave={saveService}
              onDisable={disableService}
              onEnable={enableService}
              onDelete={hardDeleteService}
              onUpload={async (id, file) => {
                setMsg("");
                setSaving(true);
                try {
                  const url = await uploadServiceImage(file);
                  setDraft(id, { imageUrl: url });
                  setMsg("✅ Uploaded. Now press Save.");
                } catch (e: unknown) {
                  setMsg(`Upload failed: ${getErrorMessage(e)}`);
                } finally {
                  setSaving(false);
                }
              }}
              uploadingEnabled={uploadingEnabled}
              saving={saving}
              mode="active"
            />

            <ServiceList
              title="Disabled services"
              items={disabledServices}
              categories={categories}
              drafts={drafts}
              setDraft={setDraft}
              onSave={saveService}
              onDisable={disableService}
              onEnable={enableService}
              onDelete={hardDeleteService}
              onUpload={async (id, file) => {
                setMsg("");
                setSaving(true);
                try {
                  const url = await uploadServiceImage(file);
                  setDraft(id, { imageUrl: url });
                  setMsg("✅ Uploaded. Now press Save.");
                } catch (e: unknown) {
                  setMsg(`Upload failed: ${getErrorMessage(e)}`);
                } finally {
                  setSaving(false);
                }
              }}
              uploadingEnabled={uploadingEnabled}
              saving={saving}
              mode="disabled"
            />
          </div>
        </>
      )}
    </div>
  );
}

function SortableRow(props: { id: string; title: string; subtitle: string; imageUrl: string }) {
  const { id, title, subtitle, imageUrl } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={["flex items-center gap-3 rounded-2xl border bg-background p-3", isDragging ? "shadow-sm" : ""].join(" ")}
    >
      <button
        type="button"
        className="rounded-xl border px-3 py-2 text-xs hover:bg-accent transition-colors"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      <div className="h-12 w-16 overflow-hidden rounded-xl border bg-muted shrink-0">
        {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : null}
      </div>

      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}

function ServiceList(props: {
  title: string;
  items: ServiceItem[];
  categories: CategoryItem[];
  drafts: Record<string, Draft>;
  setDraft: (id: string, patch: Partial<Draft>) => void;
  onSave: (id: string) => void;
  onDisable: (id: string) => void;
  onEnable: (id: string) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  uploadingEnabled: boolean;
  saving: boolean;
  mode: "active" | "disabled";
}) {
  const { title, items, categories, drafts, setDraft, onSave, onDisable, onEnable, onDelete, onUpload, uploadingEnabled, saving, mode } =
    props;

  return (
    <div className="rounded-2xl border p-6">
      <div className="text-sm font-medium">{title}</div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {mode === "active" ? "No active services yet." : "No disabled services."}
          </div>
        ) : (
          items.map((s) => {
            const d: Draft =
              drafts[s.id] ?? {
                name: safeString(s.name, ""),
                category: safeString(s.category, "general"),
                description: safeString(s.description, ""),
                startingPrice: typeof s.startingPrice === "number" ? String(s.startingPrice) : "",
                currency: safeString(s.currency, "AED"),
                imageUrl: safeString(s.imageUrl, ""),
              };

            const imgUrl = safeString(d.imageUrl, "").trim();
            const inquiriesCount = safeNumber(s.inquiriesCount, 0);

            return (
              <div key={s.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{s.name}</div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                      Inquiries: <span className="text-foreground font-medium">{inquiriesCount}</span>
                    </span>

                    {mode === "active" ? (
                      <button
                        type="button"
                        onClick={() => void onDisable(s.id)}
                        className="rounded-full border px-3 py-1 text-xs hover:bg-accent transition-colors"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void onEnable(s.id)}
                        className="rounded-full border px-3 py-1 text-xs hover:bg-accent transition-colors"
                      >
                        Enable
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void onDelete(s.id)}
                      className="rounded-full border px-3 py-1 text-xs hover:bg-accent transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-1">
                    <div className="text-xs text-muted-foreground">Name</div>
                    <input
                      value={safeString(d.name, "")}
                      onChange={(e) => setDraft(s.id, { name: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Category</div>
                    <select
                      value={safeString(d.category, "general")}
                      onChange={(e) => setDraft(s.id, { category: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={safeString(c.slug, "general")}>
                          {safeString(c.name, "Category")} {c.isActive ? "" : "(disabled)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Service image (optional)</div>

                    {imgUrl ? (
                      <div className="mb-2 overflow-hidden rounded-2xl border">
                        <img src={imgUrl} alt="" className="h-[140px] w-full object-cover" />
                      </div>
                    ) : null}

                    <input
                      value={safeString(d.imageUrl, "")}
                      onChange={(e) => setDraft(s.id, { imageUrl: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Paste image URL (Cloudinary recommended)"
                    />

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="rounded-full border px-3 py-1.5 text-xs hover:bg-accent transition-colors cursor-pointer">
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={!uploadingEnabled || saving}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUpload(s.id, file);
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>

                      {!uploadingEnabled ? (
                        <span className="text-xs text-muted-foreground">Upload disabled. Paste URL instead.</span>
                      ) : null}

                      {imgUrl ? (
                        <button
                          type="button"
                          className="rounded-full border px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                          onClick={() => setDraft(s.id, { imageUrl: "" })}
                        >
                          Remove image
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <div className="text-xs text-muted-foreground">Description</div>
                    <textarea
                      value={safeString(d.description, "")}
                      onChange={(e) => setDraft(s.id, { description: e.target.value })}
                      className="min-h-[90px] w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Starting price</div>
                    <input
                      value={safeString(d.startingPrice, "")}
                      onChange={(e) => setDraft(s.id, { startingPrice: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      inputMode="decimal"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Currency</div>
                    <input
                      value={safeString(d.currency, "AED")}
                      onChange={(e) => setDraft(s.id, { currency: e.target.value })}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => void onSave(s.id)}
                      disabled={saving}
                      className="w-full rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}