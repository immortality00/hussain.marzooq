"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ServiceItem = {
  id: string;
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
    // Ensure "others" always exists in list for select mode
    set.add("others");
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [services]);

  const initialServiceMatch = useMemo(() => {
    const target = normalize(initialService);
    if (!target) return null;
    return services.find((s) => normalize(s.name) === target) ?? null;
  }, [initialService, services]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [serviceMode, setServiceMode] = useState<"select" | "other">(
    initialServiceMatch ? "select" : initialService.trim() ? "other" : "select"
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceMatch?.id ?? "");
  const [otherService, setOtherService] = useState<string>(!initialServiceMatch ? initialService : "");

  const [message, setMessage] = useState("");

  // category state
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    // default to service category if preselected
    if (initialServiceMatch?.category) return initialServiceMatch.category;
    const ic = (initialCategory || "").trim();
    return ic ? ic : "others";
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s) => s.id === selectedServiceId) ?? null;
  }, [selectedServiceId, services]);

  const isOtherService = serviceMode === "other";

  function handleSelectService(id: string) {
    setSelectedServiceId(id);
    const s = services.find((x) => x.id === id) ?? null;
    if (s) setSelectedCategory(s.category || "others");
  }

  function setModeOther() {
    setServiceMode("other");
    setSelectedServiceId("");
    // ✅ Force category to others
    setSelectedCategory("others");
  }

  function setModeSelect() {
    setServiceMode("select");
    setOtherService("");
    // category will follow selected service when chosen
  }

  const finalServiceName = useMemo(() => {
    if (serviceMode === "other") return safeTrim(otherService) || null;
    return selectedService?.name ? selectedService.name : null;
  }, [otherService, selectedService, serviceMode]);

  const finalServiceId = useMemo(() => {
    if (serviceMode !== "select") return null;
    return selectedService?.id ? selectedService.id : null;
  }, [serviceMode, selectedService]);

  const finalCategory = useMemo(() => {
    // ✅ if other service, always others
    if (isOtherService) return "others";
    const v = safeTrim(selectedCategory);
    return v ? v : "others";
  }, [isOtherService, selectedCategory]);

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setMsg("");

    setServiceMode("select");
    setSelectedServiceId("");
    setOtherService("");
    setSelectedCategory("others");
  }

  async function submit() {
    setMsg("");

    const n = safeTrim(name);
    const e = safeTrim(email);
    const m = safeTrim(message);

    if (!n) return setMsg("Name is required.");
    if (!e || !isValidEmail(e)) return setMsg("Please enter a valid email.");
    if (!m) return setMsg("Message is required.");

    if (isOtherService && !safeTrim(otherService)) {
      return setMsg("Please specify what you need in the service field.");
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
          serviceId: finalServiceId,
          serviceName: finalServiceName,
          category: finalCategory,
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
      {msg ? <div className="mb-4 text-sm text-muted-foreground">{msg}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            inputMode="email"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Service</label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setModeSelect}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                serviceMode === "select" ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              Choose
            </button>
            <button
              type="button"
              onClick={setModeOther}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                serviceMode === "other" ? "bg-accent" : "hover:bg-accent/40"
              }`}
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

          {isOtherService ? (
            <div className="rounded-xl border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Others (auto)
            </div>
          ) : (
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
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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