import { describe, expect, it } from "vitest";
import {
  adminBlogHref,
  adminInquiriesHref,
  adminInquiryHref,
  adminReviewHref,
  adminTestimonialsHref,
} from "@/lib/admin-links";
import { statusFilterOf, statusOf } from "@/app/admin/(protected)/blog/lib/post-status";
import type { BlogListItem } from "@/app/admin/(protected)/blog/lib/types";
import { mediaListHref } from "@/app/admin/(protected)/media/lib/media-list-address";
import { NO_FILTERS } from "@/app/admin/(protected)/media/lib/media-pages";

describe("admin links", () => {
  it("open the dashboard's counts filtered", () => {
    expect(adminTestimonialsHref("pending")).toBe("/admin/testimonials?status=pending");
    expect(adminInquiriesHref("new")).toBe("/admin/inquiries?status=new");
    expect(adminBlogHref("waiting")).toBe("/admin/blog?status=waiting");
    expect(mediaListHref({ ...NO_FILTERS, category: "videography" })).toBe("/admin/media/list?category=videography");
    expect(mediaListHref(NO_FILTERS)).toBe("/admin/media/list");
  });

  it("open an alert's item", () => {
    expect(adminInquiryHref("66a1")).toBe("/admin/inquiries?open=66a1");
    expect(adminReviewHref("66a2")).toBe("/admin/testimonials?review=66a2");
  });
});

describe("blog post status", () => {
  const post = (fields: Partial<BlogListItem>): BlogListItem => ({
    id: "p",
    title: "T",
    slug: "t",
    category: "",
    categoryLabel: "",
    isPublished: false,
    publishedAt: null,
    updatedAt: null,
    notifiedAt: null,
    waiting: false,
    ...fields,
  });
  const now = Date.parse("2026-11-18T00:00:00Z");

  it("names each post's status", () => {
    expect(statusOf(post({ waiting: true }), now)).toBe("waiting");
    expect(statusOf(post({}), now)).toBe("draft");
    expect(statusOf(post({ isPublished: true, publishedAt: "2026-12-01T00:00:00Z" }), now)).toBe("scheduled");
    expect(statusOf(post({ isPublished: true, publishedAt: "2026-11-01T00:00:00Z" }), now)).toBe("published");
  });

  it("reads the status filter from the address, anything unknown as All", () => {
    expect(statusFilterOf("waiting")).toBe("waiting");
    expect(statusFilterOf("")).toBe("");
    expect(statusFilterOf("<script>")).toBe("");
  });
});
