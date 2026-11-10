import { getDb } from "@/lib/server/db";
import { warmableUrl, warmImageSizes } from "@/lib/server/cloudinary-warm";
import { settleLimited } from "@/lib/settle-limited";

/**
 * Makes every photo size the site can ask for ready at Cloudinary, so no visitor is
 * the first to open one (see lib/server/cloudinary-warm.ts). Reads the library only —
 * the read-only hm-local login is enough. New uploads are warmed by the media routes.
 */
process.loadEnvFile(".env.local");

const db = await getDb();
const docs = await db
  .collection("media")
  .find({ type: { $in: ["image", "embed"] } }, { projection: { type: 1, secureUrl: 1, posterUrl: 1, deliveryType: 1, isPublic: 1 } })
  .toArray();
const targets = docs
  .map((doc) => ({ url: warmableUrl(doc), textures: doc.type === "image" }))
  .filter((t): t is { url: string; textures: boolean } => Boolean(t.url));
const urls = targets.map((t) => t.url);
console.log(`Warming ${urls.length} photos and video posters…`);

let done = 0;
let failedSizes = 0;
await settleLimited(targets, 3, async ({ url, textures }) => {
  const { failed } = await warmImageSizes(url, fetch, textures);
  failedSizes += failed.length;
  for (const line of failed) console.error(`Not ready: ${line}`);
  done += 1;
  if (done % 25 === 0 || done === urls.length) console.log(`${done}/${urls.length}`);
});

console.log(`Done: ${urls.length} photos, ${failedSizes} sizes failed.`);
if (failedSizes) process.exitCode = 1;
process.exit();
