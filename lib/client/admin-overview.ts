import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { ADMIN_ACTIVE_INQUIRY_LIMIT, pendingCount } from "@/lib/admin-data";
import { pageFlags } from "@/app/admin/(protected)/pages/lib/rows";

export type AdminPreview = Pick<AdminSnapshot, "dashboard" | "notificationCount" | "push">;

const CLOSED_INQUIRY = new Set(["resolved", "rejected"]);

export function overviewOf(data: AdminSnapshot): AdminPreview {
  const { stats } = data.dashboard;
  const testimonials = {
    total: data.testimonials.length,
    pending: data.testimonials.filter((item) => item.isApproved !== true).length,
  };
  const open = data.inquiries.filter((item) => !item.isArchived);
  const inquiries =
    open.length < ADMIN_ACTIVE_INQUIRY_LIMIT
      ? {
          new: open.filter((item) => item.status === "new").length,
          active: open.filter((item) => !CLOSED_INQUIRY.has(item.status)).length,
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
    notificationCount: pendingCount({ testimonials, inquiries, removalRequests }),
    push: data.push,
  };
}
