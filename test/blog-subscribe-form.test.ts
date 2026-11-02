// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useFormToken", () => ({
  useFormToken: () => ({
    prime: async () => ({ token: "form-token", receivedAt: 0 }),
    take: async () => ({ token: "form-token" }),
    renew: () => undefined,
  }),
}));

import { BlogSubscribeForm } from "@/components/blog/BlogSubscribeForm";
import { DEFAULT_SUBSCRIBE_COPY } from "@/lib/blog-subscribe-copy";

const form = () => createElement(BlogSubscribeForm, { copy: DEFAULT_SUBSCRIBE_COPY });

function answer(status: number, body: unknown) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function signUp(address: string) {
  render(form());
  const email = screen.getByLabelText<HTMLInputElement>("Email");
  fireEvent.change(email, { target: { value: address } });
  fireEvent.click(screen.getByRole("button", { name: DEFAULT_SUBSCRIBE_COPY.buttonLabel }));
  return email;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("BlogSubscribeForm", () => {
  it("cannot submit to a page before it has loaded", () => {
    const html = renderToStaticMarkup(form());
    const action = html.match(/<form[^>]*\saction="([^"]*)"/)?.[1] ?? "";

    expect(action.startsWith("javascript:")).toBe(true);
    expect(html).not.toMatch(/<form[^>]*\smethod=/);
    expect(html).toMatch(/<input[^>]*name="email"/);
    expect(html).toMatch(/<button[^>]*type="submit"/);
  });

  it("sends the typed address, then clears the field and confirms", async () => {
    const fetchMock = answer(200, { ok: true });
    const email = signUp("  reader@example.com ");

    await screen.findByText(DEFAULT_SUBSCRIBE_COPY.confirmation);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/subscribe");
    expect(JSON.parse(String(init.body))).toEqual({ email: "reader@example.com", website: "", formToken: "form-token" });
    expect(email.value).toBe("");
  });

  it("keeps the typed address when the server refuses it", async () => {
    answer(429, { ok: false, error: "Too many sign-ups from here. Try again later." });
    const email = signUp("reader@example.com");

    await screen.findByText("Not sent: Too many sign-ups from here. Try again later.");
    expect(email.value).toBe("reader@example.com");
  });

  it("checks the address before sending anything", async () => {
    const fetchMock = answer(200, { ok: true });
    const email = signUp("reader@");

    await screen.findByText("Not sent: Email format is invalid.");
    expect(email.value).toBe("reader@");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("says so when the request never reaches the server", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Load failed"))));
    const email = signUp("reader@example.com");

    await screen.findByText("Not sent: no connection.");
    await waitFor(() => expect(email.value).toBe("reader@example.com"));
  });
});
