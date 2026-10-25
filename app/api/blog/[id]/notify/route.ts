import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import { asString, noStoreJson } from "@/app/api/_lib/common";
import { errorMessage } from "@/lib/error-message";
import { readingMinutes } from "@/lib/reading-time";
import { savedBlogPost } from "@/app/admin/(protected)/blog/lib/server";
import { postEmail } from "@/lib/server/blog-emails";
import { sendPostBroadcast, subscriptionsReady } from "@/lib/server/blog-subscribers";
import { getDb } from "@/lib/server/db";
import { getBlogActive } from "@/lib/server/page-settings";

export const dynamic = "force-dynamic";

function refuse(error: string, status: number) {
  return noStoreJson({ ok: false, error }, { status });
}

/** Sends a published post to the blog's subscribers, once. `notifiedAt` is claimed before the send. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  if (!subscriptionsReady()) return refuse("Subscriber emails are not set up.", 503);

  const db = await getDb();
  const found = await findByIdOr404(db, "blog_posts", oid);
  if (found instanceof Response) return found;
  const post = found.doc;

  const now = new Date();
  const live = post.isPublished === true && post.publishedAt instanceof Date && post.publishedAt <= now;
  if (!live) return refuse("Not sent: the post isn't published.", 409);
  if (!(await getBlogActive())) return refuse("Not sent: the blog is turned off.", 409);

  const posts = db.collection("blog_posts");
  const claim = await posts.updateOne({ _id: oid, notifiedAt: null }, { $set: { notifiedAt: now } });
  if (claim.modifiedCount === 0) return refuse("Already sent to subscribers.", 409);

  try {
    const broadcastId = await sendPostBroadcast(
      String(oid),
      postEmail({
        title: asString(post.title),
        slug: asString(post.slug),
        excerpt: asString(post.excerpt),
        coverImageUrl: asString(post.coverImageUrl),
        publishedAt: post.publishedAt,
        readingMinutes: readingMinutes(asString(post.content)),
      })
    );
    await posts.updateOne({ _id: oid }, { $set: { broadcastId } });
  } catch (error) {
    await posts.updateOne({ _id: oid }, { $set: { notifiedAt: null } });
    console.error("[blog-notify] send failed", error);
    return refuse(`Not sent: ${errorMessage(error, "Resend did not answer.")}`, 502);
  }

  const saved = await posts.findOne({ _id: oid });
  return noStoreJson({ ok: true, ...(saved ? await savedBlogPost(saved) : {}) });
}
