import { Resend } from "resend";
import { postSender, siteSender, type EmailContent } from "@/lib/server/email";

/** The Resend segment that holds confirmed blog subscribers; found by name, created on first use. */
export const BLOG_SEGMENT_NAME = "Blog subscribers";

type ResendError = { name: string; message: string };

let client: { key: string; resend: Resend } | null = null;
let segmentId: string | null = null;

function audienceKey() {
  return (process.env.RESEND_AUDIENCE_KEY ?? "").trim();
}

/**
 * Sign-ups and post emails need both a Full-access key (`RESEND_AUDIENCE_KEY` — contacts and broadcasts are not
 * open to a Sending-access key) and press@ on the verified domain.
 */
export function subscriptionsReady() {
  return Boolean(audienceKey() && siteSender("press"));
}

function audience(): Resend {
  const key = audienceKey();
  if (!key) throw new Error("RESEND_AUDIENCE_KEY is not set.");
  if (client?.key !== key) client = { key, resend: new Resend(key) };
  return client.resend;
}

function refused(action: string, error: ResendError) {
  segmentId = null;
  return new Error(`Resend refused to ${action}: ${error.message}`);
}

async function blogSegmentId(resend: Resend): Promise<string> {
  if (segmentId) return segmentId;
  const listed = await resend.segments.list();
  if (listed.error) throw refused("list segments", listed.error);
  const found = listed.data.data.find((segment) => segment.name === BLOG_SEGMENT_NAME);
  if (found) return (segmentId = found.id);
  const created = await resend.segments.create({ name: BLOG_SEGMENT_NAME });
  if (created.error) throw refused("create the segment", created.error);
  return (segmentId = created.data.id);
}

/** Adds a confirmed address. One that is already a contact (say, unsubscribed earlier) is subscribed again. */
export async function addSubscriber(email: string) {
  const resend = audience();
  const segment = await blogSegmentId(resend);
  const created = await resend.contacts.create({ email, unsubscribed: false, segments: [{ id: segment }] });
  if (!created.error) return;

  const updated = await resend.contacts.update({ email, unsubscribed: false });
  if (updated.error) throw refused("add the subscriber", created.error);
  const segments = await resend.contacts.segments.list({ email });
  if (segments.error) throw refused("read the subscriber's segments", segments.error);
  if (segments.data.data.some((s) => s.id === segment)) return;
  const added = await resend.contacts.segments.add({ email, segmentId: segment });
  if (added.error) throw refused("add the subscriber to the segment", added.error);
}

/** The id of a broadcast already sent (or sending) under this name, so a retry never emails anyone twice. */
async function sentBroadcast(resend: Resend, name: string): Promise<string | null> {
  const listed = await resend.broadcasts.list({ limit: 100 });
  if (listed.error) throw refused("list broadcasts", listed.error);
  return listed.data.data.find((b) => b.name === name && b.status !== "draft")?.id ?? null;
}

/** Sends one post to every subscriber, from press@ on the posts' own subdomain once set. Returns the broadcast id. */
export async function sendPostBroadcast(postId: string, content: EmailContent & { previewText: string }) {
  const sender = postSender();
  if (!sender) throw new Error("RESEND_DOMAIN does not cover press@.");
  const resend = audience();
  const name = `blog-post:${postId}`;
  const earlier = await sentBroadcast(resend, name);
  if (earlier) return earlier;

  const created = await resend.broadcasts.create({
    name,
    segmentId: await blogSegmentId(resend),
    from: sender.from,
    ...(sender.replyTo ? { replyTo: sender.replyTo } : {}),
    subject: content.subject,
    previewText: content.previewText,
    html: content.html,
    text: content.text,
    send: true,
  });
  if (created.error) throw refused("send the post", created.error);
  return created.data.id;
}
