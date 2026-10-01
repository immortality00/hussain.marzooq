import { EXPECTED_VERSION_HEADER, RECORD_CHANGED } from "@/lib/record-changed";
import { asIsoDate, noStoreJson } from "./common";

function versionOf(doc: object | null | undefined): string | null {
  return asIsoDate((doc as { updatedAt?: unknown } | null | undefined)?.updatedAt);
}

export function changedSinceOpened(req: Request, doc: object | null | undefined) {
  const expected = req.headers.get(EXPECTED_VERSION_HEADER);
  return expected !== null && expected !== (versionOf(doc) ?? "");
}

export function recordChangedResponse(current: unknown) {
  return noStoreJson(
    { ok: false, code: RECORD_CHANGED, error: "This was changed on another device since you opened it.", current },
    { status: 409 }
  );
}
