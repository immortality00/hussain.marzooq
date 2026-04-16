"use client";

import { useMemo, useState, useEffect } from "react";
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
  initialServiceId?: string; // ✅ service ObjectId passed from /services/[slug]
  initialService?: string;   // slug or name fallback
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

type FieldErrors = Partial<Record<"name" | "email" | "service" | "message", string>>;

export function ContactForm({
  services,
  initialServiceId = "",
  initialService = "",
  initialCategory = "",
}: Props) {
  const router = useRouter();

  const servicesNormalized = useMemo(() => {
    return services.map((s) => ({
      ...s,
      _nSlug: normalize(s.slug ?? ""),
      _nName: normalize(s.name),
    }));
  }, [services]);

  // ✅ Determine preselected service by ID first
  const preselectedById = useMemo(() => {
    const sid = initialServiceId.trim();
    if (!sid || !looksLikeObjectId(sid)) return null;
    return servicesNormalized.find((s) => s.id === sid) ?? null;
  }, [initialServiceId, servicesNormalized]);

  // fallback: slug/name
  const preselectedByText = useMemo(() => {
    const target = normalize(initialService);
    if (!target) return null;
    const bySlug = servicesNormalized.find((s) => s._nSlug && s._nSlug === target);
    if (bySlug) return bySlug;
    const byName = servicesNormalized.find((s) => s._nName === target);
    if (byName) return byName;
    return null;
  }, [initialService, servicesNormalized]);

  const preselected = preselectedById ?? preselectedByText;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ✅ If we have a preselected service, start in SELECT mode
  const [serviceMode, setServiceMode] = useState<"select" | "other">(preselected ? "select" : "select");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselected?.id ?? "");
  const [otherService, setOtherService] = useState<string>("");

  const [message, setMessage] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (preselected?.category) return preselected.category;
    return initialCategory.trim() || "others";
  });

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return servicesNormalized.find((s) => s.id === selectedServiceId) ?? null;
  }, [selectedServiceId, servicesNormalized]);

  const isOtherService = serviceMode === "other";

  // ✅ When a service is selected, category follows service
  useEffect(() => {
    if (serviceMode !== "select") return;
    if (!selectedService) return;
    setSelectedCategory(selectedService.category?.trim() || "others");
  }, [serviceMode, selectedService]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of servicesNormalized) {
      const c = (s.category ?? "").trim();
      if (c) set.add(c);
    }
    set.add("others");
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [servicesNormalized]);

  function handleSelectService(id: string) {
    setSelectedServiceId(id);
    const s = servicesNormalized.find((x) => x.id === id) ?? null;
    if (s) setSelectedCategory(s.category?.trim() || "others");
  }

  function setModeOther() {
    setServiceMode("other");
    setSelectedServiceId("");
    setOtherService("");
    setSelectedCategory("others");
  }

  function setModeSelect() {
    setServiceMode("select");
    setOtherService("");
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
    if (isOtherService) return "others";
    const v = safeTrim(selectedCategory);
    return v ? v : "others";
  }, [isOtherService, selectedCategory]);

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setBanner("");
    setErrors({});
    setServiceMode("select");
    setSelectedServiceId(preselected?.id ?? "");
    setOtherService("");
    setSelectedCategory(preselected?.category ?? "others");
  }

  function validate(): boolean {
    const e: FieldErrors = {};
    const n = safeTrim(name);
    const em = safeTrim(email);
    const m = safeTrim(message);

    if (!n) e.name = "Name is required.";
    if (!em) e.email = "Email is required.";
    else if (!isValidEmail(em)) e.email = "Email format is invalid.";
    if (isOtherService && !safeTrim(otherService)) e.service = "Please specify the service you need.";
    if (!m) e.message = "Message is required.";

    setErrors(e);
    setBanner(e.name ?? e.email ?? e.service ?? e.message ?? "");
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setBanner("");
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: safeTrim(name),
          email: safeTrim(email),
          message: safeTrim(message),
          serviceId: finalServiceId,
          serviceName: finalServiceName,
          category: finalCategory,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner(data?.error ? `Send failed: ${data.error}` : "Send failed.");
        setLoading(false);
        return;
      }

      resetForm();
      router.replace("/contact?success=1");
      router.refresh();
    } catch {
      setBanner("Send failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring ${
      hasError ? "border-red-500/60 focus:ring-red-500/30" : ""
    }`;

  return (
    <div className="rounded-2xl border p-6">
      {banner ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">{banner}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass(!!errors.name)} />
          {errors.name ? <div className="text-xs text-red-500/80">{errors.name}</div> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email *</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(!!errors.email)} inputMode="email" />
          {errors.email ? <div className="text-xs text-red-500/80">{errors.email}</div> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Service</label>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={setModeSelect} className={`rounded-full border px-3 py-1.5 text-sm ${serviceMode === "select" ? "bg-accent" : "hover:bg-accent/40"}`}>
              Choose
            </button>
            <button type="button" onClick={setModeOther} className={`rounded-full border px-3 py-1.5 text-sm ${serviceMode === "other" ? "bg-accent" : "hover:bg-accent/40"}`}>
              Other (specify)
            </button>
          </div>

          {serviceMode === "select" ? (
            <select value={selectedServiceId} onChange={(e) => handleSelectService(e.target.value)} className={inputClass(false)}>
              <option value="">Select…</option>
              {servicesNormalized.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          ) : (
            <input value={otherService} onChange={(e) => setOtherService(e.target.value)} className={inputClass(!!errors.service)} placeholder="Describe what you need" />
          )}
          {errors.service ? <div className="text-xs text-red-500/80">{errors.service}</div> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Category</label>
          {isOtherService ? (
            <div className="rounded-xl border bg-muted px-3 py-2 text-sm text-muted-foreground">Others (auto)</div>
          ) : (
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputClass(false)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Message *</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass(!!errors.message)} h-32`} />
          {errors.message ? <div className="text-xs text-red-500/80">{errors.message}</div> : null}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={() => void submit()} disabled={loading} className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 disabled:opacity-60">
          {loading ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={resetForm} disabled={loading} className="rounded-xl border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60">
          Reset
        </button>
      </div>
    </div>
  );
}