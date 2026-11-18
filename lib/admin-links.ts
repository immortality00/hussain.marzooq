// Admin addresses that open a filtered list or one item — the dashboard's counts and the alerts' links (push and
// email) — and the address parameters those screens read (each screen lists them as its AdminScreen `stable`).
export const TESTIMONIAL_PARAMS = ["status", "q", "review"] as const;
export const INQUIRY_PARAMS = ["status", "open"] as const;

export function adminTestimonialsHref(status: "pending" | "approved"): string {
  return `/admin/testimonials?status=${status}`;
}

export function adminReviewHref(id: string): string {
  return `/admin/testimonials?review=${encodeURIComponent(id)}`;
}

export function adminInquiriesHref(status: string): string {
  return `/admin/inquiries?status=${encodeURIComponent(status)}`;
}

export function adminInquiryHref(id: string): string {
  return `/admin/inquiries?open=${encodeURIComponent(id)}`;
}

export function adminBlogHref(status: "waiting" | "draft" | "scheduled" | "published"): string {
  return `/admin/blog?status=${status}`;
}
