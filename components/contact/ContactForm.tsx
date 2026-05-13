"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ContactCategorySelector from "./ContactCategorySelector";
import ContactIdentityFields from "./ContactIdentityFields";
import ContactMessageField from "./ContactMessageField";
import ContactServiceSelector from "./ContactServiceSelector";
import type { CategoryMode, ServiceItem, ServiceMode } from "./types";
import {
  findInitialServiceMatch,
  getServiceCategories,
  isValidEmail,
  normalize,
  safeTrim,
} from "./utils";

type Props = {
  services: ServiceItem[];
  initialService?: string;
  initialCategory?: string;
  initialContextMessage?: string;
};

export function ContactForm({
  services,
  initialService = "",
  initialCategory = "",
  initialContextMessage = "",
}: Props) {
  const router = useRouter();

  const categories = useMemo(() => getServiceCategories(services), [services]);

  const initialServiceMatch = useMemo(
    () => findInitialServiceMatch(services, initialService),
    [initialService, services]
  );

  const normalizedInitialCategory = safeTrim(initialCategory);
  const lockedContextMessage = safeTrim(initialContextMessage);

  const hasKnownInitialCategory = categories.some(
    (c) => normalize(c) === normalize(normalizedInitialCategory)
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [serviceMode, setServiceMode] = useState<ServiceMode>(
    initialServiceMatch ? "select" : initialService.trim() ? "other" : "select"
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceMatch?.id ?? "");
  const [otherService, setOtherService] = useState<string>(!initialServiceMatch ? initialService : "");

  const [categoryMode, setCategoryMode] = useState<CategoryMode>(() => {
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

    setServiceMode("select");
    setSelectedServiceId(initialServiceMatch?.id ?? "");
    setOtherService(!initialServiceMatch ? initialService : "");

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
    const userMessage = safeTrim(message);

    if (!n) return setMsg("Name is required.");
    if (!e) return setMsg("Email is required.");
    if (!isValidEmail(e)) return setMsg("Email format is invalid.");
    if (!userMessage) return setMsg("Message is required.");

    if (serviceMode === "other" && !safeTrim(otherService)) {
      return setMsg("Please specify the service you need.");
    }

    const composedMessage = lockedContextMessage
      ? `${lockedContextMessage}\n\nUser message:\n${userMessage}`
      : userMessage;

    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          email: e,
          message: composedMessage,
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
        <ContactIdentityFields
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
        />

        <ContactServiceSelector
          services={services}
          serviceMode={serviceMode}
          setModeSelect={setModeSelect}
          setModeOther={setModeOther}
          selectedServiceId={selectedServiceId}
          onSelectService={handleSelectService}
          otherService={otherService}
          setOtherService={setOtherService}
        />

        <ContactCategorySelector
          serviceMode={serviceMode}
          selectedService={selectedService}
          categoryMode={categoryMode}
          setCategoryMode={setCategoryMode}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          otherCategory={otherCategory}
          setOtherCategory={setOtherCategory}
          categories={categories}
        />

        <ContactMessageField
          message={message}
          setMessage={setMessage}
          contextMessage={lockedContextMessage}
        />
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