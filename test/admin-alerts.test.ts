import { beforeEach, describe, expect, test, vi } from "vitest";

const { sendAdminPush, sendInquiryNotification, sendTestimonialNotification, sendRemovalRequestNotification, after } =
  vi.hoisted(() => ({
    sendAdminPush: vi.fn(async () => ({ sent: 1, removed: 0, failed: 0 })),
    sendInquiryNotification: vi.fn(async () => {}),
    sendTestimonialNotification: vi.fn(async () => {}),
    sendRemovalRequestNotification: vi.fn(async () => {}),
    after: vi.fn(),
  }));

vi.mock("@/lib/server/push", () => ({ sendAdminPush }));
vi.mock("@/lib/server/email", () => ({
  sendInquiryNotification,
  sendTestimonialNotification,
  sendRemovalRequestNotification,
}));
vi.mock("next/server", () => ({ after }));

import {
  adminAlertPush,
  deliverAdminAlert,
  queueAdminAlert,
  snippet,
  type AdminAlert,
} from "@/lib/server/admin-alerts";

const inquiry: AdminAlert = {
  kind: "inquiry",
  name: "Sara",
  email: "sara@example.com",
  message: "Hi,\n\nwe'd like a wedding film in March.",
  serviceName: "Wedding Film",
  category: "videography",
};

const removal: AdminAlert = {
  kind: "removal-request",
  personName: "Omar",
  slug: "omar",
  email: "omar@example.com",
  reason: "Please take my photos down.",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("snippet", () => {
  test("flattens whitespace and truncates with an ellipsis", () => {
    expect(snippet("a\n\n b   c")).toBe("a b c");
    const long = snippet("word ".repeat(100), 20);
    expect(long.length).toBeLessThanOrEqual(20);
    expect(long.endsWith("…")).toBe(true);
  });
});

describe("adminAlertPush", () => {
  test("inquiry links to inquiries and leads with the service", () => {
    expect(adminAlertPush(inquiry)).toEqual({
      title: "New inquiry — Sara",
      body: "Wedding Film · Hi, we'd like a wedding film in March.",
      url: "/admin/inquiries",
    });
  });

  test("testimonial shows the rating", () => {
    const payload = adminAlertPush({
      kind: "testimonial",
      name: "Lina",
      email: "lina@example.com",
      review: "Beautiful work.",
      rating: 4,
      about: null,
    });
    expect(payload.title).toBe("New review — Lina");
    expect(payload.body).toBe("★★★★☆ · Beautiful work.");
    expect(payload.url).toBe("/admin/testimonials");
  });

  test("removal request links to removal requests", () => {
    expect(adminAlertPush(removal)).toEqual({
      title: "Removal request — Omar",
      body: "Please take my photos down.",
      url: "/admin/removal-requests",
    });
  });
});

describe("deliverAdminAlert", () => {
  test("sends the matching email and a push", async () => {
    await deliverAdminAlert(removal);
    expect(sendRemovalRequestNotification).toHaveBeenCalledWith(removal);
    expect(sendAdminPush).toHaveBeenCalledWith(adminAlertPush(removal));
    expect(sendInquiryNotification).not.toHaveBeenCalled();
  });

  test("a failing email does not stop the push, and is logged", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    sendInquiryNotification.mockRejectedValueOnce(new Error("Resend rejected"));

    await deliverAdminAlert(inquiry);

    expect(sendAdminPush).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith("[admin-alert] inquiry email failed", expect.any(Error));
    error.mockRestore();
  });
});

describe("queueAdminAlert", () => {
  test("defers delivery to after() so it outlives the response", () => {
    queueAdminAlert(inquiry);
    expect(after).toHaveBeenCalledTimes(1);
    expect(sendInquiryNotification).not.toHaveBeenCalled();
  });

  test("delivers immediately when after() is unavailable", async () => {
    after.mockImplementationOnce(() => {
      throw new Error("outside a request scope");
    });
    queueAdminAlert(inquiry);
    await vi.waitFor(() => expect(sendInquiryNotification).toHaveBeenCalledTimes(1));
  });
});
