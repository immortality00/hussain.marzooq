import { after } from "next/server";
import {
  sendInquiryNotification,
  sendRemovalRequestNotification,
  sendSignInRefusedNotification,
  sendTestimonialNotification,
} from "@/lib/server/email";
import { sendAdminPush } from "@/lib/server/push";
import type { PushPayload } from "@/lib/push-subscription";
import { ADMIN_APPROVE_SIGN_IN_PATH } from "@/lib/auth/admin-next-path";

export type AdminAlert =
  | {
      kind: "inquiry";
      name: string;
      email: string;
      message: string;
      serviceName: string | null;
      category: string | null;
    }
  | {
      kind: "testimonial";
      name: string;
      email: string;
      review: string;
      rating: number | null;
      about: string | null;
    }
  | {
      kind: "removal-request";
      personName: string;
      slug: string;
      email: string;
      reason: string;
    }
  | {
      kind: "sign-in-refused";
      device: string;
      reason: "rejected" | "wrong-number";
    };

const SNIPPET_LENGTH = 120;

export function snippet(text: string, max: number = SNIPPET_LENGTH): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export function adminAlertPush(alert: AdminAlert): PushPayload {
  switch (alert.kind) {
    case "inquiry": {
      const topic = alert.serviceName || alert.category;
      return {
        title: `New inquiry — ${alert.name}`,
        body: topic ? `${topic} · ${snippet(alert.message)}` : snippet(alert.message),
        url: "/admin/inquiries",
      };
    }
    case "testimonial": {
      const stars = alert.rating ? `${"★".repeat(alert.rating)}${"☆".repeat(5 - alert.rating)} · ` : "";
      return {
        title: `New review — ${alert.name}`,
        body: `${stars}${snippet(alert.review)}`,
        url: "/admin/testimonials",
      };
    }
    case "removal-request":
      return {
        title: `Removal request — ${alert.personName || alert.slug}`,
        body: snippet(alert.reason),
        url: "/admin/removal-requests",
      };
    case "sign-in-refused":
      return {
        title: "Sign-in refused",
        body: `${alert.device} · ${alert.reason === "wrong-number" ? "wrong number picked" : "rejected"}`,
        url: "/admin/dashboard",
      };
  }
}

function sendAlertEmail(alert: AdminAlert) {
  switch (alert.kind) {
    case "inquiry":
      return sendInquiryNotification(alert);
    case "testimonial":
      return sendTestimonialNotification(alert);
    case "removal-request":
      return sendRemovalRequestNotification(alert);
    case "sign-in-refused":
      return sendSignInRefusedNotification(alert);
  }
}

export async function deliverAdminAlert(alert: AdminAlert) {
  const [email, push] = await Promise.allSettled([
    sendAlertEmail(alert),
    sendAdminPush(adminAlertPush(alert)),
  ]);

  if (email.status === "rejected") {
    console.error(`[admin-alert] ${alert.kind} email failed`, email.reason);
  }
  if (push.status === "rejected") {
    console.error(`[admin-alert] ${alert.kind} push failed`, push.reason);
  }
}

export function queueAdminAlert(alert: AdminAlert) {
  try {
    after(() => deliverAdminAlert(alert));
  } catch {
    void deliverAdminAlert(alert);
  }
}

async function deliverApprovalRequest(device: string) {
  try {
    await sendAdminPush({ title: "Sign-in request", body: `${device} — approve?`, url: ADMIN_APPROVE_SIGN_IN_PATH });
  } catch (error) {
    console.error("[admin-alert] sign-in approval push failed", error);
  }
}

/** Asks every device with notifications on to approve a sign-in; push only, no email. */
export function queueApprovalRequest(device: string) {
  try {
    after(() => deliverApprovalRequest(device));
  } catch {
    void deliverApprovalRequest(device);
  }
}
