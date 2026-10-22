import { isRecord } from "./common";

/** A JSON object body of at most `maxBytes` characters, or null for anything else. */
export async function readJsonObject(req: Request, maxBytes: number = 16 * 1024): Promise<Record<string, unknown> | null> {
  const text = await req.text().catch(() => "");
  if (!text || text.length > maxBytes) return null;
  try {
    const body: unknown = JSON.parse(text);
    return isRecord(body) && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}
