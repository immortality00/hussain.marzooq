import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createUploadLink, deletePinataFile, getPinataFile, listPinataFilesFor, pinataReady, pinText } from "@/lib/server/pinata";

const CID = "bafkreicnu2aqjkoglrlrd65giwo4l64pdajxffk6jtq2vb7yaiopc3yu7m";
const ID = "01919457-c2c6-770e-9391-8c72c4f41f64";
const MEDIA = "507f1f77bcf86cd799439011";

const fetchMock = vi.fn();
const answer = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const lastCall = () => fetchMock.mock.calls.at(-1) as [string, RequestInit];

beforeEach(() => {
  vi.stubEnv("PINATA_JWT", "test-jwt");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("pinata", () => {
  test("is off without a key", () => {
    vi.stubEnv("PINATA_JWT", " ");
    expect(pinataReady()).toBe(false);
  });

  test("an upload link is limited to one kind of file, its size and five minutes", async () => {
    fetchMock.mockResolvedValue(answer({ data: "https://uploads.pinata.cloud/v3/files/abc?X-Signature=1" }));
    const url = await createUploadLink({ mediaId: MEDIA, kind: "thumbnail", fileName: "thumbnail.jpg" });
    expect(url).toBe("https://uploads.pinata.cloud/v3/files/abc?X-Signature=1");

    const [target, init] = lastCall();
    expect(target).toBe("https://uploads.pinata.cloud/v3/files/sign");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-jwt");
    expect(JSON.parse(String(init.body))).toMatchObject({
      network: "public",
      expires: 300,
      max_file_size: 1024 * 1024,
      allow_mime_types: ["image/jpeg"],
      filename: "thumbnail.jpg",
      keyvalues: { media: MEDIA, kind: "thumbnail" },
      cid_version: "v1",
    });
  });

  test("a link on another host is refused", async () => {
    fetchMock.mockResolvedValue(answer({ data: "https://evil.example/v3/files/abc" }));
    await expect(createUploadLink({ mediaId: MEDIA, kind: "display", fileName: "display.jpg" })).rejects.toThrow(
      "Pinata returned an upload link the site does not recognise."
    );
  });

  test("Pinata's own reason is reported, and the key never is", async () => {
    fetchMock.mockResolvedValue(answer({ error: { code: 403, message: "Key lacks org:files:write" } }, 403));
    const failure = await createUploadLink({ mediaId: MEDIA, kind: "display", fileName: "display.jpg" }).catch((e: Error) => e.message);
    expect(failure).toBe("Pinata answered 403: Key lacks org:files:write");
    expect(failure).not.toContain("test-jwt");
  });

  test("pins text publicly and reads the file record back", async () => {
    fetchMock.mockResolvedValue(answer({ data: { id: ID, cid: CID, name: "a.json", size: 36, mime_type: "application/json" } }));
    const file = await pinText({ name: "a.json", text: "{}", mimeType: "application/json", keyvalues: { media: MEDIA, kind: "metadata" } });
    expect(file).toEqual({ id: ID, cid: CID, name: "a.json", size: 36, mimeType: "application/json", keyvalues: {} });

    const form = lastCall()[1].body as FormData;
    expect(form.get("network")).toBe("public");
    expect(form.get("keyvalues")).toBe(JSON.stringify({ media: MEDIA, kind: "metadata" }));
    expect(await (form.get("file") as File).text()).toBe("{}");
  });

  test("a file record without a CIDv1 is refused", async () => {
    fetchMock.mockResolvedValue(answer({ data: { id: ID, cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG", size: 3 } }));
    await expect(getPinataFile(ID)).rejects.toThrow("Pinata returned a file record the site cannot read.");
  });

  test("looks a file up, lists an artwork's files and deletes by id", async () => {
    const record = { id: ID, cid: CID, name: "x", size: 5, mime_type: "image/jpeg", keyvalues: { media: MEDIA, kind: "display", n: 3 } };
    fetchMock.mockResolvedValue(answer({ data: record }));
    expect((await getPinataFile(ID)).keyvalues).toEqual({ media: MEDIA, kind: "display" });
    expect(lastCall()[0]).toBe(`https://api.pinata.cloud/v3/files/public/${ID}`);

    const licence = { ...record, id: "licence", keyvalues: { kind: "licence", version: "1.0" } };
    const other = { ...record, id: "other", keyvalues: { media: "607f1f77bcf86cd799439011", kind: "artifact" } };
    fetchMock.mockResolvedValue(answer({ data: { files: [record, { id: "broken" }, licence, other] } }));
    expect((await listPinataFilesFor(MEDIA)).map((file) => file.id)).toEqual([ID]);
    expect(lastCall()[0]).toBe(`https://api.pinata.cloud/v3/files/public?keyvalues%5Bmedia%5D=${MEDIA}&limit=100`);

    fetchMock.mockResolvedValue(answer({ data: null }));
    await deletePinataFile(ID);
    expect(lastCall()[1].method).toBe("DELETE");
  });
});
