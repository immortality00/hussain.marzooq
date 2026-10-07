import { v2 as cloudinary } from "cloudinary";
import { strictAllowList } from "@/lib/cloudinary-delivery";
import { ensureCloudinaryConfigured } from "@/lib/server/cloudinary";
import { cloudinaryErrorMessage } from "@/lib/server/cloudinary-assets";

process.loadEnvFile(".env.local");
ensureCloudinaryConfigured();

async function alreadyAllowed(): Promise<Set<string>> {
  const allowed = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await cloudinary.api.transformations({ max_results: 500, next_cursor: cursor });
    for (const entry of page.transformations) if (entry.allowed_for_strict) allowed.add(entry.name);
    cursor = page.next_cursor;
  } while (cursor);
  return allowed;
}

const wanted = strictAllowList();
const allowed = await alreadyAllowed();
const missing = wanted.filter((name) => !allowed.has(name));
const failed: string[] = [];

for (const name of missing) {
  try {
    await cloudinary.api.update_transformation(name, { allowed_for_strict: true });
  } catch (error) {
    failed.push(`${name}: ${cloudinaryErrorMessage(error)}`);
  }
}

console.log(`Allow list: ${wanted.length} entries, ${wanted.length - missing.length} already allowed, ${missing.length - failed.length} added.`);
for (const line of failed) console.error(`Not allowed: ${line}`);
if (failed.length) process.exitCode = 1;
