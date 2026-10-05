// @vitest-environment jsdom
import { act, createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginNotice, NextPathField } from "@/app/admin/sign-in/LoginNotice";

function Notice() {
  return createElement("form", null, createElement(LoginNotice), createElement(NextPathField));
}

async function hydrateAt(url: string) {
  const html = renderToString(createElement(Notice));
  window.history.replaceState(null, "", url);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  const recoverable = vi.fn();
  await act(async () => {
    hydrateRoot(container, createElement(Notice), { onRecoverableError: recoverable });
  });
  return { html, container, recoverable };
}

afterEach(() => {
  document.body.innerHTML = "";
  window.history.replaceState(null, "", "/");
});

describe("sign-in notice", () => {
  it("renders nothing from the URL on the server, so any saved copy of the page matches", () => {
    window.history.replaceState(null, "", "/admin/sign-in?loggedout=1&next=%2Fadmin%2Finquiries");
    const html = renderToString(createElement(Notice));
    expect(html).not.toContain("Logged out.");
    expect(html).toContain('value=""');
  });

  it.each([
    ["/admin/sign-in?loggedout=1", "Logged out."],
    ["/admin/sign-in?signedout=expired", "Signed out: session expired."],
  ])("hydrates a copy saved without a query at %s with no mismatch, then shows the notice", async (url, notice) => {
    const { container, recoverable } = await hydrateAt(url);
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.textContent).toContain(notice);
  });

  it("fills the next field from the URL after hydration", async () => {
    const { container, recoverable } = await hydrateAt("/admin/sign-in?next=%2Fadmin%2Finquiries");
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLInputElement>('input[name="next"]')?.value).toBe("/admin/inquiries");
  });
});
