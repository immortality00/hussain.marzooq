import { absoluteUrl } from "@/lib/seo/site-url";
import { escapeHtml } from "@/lib/server/escape-html";

// The look of the visitor emails: black like the site's default theme, the signature on top, serif headlines,
// one outlined pill. Inline styles and colour literals only — mail clients drop stylesheets and cannot read the
// site's tokens (the same exception as the OG card). Tables keep the column steady in Outlook.

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const SIGNATURE = { path: "/brand/signature-white.png", width: 140, height: 69 };

const row = (cell: string, style = "") => `<tr><td style="${style}">${cell}</td></tr>`;

export function headline(text: string, size = 34) {
  return row(
    `<h1 style="margin:0;font-family:${SERIF};font-weight:400;font-size:${size}px;line-height:1.15;letter-spacing:-0.01em;color:#f5f5f5">${escapeHtml(text)}</h1>`
  );
}

export function paragraph(text: string) {
  return row(`<p style="margin:0;font-family:${SANS};font-size:16px;line-height:1.65;color:#b3b3b3">${escapeHtml(text)}</p>`, "padding:18px 0 0");
}

export function meta(text: string) {
  return row(`<p style="margin:0;font-family:${SANS};font-size:13px;letter-spacing:0.04em;color:#8a8a8a">${escapeHtml(text)}</p>`, "padding:0 0 14px");
}

/**
 * An outlined pill: white border and white text, no fill. A filled button failed in testing — mail apps dropped the
 * fill (black text on black in light mode) or dimmed it in dark mode — while light-on-dark is what every dark-mode
 * pass leaves alone. The border sits on a table cell, the most reliably drawn button in email.
 */
export function pill(href: string, label: string) {
  return row(
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr><td align="center" style="border:1px solid #ffffff;border-radius:999px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 32px;font-family:${SANS};font-size:15px;font-weight:600;letter-spacing:0.01em;color:#ffffff;text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`,
    "padding:32px 0 0"
  );
}

export function note(text: string) {
  return row(`<p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:#8a8a8a">${escapeHtml(text)}</p>`, "padding:28px 0 0");
}

/** The address itself under a button, for mail apps that block or strip buttons. */
export function plainLink(lead: string, href: string) {
  return row(
    `<p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:#8a8a8a">${escapeHtml(lead)}<br><a href="${escapeHtml(href)}" style="color:#b3b3b3;word-break:break-all">${escapeHtml(href)}</a></p>`,
    "padding:20px 0 0"
  );
}

export function image(src: string, href: string) {
  return row(
    `<a href="${escapeHtml(href)}"><img src="${escapeHtml(src)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:20px"></a>`,
    "padding:0 0 30px"
  );
}

/** `footer` is trusted HTML built by the caller (it may hold Resend's unsubscribe placeholder). */
export function frame({ title, preheader, body, footer }: { title: string; preheader: string; body: string; footer: string }) {
  const site = absoluteUrl("/");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#000000">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000"><tr><td align="center" style="padding:44px 18px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td align="center" style="padding:0 0 40px"><a href="${escapeHtml(site)}"><img src="${escapeHtml(absoluteUrl(SIGNATURE.path))}" alt="Hussain.Art" width="${SIGNATURE.width}" height="${SIGNATURE.height}" style="display:block;border:0"></a></td></tr>
${body}
<tr><td style="padding:44px 0 0"><div style="border-top:1px solid #262626;font-size:0;line-height:0">&nbsp;</div></td></tr>
<tr><td align="center" style="padding:22px 0 0;font-family:${SANS};font-size:12px;line-height:1.7;color:#7a7a7a">${footer}</td></tr>
</table></td></tr></table>
</body></html>`;
}

export function footerLink(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="color:#b3b3b3;text-decoration:underline">${escapeHtml(label)}</a>`;
}
