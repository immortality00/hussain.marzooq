import { v2 as cloudinary } from "cloudinary";
import { deliveredTransforms } from "@/lib/cloudinary-delivery";
import { ensureCloudinaryConfigured } from "@/lib/server/cloudinary";
import { parseCloudinaryAssetFromUrl } from "@/lib/server/cloudinary-assets";

process.loadEnvFile(".env.local");
ensureCloudinaryConfigured();

const origin = process.argv[2] ?? "https://hussain-marzooq.com";
const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const OUTSIDE_ROUTES: [string, string][] = [
  ["youtube", "dQw4w9WgXcQ.jpg"],
  ["vimeo", "76979871.jpg"],
  ["facebook", "4.jpg"],
  ["gravatar", "205e460b479e2e5b48aec07710c08d50.jpg"],
  ["dailymotion", "x7tgad0.jpg"],
  ["fetch", "https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg"],
];
const randomWidth = () => 300 + Math.floor(Math.random() * 600);

async function status(url: string): Promise<number> {
  const response = await fetch(url);
  await response.body?.cancel();
  return response.status;
}

async function fileExists(url: string): Promise<boolean> {
  const asset = parseCloudinaryAssetFromUrl(url);
  if (!asset) return false;
  try {
    const resource = await cloudinary.api.resource(asset.publicId, { resource_type: asset.resourceType });
    return resource.bytes > 0 && !resource.placeholder;
  } catch {
    return false;
  }
}

async function siteImageUrls(): Promise<string[]> {
  const sitemap = await fetch(`${origin}/sitemap.xml`).then((r) => r.text());
  const urls = new Set<string>();
  for (const [, page] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const html = await fetch(page).then((r) => r.text());
    for (const [url] of html.matchAll(/https:\/\/res\.cloudinary\.com\/[^"'\s\\<>)]+/g)) urls.add(url.replace(/&amp;/g, "&").replace(/,$/, ""));
  }
  return [...urls];
}

const urls = await siteImageUrls();
const failing: string[] = [];
for (let i = 0; i < urls.length; i += 8) {
  const batch = urls.slice(i, i + 8);
  const codes = await Promise.all(batch.map(status));
  batch.forEach((url, index) => codes[index] >= 400 && failing.push(url));
}
const refused: string[] = [];
for (const url of failing) if (await fileExists(url)) refused.push(url);

const photo = urls.find((url) => /\/image\/upload\/v\d+\//.test(url) && !failing.includes(url)) ?? "";
const asset = parseCloudinaryAssetFromUrl(photo);
const derived = asset ? (await cloudinary.api.resource(asset.publicId)).derived ?? [] : [];
const generated = new Set(derived.map((entry: { transformation: string }) => entry.transformation.replace(/\/[a-z0-9]*$/, "")));
const freshAllowed = deliveredTransforms().find((transform) => !generated.has(transform)) ?? "";
const arbitrary = `w_${randomWidth()},e_grayscale`;

console.log(`Site images: ${urls.length} addresses, ${urls.length - failing.length} load, ${refused.length} refused by Cloudinary.`);
for (const url of refused) console.log(`  refused: ${url}`);
console.log(`Allowed size never generated before (${freshAllowed}): ${await status(photo.replace("/upload/", `/upload/${freshAllowed}/`))}`);
console.log(`Arbitrary new size (${arbitrary}): ${await status(photo.replace("/upload/", `/upload/${arbitrary}/`))}`);
for (const [type, id] of OUTSIDE_ROUTES) {
  console.log(`Outside route ${type}: ${await status(`https://res.cloudinary.com/${cloud}/image/${type}/w_${randomWidth()}/${id}`)}`);
}
if (refused.length) process.exitCode = 1;
