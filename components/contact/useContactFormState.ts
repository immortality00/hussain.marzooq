"use client";

import { useMemo, useState } from "react";
import { useFormToken } from "@/hooks/useFormToken";
import type { FormStatusState } from "@/components/shared/FormStatus";
import type { CategoryMode, ServiceItem, ServiceMode } from "./types";
import {
  findInitialServiceMatch,
  getServiceCategories,
  isValidEmail,
  normalize,
  safeTrim,
} from "./utils";

export function useContactFormState({
  services,
  initialService = "",
  initialCategory = "",
  initialContextMessage = "",
}: {
  services: ServiceItem[];
  initialService?: string;
  initialCategory?: string;
  initialContextMessage?: string;
}) {
  const formToken = useFormToken("inquiry");

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
  const [website, setWebsite] = useState("");

  const [serviceMode, setServiceMode] = useState<ServiceMode>(
    initialServiceMatch ? "select" : initialService.trim() ? "other" : "select"
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceMatch?.id ?? "");
  const [otherService, setOtherService] = useState<string>(
    !initialServiceMatch ? initialService : ""
  );

  const [categoryMode, setCategoryMode] = useState<CategoryMode>(() => {
    if (initialServiceMatch?.category) return "select";
    if (!normalizedInitialCategory) return "select";
    return hasKnownInitialCategory ? "select" : "other";
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialServiceMatch?.category) return initialServiceMatch.category;
    if (hasKnownInitialCategory) {
      return (
        categories.find((c) => normalize(c) === normalize(normalizedInitialCategory)) ?? "others"
      );
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
  const [status, setStatus] = useState<FormStatusState>(null);
  const fail = (text: string) => setStatus({ type: "err", text });

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s) => s.id === selectedServiceId) ?? null;
  }, [selectedServiceId, services]);

  function handleSelectService(id: string) {
    setSelectedServiceId(id);
    const service = services.find((x) => x.id === id) ?? null;
    if (service) {
      setCategoryMode("select");
      setSelectedCategory(service.category || "others");
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
    const value = safeTrim(otherService);
    return value ? value : null;
  }, [otherService, selectedService, serviceMode]);

  const finalCategory = useMemo((): string | null => {
    if (serviceMode === "select") {
      return selectedService?.category ? safeTrim(selectedService.category) : null;
    }

    if (categoryMode === "other") {
      const value = safeTrim(otherCategory);
      return value ? value : null;
    }

    const value = safeTrim(selectedCategory);
    return value ? value : null;
  }, [serviceMode, selectedService, categoryMode, otherCategory, selectedCategory]);

  const bookingBadge = useMemo(() => {
    const service = finalServiceName?.trim();
    if (!service) return null;
    const category = finalCategory?.trim();
    return category ? `${service} • ${category}` : service;
  }, [finalServiceName, finalCategory]);

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setWebsite("");
    formToken.renew();
    setStatus(null);

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
    setStatus(null);

    const n = safeTrim(name);
    const e = safeTrim(email);
    const userMessage = safeTrim(message);
    const honeypot = safeTrim(website);

    if (!n) return fail("Name is required.");
    if (!e) return fail("Email is required.");
    if (!isValidEmail(e)) return fail("Email format is invalid.");
    if (!userMessage) return fail("Message is required.");

    if (serviceMode === "select" && !selectedService?.id) {
      return fail("Please choose a service.");
    }

    if (serviceMode === "other" && !safeTrim(otherService)) {
      return fail("Please specify the service you need.");
    }

    if (!finalCategory) {
      return fail("Please choose a category.");
    }

    const composedMessage = lockedContextMessage
      ? `${lockedContextMessage}\n\nUser message:\n${userMessage}`
      : userMessage;

    setLoading(true);
    const issued = await formToken.take();
    if ("error" in issued) {
      fail(`Not sent: ${issued.error}`);
      setLoading(false);
      return;
    }
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
          website: honeypot,
          formToken: issued.token,
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };

      if (!res.ok || !data?.ok) {
        fail(`Not sent: ${data?.error ?? `error ${res.status}`}`);
        setLoading(false);
        return;
      }

      resetForm();
      setStatus({ type: "ok", text: "Sent. I'll get back to you soon." });
    } catch {
      fail("Not sent: no connection.");
    } finally {
      setLoading(false);
    }
  }

  return {
    categories,
    lockedContextMessage,
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    website,
    setWebsite,
    serviceMode,
    setServiceMode,
    selectedServiceId,
    setSelectedServiceId,
    otherService,
    setOtherService,
    categoryMode,
    setCategoryMode,
    selectedCategory,
    setSelectedCategory,
    otherCategory,
    setOtherCategory,
    loading,
    status,
    selectedService,
    handleSelectService,
    setModeSelect,
    setModeOther,
    bookingBadge,
    resetForm,
    submit,
    prime: formToken.prime,
  };
}