import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { ADMIN_INQUIRY_LIMIT } from "@/lib/admin-data";
import { pageFlags } from "@/app/admin/(protected)/pages/lib/rows";

export type AdminPreview = Pick<AdminSnapshot, "dashboard" | "notificationCount" | "push">;

const CLOSED_INQUIRY = new Set(["resolved", "rejected"]);

export function overviewOf(data: AdminSnapshot): AdminPreview {
  const { stats } = data.dashboard;
  const testimonials = {
    total: data.testimonials.length,
    pending: data.testimonials.filter((item) => item.isApproved !== true).length,
  };
  const inquiries =
    data.inquiries.length < ADMIN_INQUIRY_LIMIT
      ? {
          total: data.inquiries.length,
          new: data.inquiries.filter((item) => item.status === "new").length,
          active: data.inquiries.filter((item) => !CLOSED_INQUIRY.has(item.status)).length,
        }
      : stats.inquiries;
  const removalRequests = data.removal.items.length;

  return {
    dashboard: {
      stats: {
        ...stats,
        testimonials,
        inquiries,
        removalRequests,
        people: data.people.length,
        services: data.services.length,
        privateGalleries: data.galleries.length,
      },
      ...pageFlags(data.pages),
    },
    notificationCount: testimonials.pending + inquiries.new + removalRequests,
    push: data.push,
  };
}
