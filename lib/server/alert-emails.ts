import type { EmailContent } from "@/lib/server/email";
import { frame, headline, paragraph, pill, plainLink, quote, SIGN_OFF } from "@/lib/server/email-frame";

// The admin alerts, in the same layout as the visitor emails. iCloud sent the old bare alert to Junk every time
// (score 4.33) while the same alert in this layout, from the same address to the same inbox, reached the Inbox (U1).

const PREVIEW_MAX = 150;

type Alert = { subject: string; heading: string; lines: string[]; quoted?: string; link?: { lead: string; href: string }; action: { href: string; label: string } };

function alertEmail({ subject, heading, lines, quoted, link, action }: Alert): EmailContent {
  const body = [
    headline(heading, 30),
    ...lines.map(paragraph),
    link ? plainLink(link.lead, link.href) : "",
    quoted ? quote(quoted) : "",
    pill(action.href, action.label),
  ].filter(Boolean);
  const preheader = (quoted ?? lines.join(" · ")).replace(/\s+/g, " ").trim().slice(0, PREVIEW_MAX);
  return {
    subject,
    html: frame({ title: subject, preheader, body: body.join("\n"), footer: SIGN_OFF }),
    text: [heading, ...lines, link ? `${link.lead} ${link.href}` : "", quoted ?? "", `${action.label}: ${action.href}`, `—\n${SIGN_OFF}`]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export function inquiryAlert(
  data: { name: string; email: string; message: string; serviceName: string | null; category: string | null },
  baseUrl: string
): EmailContent {
  const about = [data.serviceName && `Service: ${data.serviceName}`, data.category && `Category: ${data.category}`];
  return alertEmail({
    subject: `New inquiry from ${data.name}`,
    heading: "New inquiry",
    lines: [`${data.name} · ${data.email}`, about.filter(Boolean).join(" · ")].filter(Boolean),
    quoted: data.message,
    action: { href: `${baseUrl}/admin/inquiries`, label: "View in admin" },
  });
}

export function reviewAlert(
  data: { name: string; email: string; review: string; rating: number | null; about: string | null },
  baseUrl: string
): EmailContent {
  const stars = data.rating ? "★".repeat(data.rating) + "☆".repeat(5 - data.rating) : "No rating";
  return alertEmail({
    subject: `New testimonial from ${data.name} — pending approval`,
    heading: "New testimonial",
    lines: [`${data.name} · ${data.email}`, data.about ? `About: ${data.about}` : "", stars].filter(Boolean),
    quoted: data.review,
    action: { href: `${baseUrl}/admin/testimonials`, label: "Review & approve" },
  });
}

export function removalAlert(
  data: { personName: string; slug: string; email: string; reason: string },
  baseUrl: string
): EmailContent {
  const label = data.personName || data.slug;
  return alertEmail({
    subject: `Removal request for ${label}`,
    heading: "Removal request",
    lines: [`Requested by ${data.email}`],
    link: { lead: `Profile: ${label}`, href: `${baseUrl}/people/${encodeURIComponent(data.slug)}` },
    quoted: data.reason,
    action: { href: `${baseUrl}/admin/removal-requests`, label: "Review request" },
  });
}

export function signInRefusedAlert(data: { device: string; reason: "rejected" | "wrong-number" }, baseUrl: string): EmailContent {
  const why = data.reason === "wrong-number" ? "The wrong number was picked." : "It was rejected.";
  return alertEmail({
    subject: `Admin sign-in refused — ${data.device}`,
    heading: "Admin sign-in refused",
    lines: [`Device: ${data.device}`, `${why} The password was right, so change it if this was not you.`],
    action: { href: `${baseUrl}/admin/dashboard`, label: "Open admin" },
  });
}
