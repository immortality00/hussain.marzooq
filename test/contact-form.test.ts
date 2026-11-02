// @vitest-environment jsdom
import { act, createElement } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const url = vi.hoisted(() => ({ search: "" }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(url.search) }));
vi.mock("@/hooks/useFormToken", () => ({
  useFormToken: () => ({
    prime: async () => ({ token: "form-token", receivedAt: 0 }),
    take: async () => ({ token: "form-token" }),
    renew: () => undefined,
  }),
}));

import { ContactForm } from "@/components/contact/ContactForm";
import type { ServiceItem } from "@/components/contact/types";
import { getServiceCategories, NO_PREFILL, startingChoice } from "@/components/contact/utils";

const SERVICE: ServiceItem = {
  id: "a".repeat(24),
  name: "Editorial Session",
  slug: "editorial-session",
  category: "photography",
  startingPrice: 1000,
  currency: "AED",
};
const services = [SERVICE];
const categories = getServiceCategories(services);
const form = () => createElement(ContactForm, { services });

function answerInquiries() {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const sentBody = (fetchMock: ReturnType<typeof answerInquiries>) =>
  JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  cleanup();
  url.search = "";
  vi.unstubAllGlobals();
});

describe("startingChoice", () => {
  it("opens on the list with nothing chosen when the link names nothing", () => {
    expect(startingChoice(services, categories, NO_PREFILL)).toEqual({
      serviceMode: "select",
      serviceId: "",
      otherService: "",
      categoryMode: "select",
      selectedCategory: "others",
      otherCategory: "",
    });
  });

  it("chooses a service the link names by slug, with its category", () => {
    expect(startingChoice(services, categories, { service: "editorial-session", category: "", context: "" })).toEqual({
      serviceMode: "select",
      serviceId: SERVICE.id,
      otherService: "",
      categoryMode: "select",
      selectedCategory: "photography",
      otherCategory: "",
    });
  });

  it("writes in a service it does not know, and a category it does not know", () => {
    expect(startingChoice(services, categories, { service: "Portrait Inquiry", category: "Weddings", context: "" })).toEqual({
      serviceMode: "other",
      serviceId: "",
      otherService: "Portrait Inquiry",
      categoryMode: "other",
      selectedCategory: "others",
      otherCategory: "Weddings",
    });
  });
});

describe("ContactForm", () => {
  it("is in the server HTML with every field named, and nothing that can submit it", () => {
    const html = renderToString(form());

    for (const name of ["name", "email", "service", "message", "website"]) {
      expect(html).toMatch(new RegExp(`name="${name}"`));
    }
    expect(html).not.toMatch(/<form[^>]*\s(method|action)=/);
    expect(html).not.toMatch(/type="submit"/);
  });

  it("sends what was typed and picked before the page loaded", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(form());
    document.body.appendChild(container);

    const field = <T extends HTMLElement>(selector: string) => container.querySelector<T>(selector)!;
    field<HTMLInputElement>('input[name="name"]').value = "Early Visitor";
    field<HTMLInputElement>('input[name="email"]').value = "early@example.com";
    field<HTMLSelectElement>('select[name="service"]').value = SERVICE.id;
    field<HTMLTextAreaElement>('textarea[name="message"]').value = "Typed before the page loaded.";

    await act(async () => {
      root = hydrateRoot(container, form());
    });

    expect(field<HTMLInputElement>('input[name="name"]').value).toBe("Early Visitor");
    expect(container.textContent).toContain("Booking: Editorial Session • photography");

    const fetchMock = answerInquiries();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send" })));

    expect(await screen.findByText("Sent. I'll get back to you soon.")).toBeTruthy();
    expect(sentBody(fetchMock)).toMatchObject({
      name: "Early Visitor",
      email: "early@example.com",
      message: "Typed before the page loaded.",
      category: "photography",
      serviceId: SERVICE.id,
      serviceName: "Editorial Session",
      website: "",
    });
  });

  it("applies a booking link's service and context once the page has loaded", async () => {
    url.search = `?service=editorial-session&category=photography&context=${encodeURIComponent("From the services page")}`;
    render(form());

    expect(await screen.findByText("Booking: Editorial Session • photography")).toBeTruthy();
    expect(screen.getByRole<HTMLSelectElement>("combobox").value).toBe(SERVICE.id);
    expect(screen.getByText("From the services page")).toBeTruthy();
  });
});
