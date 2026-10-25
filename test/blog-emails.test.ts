import { describe, expect, test } from "vitest";
import {
  UNSUBSCRIBE_PLACEHOLDER,
  confirmationEmail,
  confirmationLink,
  postEmail,
} from "@/lib/server/blog-emails";
import { strictAllowList } from "@/lib/cloudinary-delivery";

const post = {
  title: "Light that holds",
  slug: "light-that-holds",
  excerpt: "Notes from a night shoot.",
  coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/blog/cover.jpg",
  publishedAt: new Date("2026-10-24T20:30:00Z"),
  readingMinutes: 4,
};

describe("confirmation email", () => {
  test("the token travels after # so no server ever logs it", () => {
    const link = confirmationLink("abc_DEF-123");
    expect(link).toBe("https://hussain.art/subscribe#t=abc_DEF-123");
    expect(link).not.toContain("?");
  });

  test("carries the link in both the HTML and the text version", () => {
    const link = confirmationLink("tok");
    const email = confirmationEmail(link);
    expect(email.subject).toBe("Confirm your subscription to Hussain.Art");
    expect(email.html).toContain(`href="${link}"`);
    expect(email.text).toContain(link);
  });
});

describe("new-post email", () => {
  test("links to the post and carries Resend's unsubscribe placeholder in both versions", () => {
    const email = postEmail(post);
    expect(email.subject).toBe(post.title);
    expect(email.html).toContain('href="https://hussain.art/blog/light-that-holds"');
    expect(email.html).toContain(`href="${UNSUBSCRIBE_PLACEHOLDER}"`);
    expect(email.text).toContain(`Unsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}`);
    expect(email.text).toContain("Read the story: https://hussain.art/blog/light-that-holds");
  });

  test("escapes the title and excerpt in the HTML", () => {
    const email = postEmail({ ...post, title: '<script>alert("x")</script>', excerpt: "a & b <img src=x>" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img src=x>");
    expect(email.html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(email.html).toContain("<title>&lt;script&gt;");
    expect(email.html).toContain("a &amp; b &lt;img src=x&gt;");
  });

  test("asks Cloudinary only for a size already on the strict allow list", () => {
    const html = postEmail(post).html;
    const transform = html.match(/\/upload\/([^/]+)\/v1\/hm_visuals\/blog\/cover\.jpg/)?.[1];
    expect(transform).toBeDefined();
    expect(strictAllowList()).toContain(transform);
  });

  test("leaves out a cover that is not a web address, and an empty excerpt", () => {
    const email = postEmail({ ...post, coverImageUrl: "javascript:alert(1)", excerpt: "  " });
    expect(email.html).not.toContain('width="560"');
    expect(email.html).not.toContain("javascript:");
    expect(email.previewText).toBe("");
  });

  test("shows the date in Dubai time and the reading time, in both versions", () => {
    const email = postEmail(post);
    expect(email.html).toContain("25 October 2026 · 4 min read");
    expect(email.text.startsWith("25 October 2026 · 4 min read")).toBe(true);
    expect(postEmail({ ...post, publishedAt: null, readingMinutes: 0 }).text.startsWith(post.title)).toBe(true);
  });

  test("carries the signature from the site's own brand folder", () => {
    expect(postEmail(post).html).toContain('src="https://hussain.art/brand/signature-white.png"');
  });

  test("draws the button as white text and border with no fill, so no mail app can hide it", () => {
    const html = postEmail(post).html;
    const button = html.match(/<td align="center" style="border:[^"]+"><a href="https:\/\/hussain\.art\/blog\/light-that-holds" style="([^"]+)">Read the story<\/a>/);
    expect(button?.[1]).toContain("color:#ffffff");
    expect(button?.[1]).not.toContain("background");
  });

  test("keeps the inbox preview short", () => {
    expect(postEmail({ ...post, excerpt: "x".repeat(400) }).previewText).toHaveLength(150);
  });
});
