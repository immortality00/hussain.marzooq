import { Resend } from "resend";
import { escapeHtml } from "@/lib/server/escape-html";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO = process.env.NOTIFICATION_EMAIL ?? "";
const FROM = "HM Visuals <onboarding@resend.dev>";

export async function sendInquiryNotification(data: {
  name: string;
  email: string;
  message: string;
  serviceName: string | null;
  category: string | null;
}) {
  if (!TO) return;
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New inquiry from ${data.name}`,
    html: `
      <h2>New Inquiry — HM Visuals</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${data.serviceName ? `<p><strong>Service:</strong> ${escapeHtml(data.serviceName)}</p>` : ""}
      ${data.category ? `<p><strong>Category:</strong> ${escapeHtml(data.category)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${escapeHtml(data.message).replace(/\n/g, "<br>")}</blockquote>
      <p style="margin-top:24px"><a href="https://hussainmarzooq.com/admin/inquiries">View in admin →</a></p>
    `,
  });
}

export async function sendTestimonialNotification(data: {
  name: string;
  email: string;
  review: string;
  rating: number | null;
  about: string | null;
}) {
  if (!TO) return;
  const stars = data.rating ? "★".repeat(data.rating) + "☆".repeat(5 - data.rating) : "—";
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New testimonial from ${data.name} — pending approval`,
    html: `
      <h2>New Testimonial — HM Visuals</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${data.about ? `<p><strong>About:</strong> ${escapeHtml(data.about)}</p>` : ""}
      <p><strong>Rating:</strong> ${stars}</p>
      <p><strong>Review:</strong></p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${escapeHtml(data.review).replace(/\n/g, "<br>")}</blockquote>
      <p style="margin-top:24px"><a href="https://hussainmarzooq.com/admin/testimonials">Review &amp; approve →</a></p>
    `,
  });
}
