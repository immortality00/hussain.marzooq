import { requireAdminOr401 } from "@/lib/auth/admin";
import { asNullableString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import { duplicateVideoMessage, findMediaWithVideo } from "@/app/api/_lib/media";
import { getDb } from "@/lib/server/db";
import { fetchVideoPreview } from "@/lib/server/video-posters";
import { parseVideoLink, videoEmbedSrc, videoWatchUrl } from "@/lib/video-embed";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const body = (await req.json().catch(() => null)) as unknown;
  const video = parseVideoLink((isRecord(body) ? asNullableString(body.url) : null) ?? "");
  if (!video) {
    return noStoreJson({ ok: false, error: "Not a YouTube or Vimeo video link." }, { status: 400 });
  }

  const duplicate = await findMediaWithVideo(await getDb(), video);
  if (duplicate) {
    return noStoreJson({ ok: false, error: duplicateVideoMessage(duplicate) }, { status: 409 });
  }

  const { title, preview } = await fetchVideoPreview(video);

  return noStoreJson({
    ok: true,
    embedUrl: videoEmbedSrc(video),
    watchUrl: videoWatchUrl(video),
    title,
    preview,
  });
}
