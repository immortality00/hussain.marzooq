import { adminWrite } from "@/lib/client/admin-store";
import { isPinataFileId, MINT_FILE_RULES, type MintFileKind } from "@/lib/nft/mint-fields";

// One file, from the browser straight to Pinata: the server hands out a five-minute link limited
// to that file's size and type, and never sees the file itself.

async function reasonOf(response: Response, fallback: string) {
  const body: unknown = await response.json().catch(() => null);
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const error = record.error;
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object") {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message) return message;
  }
  return `${fallback} (${response.status})`;
}

export async function uploadToPinata(input: {
  mediaId: string;
  kind: MintFileKind;
  file: Blob;
  fileName: string;
}): Promise<{ id: string }> {
  const rules = MINT_FILE_RULES[input.kind];
  if (input.file.size > rules.maxBytes) {
    throw new Error(`The ${input.kind} file is over ${Math.round(rules.maxBytes / (1024 * 1024))} MB.`);
  }

  const link = await adminWrite(
    "/api/admin/nft/upload-link",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: input.mediaId, kind: input.kind, fileName: input.fileName }),
    },
    []
  );
  if (!link.ok) throw new Error(await reasonOf(link, "No upload link"));
  const { url } = (await link.json()) as { url?: unknown };
  if (typeof url !== "string") throw new Error("No upload link.");

  const form = new FormData();
  form.append("network", "public");
  form.append("file", input.file, input.fileName);
  const uploaded = await fetch(url, { method: "POST", body: form });
  if (!uploaded.ok) throw new Error(await reasonOf(uploaded, "Pinata refused the file"));

  const body = (await uploaded.json().catch(() => null)) as { data?: { id?: unknown } } | null;
  const id = body?.data?.id;
  if (!isPinataFileId(id)) throw new Error("Pinata did not confirm the upload.");
  return { id };
}
