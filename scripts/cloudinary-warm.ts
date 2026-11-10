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
const urls = docs.map(warmableUrl).filter((url): url is string => Boolean(url));
console.log(`Warming ${urls.length} photos and video posters…`);

let done = 0;
let failedSizes = 0;
await settleLimited(urls, 3, async (url) => {
  const { failed } = await warmImageSizes(url);
  failedSizes += failed.length;
  for (const line of failed) console.error(`Not ready: ${line}`);
  done += 1;
  if (done % 25 === 0 || done === urls.length) console.log(`${done}/${urls.length}`);
});

console.log(`Done: ${urls.length} photos, ${failedSizes} sizes failed.`);
if (failedSizes) process.exitCode = 1;
process.exit();
