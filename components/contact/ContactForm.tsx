"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ServiceItem = {
  id: string; // Mongo _id as string
  name: string;
  category: string;
  startingPrice: number | null;
  currency: string;
};

type Props = {
  services: ServiceItem[];
  initialService?: string;
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

export function ContactForm({ services, initialService = "", initialCategory = "" }: Props) {
  const router = useRouter();

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      const c = s.category?.trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [services]);

  // Try to preselect service by NAME if user arrived from /services?service=...
  const initialServiceMatch = useMemo(() => {
    const target = normalize(initialService);
    if (!target) return null;
    return services.find((s) => normalize(s.name) === target) ?? null;
  }, [initialService, services]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Service selection
  const [serviceMode, setServiceMode] = useState<"select" | "other">(
    initialServiceMatch ? "select" : initialService.trim() ? "other" : "select"
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceMatch?.id ?? "");
  const [otherService, setOtherService] = useState<string>(!initialServiceMatch ? initialService : "");

  // Category selection
  const initialCategoryFromService = initialServiceMatch?.category ?? "";
  const initialCategoryNormalized = normalize(initialCategory || initialCategoryFromService);
  const initialCategoryIsKnown = categories.some((c) => normalize(c) === initialCategoryNormalized);

  const [categoryMode, setCategoryMode] = useState<"select" | "other">(
    initialCategoryNormalized && !initialCategoryIsKnown ? "other" : "select"
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialServiceMatch?.category) return initialServiceMatch.category;
    if (initialCategoryIsKnown) {
      const found = categories.find((c) => normalize(c) === initialCategoryNormalized);
      return found ?? "";
    }
    return "";
  });

  const [otherCategory, setOtherCategory] = useState<string>(() => {
    if (initialCategoryNormalized && !initialCategoryIsKnown) return initialCategory;
    return "";
  });

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s) => s.id === selectedServiceId) ?? null;
  }, [selectedServiceId, services]);

  function handleSelectService(id: string) {
    setSelectedServiceId(id);
    const s = services.find((x) => x.id === id) ?? null;
    if (s && categoryMode === "select") {
      setSelectedCategory(s.category || "");
    }
  }

  const finalService = useMemo(() => {
    if (serviceMode === "other") return safeTrim(otherService) || null;
    return selectedService?.name ? selectedService.name : null;
  }, [otherService, selectedService, serviceMode]);

  const finalCategory = useMemo(() => {
    if (categoryMode === "other") return safeTrim(otherCategory) || null;
    const v = safeTrim(selectedCategory);
    return v ? v : null;
  }, [categoryMode, otherCategory, selectedCategory]);

  // ✅ THIS is the important piece:
  // Only send serviceId if user chose from list AND a real service is selected.
  const finalServiceId = useMemo(() => {
    if (serviceMode !== "select") return null;
    return selectedService?.id ? selectedService.id : null;
  }, [serviceMode, selectedService]);

  const bookingBadge = useMemo(() => {
    const s = finalService?.trim();
    if (!s) return null;
    const c = finalCategory?.trim();
    return c ? `${s} • ${c}` : s;
  }, [finalService, finalCategory]);

  async function submit() {
    setMsg("");

    const n = safeTrim(name);
    const e = safeTrim(email);
    const m = safeTrim(message);

    if (!n) return setMsg("Name is required.");
    if (!e || !isValidEmail(e)) return setMsg("Please enter a valid email.");
    if (!m) return setMsg("Message is required.");

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          email: e,
          message: m,

          // ✅ consistent structure
          serviceId: finalServiceId, // string | null
          serviceName: finalService, // string | null
          category: finalCategory, // string | null
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setMsg(data?.error ? `Send failed: ${data.error}` : "Send failed.");
        setLoading(false);
        return;
      }

      router.push("/contact?success=1");
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

        {/* Service */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Service</label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setServiceMode("select")}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                serviceMode === "select" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Choose from list
            </button>
            <button
              type="button"
              onClick={() => setServiceMode("other")}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                serviceMode === "other" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Other (please specify)
            </button>
          </div>

          {serviceMode === "select" ? (
            <select
              value={selectedServiceId}
              onChange={(e) => handleSelectService(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={otherService}
              onChange={(e) => setOtherService(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe what you need…"
            />
          )}
        </div>

        {/* Category */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Category (optional)</label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryMode("select")}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                categoryMode === "select" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Choose from list
            </button>
            <button
              type="button"
              onClick={() => setCategoryMode("other")}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                categoryMode === "other" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Other (please specify)
            </button>
          </div>

          {categoryMode === "select" ? (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a category…</option>
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
              placeholder="e.g. luxury fashion / festival / corporate…"
            />
          )}
        </div>

        {/* Message */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[140px] w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tell me date/location/idea + what you want…"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading}
          className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send"}
        </button>

        {msg ? <div className="text-sm text-muted-foreground">{msg}</div> : null}
      </div>
    </div>
  );
}