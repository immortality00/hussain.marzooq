"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  startingPrice: number | null;
  currency: string;
};

type Props = {
  services: ServiceItem[];
  initialService?: string; // ObjectId OR slug OR name
  initialCategory?: string;
};

function safeTrim(v: string) {
  return v.trim().slice(0, 5000);
}

function isValidEmail(email: string) {
  const v = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function looksLikeObjectId(s: string) {
  return /^[a-fA-F0-9]{24}$/.test(s.trim());
}

export function ContactForm({ services, initialService = "", initialCategory = "" }: Props) {
  const router = useRouter();

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      const c = s.category?.trim();
      if (c) set.add(c);
    }
    set.add("others");
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const initialServiceMatch = useMemo(() => {
    const raw = initialService.trim();
    if (!raw) return null;

    if (looksLikeObjectId(raw)) {
      return services.find((s) => s.id === raw) ?? null;
    }

    const target = normalize(raw);

    const bySlug = services.find((s) => normalize(s.slug) === target);
    if (bySlug) return bySlug;

    const byName = services.find((s) => normalize(s.name) === target);
    if (byName) return byName;

    return null;
  }, [initialService, services]);

  const normalizedInitialCategory = safeTrim(initialCategory);
  const hasKnownInitialCategory = categories.some((c) => normalize(c) === normalize(normalizedInitialCategory));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [serviceMode, setServiceMode] = useState<"select" | "other">(
    initialServiceMatch ? "select" : initialService.trim() ? "other" : "select"
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceMatch?.id ?? "");
  const [otherService, setOtherService] = useState<string>(!initialServiceMatch ? initialService : "");

  const [categoryMode, setCategoryMode] = useState<"select" | "other">(() => {
    if (initialServiceMatch?.category) return "select";
    if (!normalizedInitialCategory) return "select";
    return hasKnownInitialCategory ? "select" : "other";
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialServiceMatch?.category) return initialServiceMatch.category;
    if (hasKnownInitialCategory) {
      return categories.find((c) => normalize(c) === normalize(normalizedInitialCategory)) ?? "others";
    }
    return "others";
  });

  const [otherCategory, setOtherCategory] = useState<string>(() => {
    if (!initialServiceMatch && normalizedInitialCategory && !hasKnownInitialCategory) {
      return normalizedInitialCategory;
    }
    return "";
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s) => s.id === selectedServiceId) ?? null;
  }, [selectedServiceId, services]);

  function handleSelectService(id: string) {
    setSelectedServiceId(id);
    const s = services.find((x) => x.id === id) ?? null;
    if (s) {
      setCategoryMode("select");
      setSelectedCategory(s.category || "others");
      setOtherCategory("");
    }
  }

  function setModeSelect() {
    setServiceMode("select");
    setOtherService("");
    if (selectedService?.category) {
      setCategoryMode("select");
      setSelectedCategory(selectedService.category);
      setOtherCategory("");
    }
  }

  function setModeOther() {
    setServiceMode("other");
    setSelectedServiceId("");
    if (!selectedCategory && !otherCategory) {
      setCategoryMode("select");
      setSelectedCategory("others");
    }
  }

  const finalServiceId = useMemo((): string | null => {
    if (serviceMode !== "select") return null;
    return selectedService?.id ? selectedService.id : null;
  }, [serviceMode, selectedService]);

  const finalServiceName = useMemo((): string | null => {
    if (serviceMode === "select") {
      return selectedService?.name ? selectedService.name.trim() : null;
    }
    const v = safeTrim(otherService);
    return v ? v : null;
  }, [otherService, selectedService, serviceMode]);

  const finalCategory = useMemo((): string | null => {
    if (serviceMode === "select") {
      return selectedService?.category ? safeTrim(selectedService.category) : null;
    }

    if (categoryMode === "other") {
      const v = safeTrim(otherCategory);
      return v ? v : null;
    }

    const v = safeTrim(selectedCategory);
    return v ? v : null;
  }, [serviceMode, selectedService, categoryMode, otherCategory, selectedCategory]);

  const bookingBadge = useMemo(() => {
    const s = finalServiceName?.trim();
    if (!s) return null;
    const c = finalCategory?.trim();
    return c ? `${s} • ${c}` : s;
  }, [finalServiceName, finalCategory]);

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setMsg("");

    setServiceMode(initialServiceMatch ? "select" : "select");
    setSelectedServiceId(initialServiceMatch?.id ?? "");
    setOtherService("");

    if (initialServiceMatch?.category) {
      setCategoryMode("select");
      setSelectedCategory(initialServiceMatch.category);
      setOtherCategory("");
      return;
    }

    if (normalizedInitialCategory) {
      if (hasKnownInitialCategory) {
        setCategoryMode("select");
        setSelectedCategory(
          categories.find((c) => normalize(c) === normalize(normalizedInitialCategory)) ?? "others"
        );
        setOtherCategory("");
      } else {
        setCategoryMode("other");
        setSelectedCategory("others");
        setOtherCategory(normalizedInitialCategory);
      }
      return;
    }

    setCategoryMode("select");
    setSelectedCategory("others");
    setOtherCategory("");
  }

  async function submit() {
    setMsg("");

    const n = safeTrim(name);
    const e = safeTrim(email);
    const m = safeTrim(message);

    if (!n) return setMsg("Name is required.");
    if (!e) return setMsg("Email is required.");
    if (!isValidEmail(e)) return setMsg("Email format is invalid.");
    if (!m) return setMsg("Message is required.");

    if (serviceMode === "other" && !safeTrim(otherService)) {
      return setMsg("Please specify the service you need.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          email: e,
          message: m,
          category: finalCategory,
          serviceId: finalServiceId,
          serviceName: finalServiceName,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setMsg(data?.error ? `Send failed: ${data.error}` : "Send failed.");
        setLoading(false);
        return;
      }

      resetForm();
      router.replace("/contact?success=1");
      router.refresh();
    } catch {
      setMsg("Send failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-6">
      {bookingBadge ? (
        <div className="mb-4 inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Booking: {bookingBadge}
        </div>
      ) : null}

      {msg ? <div className="mb-4 text-sm text-muted-foreground">{msg}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@email.com"
            inputMode="email"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Service</label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setModeSelect}
              className={`rounded-full border px-3 py-1.5 text-sm ${serviceMode === "select" ? "bg-accent" : "hover:bg-accent/40"}`}
            >
              Choose from list
            </button>
            <button
              type="button"
              onClick={setModeOther}
              className={`rounded-full border px-3 py-1.5 text-sm ${serviceMode === "other" ? "bg-accent" : "hover:bg-accent/40"}`}
            >
              Other (specify)
            </button>
          </div>

          {serviceMode === "select" ? (
            <select
              value={selectedServiceId}
              onChange={(e) => handleSelectService(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.startingPrice !== null ? ` — from ${s.currency} ${s.startingPrice}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={otherService}
              onChange={(e) => setOtherService(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe what you need"
            />
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Category</label>

          {serviceMode === "select" ? (
            <div className="rounded-xl border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {selectedService?.category || "Select a service to auto-fill category"}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryMode("select")}
                  className={`rounded-full border px-3 py-1.5 text-sm ${categoryMode === "select" ? "bg-accent" : "hover:bg-accent/40"}`}
                >
                  Choose category
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryMode("other")}
                  className={`rounded-full border px-3 py-1.5 text-sm ${categoryMode === "other" ? "bg-accent" : "hover:bg-accent/40"}`}
                >
                  Other category
                </button>
              </div>

              {categoryMode === "select" ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Type a category"
                />
              )}
            </>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tell me about your project"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading}
          className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send"}
        </button>

        <button
          type="button"
          onClick={resetForm}
          disabled={loading}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </div>
  );
}