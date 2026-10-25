import { Resend } from "resend";
import { escapeHtml } from "@/lib/server/escape-html";
import { getBaseUrl } from "@/lib/server/get-base-url";
import { SITE_EMAIL, type SiteEmailKey } from "@/lib/site-emails";

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_NAME = "Hussain.Art";
const RESEND_TEST_FROM = `${SENDER_NAME} <onboarding@resend.dev>`;

let warnedAboutDomain = false;
let warnedAboutTo = false;

type Delivery = { from: string; to: string };

export type EmailContent = { subject: string; html: string; text: string };

/** `Hussain.Art <address>` when `RESEND_DOMAIN` names that address's domain (verified in Resend), else null. */
export function siteSender(inbox: SiteEmailKey): string | null {
  const address = SITE_EMAIL[inbox];
  const domain = process.env.RESEND_DOMAIN?.trim().toLowerCase();
  return domain && address.endsWith(`@${domain}`) ? `${SENDER_NAME} <${address}>` : null;
}

/**
 * Where an alert goes. With `RESEND_DOMAIN` naming the domain verified in Resend, the alert goes to its own
 * address and comes from it; without it, Resend's test sender can only reach the account owner, so it goes to
 * `NOTIFICATION_EMAIL`. Unset `NOTIFICATION_EMAIL` turns alert emails off.
 */
export function alertDelivery(inbox: SiteEmailKey): Delivery | null {
  const fallback = (process.env.NOTIFICATION_EMAIL ?? "").trim();
  if (!fallback) {
    if (!warnedAboutTo) {
      warnedAboutTo = true;
      console.warn("NOTIFICATION_EMAIL is not set — admin alert emails are skipped.");
    }
    return null;
  }

  const address = SITE_EMAIL[inbox];
  const from = siteSender(inbox);
  if (from) return { from, to: address };

  if (!warnedAboutDomain) {
    warnedAboutDomain = true;
    console.warn(
      `RESEND_DOMAIN is not ${address.split("@")[1]} — alerts go to NOTIFICATION_EMAIL from Resend's testing domain, which only delivers to the Resend account owner.`
    );
  }
  return { from: RESEND_TEST_FROM, to: fallback };
}

const SINGLE_ADDRESS = /^[^\s@<>,;:"()[\]\\]+@[^\s@<>,;:"()[\]\\]+\.[^\s@<>,;:"()[\]\\]+$/;

/** The visitor's address as one plain Reply-To, or nothing if it could name more than one recipient. */
export function replyToAddress(email: string): string | undefined {
  const value = email.trim();
  return value.length <= 254 && SINGLE_ADDRESS.test(value) ? value : undefined;
}

async function sendAdminEmail(delivery: Delivery, subject: string, html: string, visitorEmail?: string) {
  const replyTo = visitorEmail ? replyToAddress(visitorEmail) : undefined;
  const { error } = await resend.emails.send({
    from: delivery.from,
    to: delivery.to,
    subject,
    html,
    ...(replyTo ? { replyTo: [replyTo] } : {}),
  });
  if (error) {
    throw new Error(`Resend rejected "${subject}": ${error.name} — ${error.message}`);
  }
}

/**
 * An email to a visitor from one of the site's addresses. There is no test-sender fallback: Resend's test domain
 * delivers only to the account owner, so without `RESEND_DOMAIN` this throws.
 */
export async function sendVisitorEmail(inbox: SiteEmailKey, to: string, content: EmailContent) {
  const from = siteSender(inbox);
  if (!from) throw new Error(`RESEND_DOMAIN does not cover ${SITE_EMAIL[inbox]}.`);
  const { error } = await resend.emails.send({ from, to, ...content });
  if (error) {
    throw new Error(`Resend rejected "${content.subject}": ${error.name} — ${error.message}`);
  }
}

export async function sendInquiryNotification(data: {
  name: string;
  email: string;
  message: string;
  serviceName: string | null;
  category: string | null;
}) {
  const delivery = alertDelivery("book");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  await sendAdminEmail(
    delivery,
    `New inquiry from ${data.name}`,
    `
      <h2>New Inquiry — Hussain.Art</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${data.serviceName ? `<p><strong>Service:</strong> ${escapeHtml(data.serviceName)}</p>` : ""}
      ${data.category ? `<p><strong>Category:</strong> ${escapeHtml(data.category)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${escapeHtml(data.message).replace(/\n/g, "<br>")}</blockquote>
      <p style="margin-top:24px"><a href="${baseUrl}/admin/inquiries">View in admin →</a></p>
    `,
    data.email
  );
}

export async function sendTestimonialNotification(data: {
  name: string;
  email: string;
  review: string;
  rating: number | null;
  about: string | null;
}) {
  const delivery = alertDelivery("hussain");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  const stars = data.rating ? "★".repeat(data.rating) + "☆".repeat(5 - data.rating) : "—";
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  await sendAdminEmail(
    delivery,
    `New testimonial from ${data.name} — pending approval`,
    `
      <h2>New Testimonial — Hussain.Art</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${data.about ? `<p><strong>About:</strong> ${escapeHtml(data.about)}</p>` : ""}
      <p><strong>Rating:</strong> ${stars}</p>
      <p><strong>Review:</strong></p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${escapeHtml(data.review).replace(/\n/g, "<br>")}</blockquote>
      <p style="margin-top:24px"><a href="${baseUrl}/admin/testimonials">Review &amp; approve →</a></p>
    `,
    data.email
  );
}

export async function sendRemovalRequestNotification(data: {
  personName: string;
  slug: string;
  email: string;
  reason: string;
}) {
  const delivery = alertDelivery("privacy");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  const label = data.personName || data.slug;
  const email = escapeHtml(data.email);
  await sendAdminEmail(
    delivery,
    `Removal request for ${label}`,
    `
      <h2>New Removal Request — Hussain.Art</h2>
      <p><strong>Profile:</strong> <a href="${baseUrl}/people/${encodeURIComponent(data.slug)}">${escapeHtml(label)}</a></p>
      <p><strong>Requested by:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Reason:</strong></p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${escapeHtml(data.reason).replace(/\n/g, "<br>")}</blockquote>
      <p style="margin-top:24px"><a href="${baseUrl}/admin/removal-requests">Review request →</a></p>
    `,
    data.email
  );
}

export async function sendSignInRefusedNotification(data: { device: string; reason: "rejected" | "wrong-number" }) {
  const delivery = alertDelivery("hussain");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  const why = data.reason === "wrong-number" ? "The wrong number was picked." : "It was rejected.";
  await sendAdminEmail(
    delivery,
    `Admin sign-in refused — ${data.device}`,
    `
      <h2>Admin Sign-in Refused — Hussain.Art</h2>
      <p><strong>Device:</strong> ${escapeHtml(data.device)}</p>
      <p>${why} The password was right, so change it if this was not you.</p>
      <p style="margin-top:24px"><a href="${baseUrl}/admin/dashboard">Open admin →</a></p>
    `
  );
}
