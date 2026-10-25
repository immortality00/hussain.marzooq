import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { send } = vi.hoisted(() => ({
  send: vi.fn<(payload: Record<string, unknown>) => Promise<{ data: unknown; error: null | object }>>(async () => ({
    data: { id: "email_1" },
    error: null,
  })),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
vi.mock("@/lib/server/get-base-url", () => ({ getBaseUrl: async () => "https://hussain.art" }));

import {
  alertDelivery,
  postSender,
  replyToAddress,
  sendInquiryNotification,
  sendRemovalRequestNotification,
  sendSignInRefusedNotification,
  sendTestimonialNotification,
  sendVisitorEmail,
  siteSender,
} from "@/lib/server/email";

const inquiry = {
  name: "Sara",
  email: "sara@example.com",
  message: "A wedding film in March.",
  serviceName: "Wedding Film",
  category: "videography",
};
const review = { name: "Lina", email: "lina@example.com", review: "Beautiful.", rating: 5, about: null };
const removal = { personName: "Omar", slug: "omar", email: "omar@example.com", reason: "Please hide my photos." };

function sent() {
  return send.mock.calls.at(-1)?.[0];
}

beforeEach(() => {
  send.mockClear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubEnv("NOTIFICATION_EMAIL", "owner@example.com");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("with hussain.art verified", () => {
  beforeEach(() => vi.stubEnv("RESEND_DOMAIN", "hussain.art"));

  test("an inquiry goes to inquiries@, from inquiries@, and Reply answers the visitor", async () => {
    await sendInquiryNotification(inquiry);
    expect(sent()).toMatchObject({
      from: "Hussain.Art <inquiries@hussain.art>",
      to: "inquiries@hussain.art",
      replyTo: ["sara@example.com"],
    });
  });

  test("an alert is sent in the site's email layout with a plain-text version", async () => {
    await sendInquiryNotification(inquiry);
    expect(sent()?.html).toContain("/brand/signature-white.png");
    expect(sent()?.text).toContain("A wedding film in March.");
  });

  test("a review goes to hussain@", async () => {
    await sendTestimonialNotification(review);
    expect(sent()).toMatchObject({ to: "hussain@hussain.art", replyTo: ["lina@example.com"] });
  });

  test("a removal request goes to privacy@", async () => {
    await sendRemovalRequestNotification(removal);
    expect(sent()).toMatchObject({
      from: "Hussain.Art <privacy@hussain.art>",
      to: "privacy@hussain.art",
      replyTo: ["omar@example.com"],
    });
  });

  test("a refused sign-in goes to hussain@ with no Reply-To", async () => {
    await sendSignInRefusedNotification({ device: "Windows · Chrome", reason: "rejected" });
    expect(sent()).toMatchObject({ to: "hussain@hussain.art" });
    expect(sent()).not.toHaveProperty("replyTo");
  });

  test("a visitor address that could name several recipients is left out of Reply-To", async () => {
    await sendInquiryNotification({ ...inquiry, email: "a,victim@example.com" });
    expect(sent()).toMatchObject({ to: "inquiries@hussain.art" });
    expect(sent()).not.toHaveProperty("replyTo");
  });

  test("a Resend error is thrown with its reason", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "validation_error", message: "Domain not verified" } });
    await expect(sendInquiryNotification(inquiry)).rejects.toThrow("Domain not verified");
  });
});

describe("before the domain is verified", () => {
  test("every alert goes to NOTIFICATION_EMAIL from Resend's test sender", async () => {
    await sendRemovalRequestNotification(removal);
    expect(sent()).toMatchObject({
      from: "Hussain.Art <onboarding@resend.dev>",
      to: "owner@example.com",
      replyTo: ["omar@example.com"],
    });
  });

  test("a RESEND_DOMAIN other than the addresses' domain is never used as the sender", () => {
    vi.stubEnv("RESEND_DOMAIN", "example.com");
    expect(alertDelivery("inquiries")).toEqual({ from: "Hussain.Art <onboarding@resend.dev>", to: "owner@example.com" });
  });
});

describe("alerts off", () => {
  test("nothing is sent without NOTIFICATION_EMAIL", async () => {
    vi.stubEnv("NOTIFICATION_EMAIL", "");
    vi.stubEnv("RESEND_DOMAIN", "hussain.art");
    await sendInquiryNotification(inquiry);
    expect(send).not.toHaveBeenCalled();
  });
});

describe("replyToAddress", () => {
  test("keeps one plain address", () => {
    expect(replyToAddress(" sara@example.com ")).toBe("sara@example.com");
    expect(replyToAddress("first.last+tag@mail.example.co")).toBe("first.last+tag@mail.example.co");
  });

  test.each([
    "a@example.com, b@example.com",
    "a@example.com;b@example.com",
    "Sara <sara@example.com>",
    '"sara"@example.com',
    "sara@example.com\nBcc: x@example.com",
    "sara @example.com",
    "sara@example",
    `${"a".repeat(250)}@example.com`,
  ])("refuses %j", (value) => {
    expect(replyToAddress(value)).toBeUndefined();
  });
});

describe("visitor emails", () => {
  const content = { subject: "Confirm your subscription", html: "<p>x</p>", text: "x" };

  test("come from the site's own address once the domain is verified", async () => {
    vi.stubEnv("RESEND_DOMAIN", "hussain.art");
    expect(siteSender("press")).toBe("Hussain.Art <press@hussain.art>");
    await sendVisitorEmail("press", "reader@example.com", content);
    expect(sent()).toEqual({ from: "Hussain.Art <press@hussain.art>", to: "reader@example.com", ...content });
  });

  test("are never sent from Resend's test sender, which reaches only the account owner", async () => {
    vi.stubEnv("RESEND_DOMAIN", "example.org");
    expect(siteSender("press")).toBeNull();
    await expect(sendVisitorEmail("press", "reader@example.com", content)).rejects.toThrow("RESEND_DOMAIN");
    expect(send).not.toHaveBeenCalled();
  });

  test("throw Resend's reason", async () => {
    vi.stubEnv("RESEND_DOMAIN", "hussain.art");
    send.mockResolvedValueOnce({ data: null, error: { name: "daily_quota_exceeded", message: "Daily quota reached" } });
    await expect(sendVisitorEmail("press", "reader@example.com", content)).rejects.toThrow("Daily quota reached");
  });
});

describe("postSender", () => {
  test("without the posts' subdomain, posts come from press@hussain.art", () => {
    vi.stubEnv("RESEND_DOMAIN", "hussain.art");
    expect(postSender()).toEqual({ from: "Hussain.Art <press@hussain.art>" });
  });

  test("with it, from press@news.hussain.art, replies to press@hussain.art", () => {
    vi.stubEnv("RESEND_DOMAIN", "hussain.art");
    vi.stubEnv("RESEND_NEWS_DOMAIN", " News.Hussain.Art ");
    expect(postSender()).toEqual({ from: "Hussain.Art <press@news.hussain.art>", replyTo: "press@hussain.art" });
  });

  test("never without the main domain verified, and never another domain or the main domain itself", () => {
    vi.stubEnv("RESEND_NEWS_DOMAIN", "news.hussain.art");
    expect(postSender()).toBeNull();
    vi.stubEnv("RESEND_DOMAIN", "hussain.art");
    for (const value of ["news.example.com", "hussain.art", "evilhussain.art"]) {
      vi.stubEnv("RESEND_NEWS_DOMAIN", value);
      expect(postSender()).toEqual({ from: "Hussain.Art <press@hussain.art>" });
    }
  });
});
