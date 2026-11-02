"use client";

import { type RefObject, useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useFormToken } from "@/hooks/useFormToken";
import type { FormStatusState } from "@/components/shared/FormStatus";
import type { CategoryMode, ContactPrefill, ServiceChoice, ServiceItem, ServiceMode } from "./types";
import { getServiceCategories, isValidEmail, NO_PREFILL, safeTrim, samePrefill, startingChoice } from "./utils";

function typedValue(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

export function useContactFormState(services: ServiceItem[], formRef: RefObject<HTMLFormElement | null>) {
  const formToken = useFormToken("inquiry");

  const categories = useMemo(() => getServiceCategories(services), [services]);

  // The booking details arrive from the address once the page has loaded (ContactUrlParams).
  const [prefill, setPrefill] = useState<ContactPrefill>(NO_PREFILL);
  const [appliedPrefill, setAppliedPrefill] = useState<ContactPrefill>(NO_PREFILL);
  const applyUrl = useCallback(
    (next: ContactPrefill) => setPrefill((current) => (samePrefill(current, next) ? current : next)),
    []
  );
  const start = useMemo(() => startingChoice(services, categories, prefill), [services, categories, prefill]);
  const lockedContextMessage = safeTrim(prefill.context);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");

  const [serviceMode, setServiceMode] = useState<ServiceMode>(start.serviceMode);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(start.serviceId);
  const [otherService, setOtherService] = useState<string>(start.otherService);
  const [categoryMode, setCategoryMode] = useState<CategoryMode>(start.categoryMode);
  const [selectedCategory, setSelectedCategory] = useState<string>(start.selectedCategory);
  const [otherCategory, setOtherCategory] = useState<string>(start.otherCategory);

  function choose(choice: ServiceChoice) {
    setServiceMode(choice.serviceMode);
    setSelectedServiceId(choice.serviceId);
    setOtherService(choice.otherService);
    setCategoryMode(choice.categoryMode);
    setSelectedCategory(choice.selectedCategory);
    setOtherCategory(choice.otherCategory);
  }

  if (appliedPrefill !== prefill) {
    setAppliedPrefill(prefill);
    choose(start);
  }

  // Anything typed or picked before the page loaded is on screen but not in state, and the first redraw would wipe
  // it — so it is taken in once, at load.
  useLayoutEffect(() => {
    if (!formRef.current) return;
    const typed = new FormData(formRef.current);
    const early = {
      name: typedValue(typed, "name"),
      email: typedValue(typed, "email"),
      message: typedValue(typed, "message"),
      website: typedValue(typed, "website"),
    };
    if (early.name) setName(early.name);
    if (early.email) setEmail(early.email);
    if (early.message) setMessage(early.message);
    if (early.website) setWebsite(early.website);

    const service = services.find((s) => s.id === typedValue(typed, "service"));
    if (service) {
      setSelectedServiceId(service.id);
      setCategoryMode("select");
      setSelectedCategory(service.category || "others");
      setOtherCategory("");
    }
  }, [services, formRef]);

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
    choose({ ...start, serviceMode: "select" });
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
    applyUrl,
  };
}