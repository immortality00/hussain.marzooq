export type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  category: string | null;
  serviceId: string | null;
  serviceName: string | null;
  status: string;
  adminNotes: string;
  isArchived: boolean;
  createdAt: string | null;
};

export const STATUSES = ["new", "pending", "replied", "approved", "rejected", "resolved"] as const;

export type InquiryStatus = (typeof STATUSES)[number];

export type ApiInquiriesResponse =
  | { ok: true; items: Inquiry[] }
  | { ok: false; error?: string };

export type Banner = { type: "ok" | "err"; text: string } | null;