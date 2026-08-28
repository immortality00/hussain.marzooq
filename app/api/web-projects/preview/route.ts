import { NextResponse } from "next/server";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { toProjectUrl } from "@/lib/web-projects";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;
const PREVIEW_WIDTH = 1200;
const PREVIEW_HEIGHT = 900;
const UPSTREAM_TIMEOUT_MS = 15_000;

export async function GET(req: Request) {
  const target = new URL(req.url).searchParams.get("url") ?? "";
  const normalized = toProjectUrl(target);
  if (!normalized) {
    return NextResponse.json({ ok: false, error: "Invalid url" }, { status: 400 });
  }

  const rate = await consumeFixedWindowRateLimit({
    bucket: "web-project-preview",
    key: getClientAddress(req),
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (rate.limited) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const shot = `https://image.thum.io/get/width/${PREVIEW_WIDTH}/crop/${PREVIEW_HEIGHT}/noanimate/${normalized}`;

  try {
    const upstream = await fetch(shot, {
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ ok: false, error: "Preview unavailable" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Preview unavailable" }, { status: 502 });
  }
}
