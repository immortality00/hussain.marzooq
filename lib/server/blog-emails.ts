import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";
import { isHttpUrl } from "@/lib/http-url";
import { absoluteUrl } from "@/lib/seo/site-url";
import type { EmailContent } from "@/lib/server/email";
import { footerLink, frame, headline, image, meta, note, paragraph, pill, plainLink } from "@/lib/server/email-frame";

/** Resend swaps this for each subscriber's own unsubscribe link when the broadcast goes out. */
export const UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export const SUBSCRIBE_PAGE_PATH = "/subscribe";

/** 2× the email's 560px column, and a width already on Cloudinary's strict allow list. */
const COVER_WIDTH = 1200;
const PREVIEW_MAX = 150;
const SIGN_OFF = "Hussain.Art — Dubai based, available worldwide.";

export type PostEmailInput = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: Date | null;
  readingMinutes: number;
};

export function confirmationLink(token: string) {
  return `${absoluteUrl(SUBSCRIBE_PAGE_PATH)}#t=${token}`;
}

const CONFIRM = {
  preheader: "One tap, and every new story finds its way to you.",
  heading: "One tap and you’re in.",
  body: "You asked to hear when something new leaves the darkroom. Confirm below, and every new story lands here the moment it’s published. Nothing else.",
  detail: "Expect editorial stories, the making of a frame, and news from exhibitions — one email per story, never more.",
  button: "Confirm subscription",
  fallback: "Or open this link:",
  note: "The link expires in 24 hours. Didn’t ask for this? Ignore this email — nothing is added.",
};

const CONFIRM_SUBJECT = "Confirm your subscription to Hussain.Art";

export function confirmationEmail(link: string): EmailContent {
  return {
    subject: CONFIRM_SUBJECT,
    html: frame({
      title: CONFIRM_SUBJECT,
      preheader: CONFIRM.preheader,
      body: [
        headline(CONFIRM.heading),
        paragraph(CONFIRM.body),
        paragraph(CONFIRM.detail),
        pill(link, CONFIRM.button),
        plainLink(CONFIRM.fallback, link),
        note(CONFIRM.note),
      ].join("\n"),
      footer: SIGN_OFF,
    }),
    text: `${CONFIRM.heading}\n\n${CONFIRM.body}\n\n${CONFIRM.detail}\n\n${CONFIRM.button}: ${link}\n\n${CONFIRM.note}\n\n—\n${SIGN_OFF}`,
  };
}

function coverOf(url: string) {
  return isHttpUrl(url) ? cloudinaryImageLoader({ src: url, width: COVER_WIDTH }) : "";
}

function metaLine(post: PostEmailInput) {
  const date = post.publishedAt
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dubai" }).format(post.publishedAt)
    : "";
  return [date, post.readingMinutes > 0 ? `${post.readingMinutes} min read` : ""].filter(Boolean).join(" · ");
}

export function postEmail(post: PostEmailInput): EmailContent & { previewText: string } {
  const link = absoluteUrl(`/blog/${post.slug}`);
  const excerpt = post.excerpt.trim();
  const cover = coverOf(post.coverImageUrl);
  const line = metaLine(post);
  const previewText = excerpt.slice(0, PREVIEW_MAX);

  const body = [
    cover ? image(cover, link) : "",
    line ? meta(line) : "",
    headline(post.title, 32),
    excerpt ? paragraph(excerpt) : "",
    pill(link, "Read the story"),
  ].filter(Boolean);

  const footer = `You’re receiving this because you subscribed at hussain.art · ${footerLink(UNSUBSCRIBE_PLACEHOLDER, "Unsubscribe")}<br>${SIGN_OFF}`;

  return {
    subject: post.title,
    previewText,
    html: frame({ title: post.title, preheader: previewText || "A new story from Hussain.Art.", body: body.join("\n"), footer }),
    text: [
      line,
      post.title,
      excerpt,
      `Read the story: ${link}`,
      `—\nYou’re receiving this because you subscribed at hussain.art.\nUnsubscribe: ${UNSUBSCRIBE_PLACEHOLDER}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}
