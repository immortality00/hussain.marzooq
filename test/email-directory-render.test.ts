import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { EmailDirectory } from "@/components/shared/EmailDirectory";
import { BlogSubscribeForm } from "@/components/blog/BlogSubscribeForm";
import { DEFAULT_SUBSCRIBE_COPY } from "@/lib/blog-subscribe-copy";

describe("EmailDirectory", () => {
  test("lists each address under its label, and a row with no label shows the address alone", () => {
    const html = renderToStaticMarkup(
      createElement(EmailDirectory, {
        emails: [
          { label: "Inquiries", address: "inquiries@hussain.art", shown: true },
          { label: "", address: "press@hussain.art", shown: true },
        ],
      })
    );
    expect(html).toContain(">Inquiries</span>");
    expect(html).toContain('href="mailto:inquiries@hussain.art"');
    expect(html).toContain('href="mailto:press@hussain.art"');
    expect(html.match(/<span/g)).toHaveLength(1);
  });
});

describe("BlogSubscribeForm", () => {
  test("shows the wording from admin", () => {
    const html = renderToStaticMarkup(
      createElement(BlogSubscribeForm, {
        copy: { heading: "Letters.", text: "New work.", buttonLabel: "Sign me up", confirmation: "Check it." },
      })
    );
    expect(html).toContain("Letters.</h2>");
    expect(html).toContain("New work.</p>");
    expect(html).toContain("Sign me up</button>");
  });

  test("with a blank heading and line it shows the form alone, still named for screen readers", () => {
    const html = renderToStaticMarkup(
      createElement(BlogSubscribeForm, { copy: { ...DEFAULT_SUBSCRIBE_COPY, heading: "", text: "" } })
    );
    expect(html).not.toContain("<h2");
    expect(html).not.toContain("<p");
    expect(html).toContain('aria-label="Subscribe to the blog"');
  });
});
