import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";

type MediaType = "image" | "video" | "embed";

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("hm_admin")?.value === "ok";

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  const type = body.type;
  if (type !== "image" && type !== "video" && type !== "embed") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Shared metadata (keep MVP minimal — we’ll expand later)
  const title = isString(body.title) ? body.title.trim() : "";
  const description = isString(body.description) ? body.description.trim() : "";
  const location = isString(body.location) ? body.location.trim() : "";
  const event = isString(body.event) ? body.event.trim() : "";
  const year = typeof body.year === "number" ? body.year : null;

  const tags = isStringArray(body.tags) ? body.tags : [];
  const categories = isStringArray(body.categories) ? body.categories : [];
  const people = isStringArray(body.people) ? body.people : []; // names/slugs later
  const projectId = isString(body.projectId) ? body.projectId : null;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Asset fields
  let asset: Record<string, unknown> = {};

  if (type === "embed") {
    const embedUrl = isString(body.embedUrl) ? body.embedUrl.trim() : "";
    if (!embedUrl) {
      return NextResponse.json({ error: "embedUrl is required for embed" }, { status: 400 });
    }
    asset = { embedUrl };
  } else {
    // image/video from Cloudinary (or other CDN later)
    const secureUrl = isString(body.secureUrl) ? body.secureUrl.trim() : "";
    const publicId = isString(body.publicId) ? body.publicId.trim() : "";

    if (!secureUrl || !publicId) {
      return NextResponse.json(
        { error: "secureUrl and publicId are required for image/video" },
        { status: 400 }
      );
    }

    asset = {
      secureUrl,
      publicId,
      resourceType: isString(body.resourceType) ? body.resourceType : "auto",
      bytes: typeof body.bytes === "number" ? body.bytes : null,
      format: isString(body.format) ? body.format : null,
      width: typeof body.width === "number" ? body.width : null,
      height: typeof body.height === "number" ? body.height : null,
      duration: typeof body.duration === "number" ? body.duration : null,
    };
  }

  const doc = {
    type: type as MediaType,
    title,
    description: description || null,
    location: location || null,
    event: event || null,
    year,

    tags,
    categories,
    people,
    projectId,

    asset,

    // ordering controls (we’ll use later for drag/drop)
    order: typeof body.order === "number" ? body.order : 0,

    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const result = await db.collection("media").insertOne(doc);

  const res = NextResponse.json({ ok: true, id: String(result.insertedId) });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
