import { isCidV1, MINT_FILE_RULES, type MintFileKind } from "@/lib/nft/mint-fields";

// Every call to Pinata (IPFS pinning). The key (PINATA_JWT) is a server secret: the browser only
// ever gets a short-lived upload link for one file, limited in size and type.
// API: docs.pinata.cloud/api-reference (v3). The key needs Files: Read and Write, nothing else.

const UPLOADS = "https://uploads.pinata.cloud/v3";
const API = "https://api.pinata.cloud/v3";
const TIMEOUT_MS = 20_000;
const LINK_SECONDS = 300;

export type PinataFile = {
  id: string;
  cid: string;
  name: string;
  size: number;
  mimeType: string;
  keyvalues: Record<string, string>;
};

const jwt = () => (process.env.PINATA_JWT ?? "").trim();

export const pinataReady = () => jwt().length > 0;

async function call(url: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${jwt()}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Pinata answered ${response.status}: ${reasonOf(body)}`);
  return body;
}

function reasonOf(body: unknown): string {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const error = record.error;
  if (typeof error === "string") return error.slice(0, 200);
  if (error && typeof error === "object") {
    const inner = error as Record<string, unknown>;
    const text = inner.message ?? inner.reason ?? inner.details;
    if (typeof text === "string") return text.slice(0, 200);
  }
  return typeof record.message === "string" ? record.message.slice(0, 200) : "no reason given";
}

function fileOf(data: unknown): PinataFile {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const keyvalues: Record<string, string> = {};
  if (record.keyvalues && typeof record.keyvalues === "object") {
    for (const [key, value] of Object.entries(record.keyvalues)) {
      if (typeof value === "string") keyvalues[key] = value;
    }
  }
  if (typeof record.id !== "string" || !isCidV1(record.cid) || typeof record.size !== "number") {
    throw new Error("Pinata returned a file record the site cannot read.");
  }
  return {
    id: record.id,
    cid: record.cid,
    name: typeof record.name === "string" ? record.name : "",
    size: record.size,
    mimeType: typeof record.mime_type === "string" ? record.mime_type : "",
    keyvalues,
  };
}

const dataOf = (body: unknown) => (body && typeof body === "object" ? (body as { data?: unknown }).data : undefined);

/** A link the browser can upload exactly one file to, for five minutes. */
export async function createUploadLink(input: { mediaId: string; kind: MintFileKind; fileName: string }) {
  const rules = MINT_FILE_RULES[input.kind];
  const body = await call(`${UPLOADS}/files/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      network: "public",
      date: Math.floor(Date.now() / 1000),
      expires: LINK_SECONDS,
      max_file_size: rules.maxBytes,
      allow_mime_types: rules.mimeTypes,
      filename: input.fileName,
      keyvalues: { media: input.mediaId, kind: input.kind },
      cid_version: "v1",
    }),
  });
  const url = dataOf(body);
  if (typeof url !== "string" || !url.startsWith(`${UPLOADS}/`)) {
    throw new Error("Pinata returned an upload link the site does not recognise.");
  }
  return url;
}

/** Pins a small text file from the server (metadata, the licence). The same content gives the same address. */
export async function pinText(input: { name: string; text: string; mimeType: string; keyvalues: Record<string, string> }) {
  const form = new FormData();
  form.append("network", "public");
  form.append("name", input.name);
  form.append("keyvalues", JSON.stringify(input.keyvalues));
  form.append("file", new File([input.text], input.name, { type: input.mimeType }));
  return fileOf(dataOf(await call(`${UPLOADS}/files`, { method: "POST", body: form })));
}

export async function getPinataFile(id: string) {
  return fileOf(dataOf(await call(`${API}/files/public/${encodeURIComponent(id)}`, { method: "GET" })));
}

/**
 * Every file pinned for one media item (uploads carry its id as a key value).
 * The filter is `keyvalues[…]`: Pinata's reference names it `metadata[…]`, which the API ignores and
 * answers with every file (tested 2026-11-12). Callers delete from this list, so each record's own
 * key value is checked here too: a filter that stops working can never hand back another artwork's files.
 */
export async function listPinataFilesFor(mediaId: string): Promise<PinataFile[]> {
  const query = new URLSearchParams({ "keyvalues[media]": mediaId, limit: "100" });
  const data = dataOf(await call(`${API}/files/public?${query}`, { method: "GET" }));
  const files = data && typeof data === "object" ? (data as { files?: unknown }).files : null;
  if (!Array.isArray(files)) return [];
  return files.flatMap((entry) => {
    try {
      const file = fileOf(entry);
      return file.keyvalues.media === mediaId ? [file] : [];
    } catch {
      return [];
    }
  });
}

export async function deletePinataFile(id: string) {
  await call(`${API}/files/public/${encodeURIComponent(id)}`, { method: "DELETE" });
}
