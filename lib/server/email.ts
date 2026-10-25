import { Resend } from "resend";
import { getBaseUrl } from "@/lib/server/get-base-url";
import { SITE_EMAIL, SITE_EMAIL_DOMAIN, type SiteEmailKey } from "@/lib/site-emails";
import { inquiryAlert, removalAlert, reviewAlert, signInRefusedAlert } from "@/lib/server/alert-emails";

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
 * Where blog posts come from. Apple asks senders to keep marketing apart from transactional mail, so with
 * `RESEND_NEWS_DOMAIN` set to a Resend-verified subdomain (`news.hussain.art`) posts leave as press@ on it and
 * replies reach press@ on the main domain; unset, they come from the confirmation's own sender.
 */
export function postSender(): { from: string; replyTo?: string } | null {
  const fallback = siteSender("press");
  if (!fallback) return null;
  const news = process.env.RESEND_NEWS_DOMAIN?.trim().toLowerCase();
  if (!news || !news.endsWith(`.${SITE_EMAIL_DOMAIN}`)) return { from: fallback };
  const [name] = SITE_EMAIL.press.split("@");
  return { from: `${SENDER_NAME} <${name}@${news}>`, replyTo: SITE_EMAIL.press };
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

async function sendAdminEmail(delivery: Delivery, content: EmailContent, visitorEmail?: string) {
  const replyTo = visitorEmail ? replyToAddress(visitorEmail) : undefined;
  const { error } = await resend.emails.send({
    from: delivery.from,
    to: delivery.to,
    ...content,
    ...(replyTo ? { replyTo: [replyTo] } : {}),
  });
  if (error) {
    throw new Error(`Resend rejected "${content.subject}": ${error.name} — ${error.message}`);
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

export async function sendInquiryNotification(data: Parameters<typeof inquiryAlert>[0]) {
  const delivery = alertDelivery("inquiries");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  await sendAdminEmail(delivery, inquiryAlert(data, baseUrl), data.email);
}

export async function sendTestimonialNotification(data: Parameters<typeof reviewAlert>[0]) {
  const delivery = alertDelivery("hussain");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  await sendAdminEmail(delivery, reviewAlert(data, baseUrl), data.email);
}

export async function sendRemovalRequestNotification(data: Parameters<typeof removalAlert>[0]) {
  const delivery = alertDelivery("privacy");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  await sendAdminEmail(delivery, removalAlert(data, baseUrl), data.email);
}

export async function sendSignInRefusedNotification(data: Parameters<typeof signInRefusedAlert>[0]) {
  const delivery = alertDelivery("hussain");
  if (!delivery) return;
  const baseUrl = await getBaseUrl();
  await sendAdminEmail(delivery, signInRefusedAlert(data, baseUrl));
}
