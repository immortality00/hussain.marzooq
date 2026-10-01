import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import {
  ADMIN_BUILD,
  ADMIN_SNAPSHOT_PATH,
  adminMediaCount,
  KNOWN_VERSION_HEADER,
  MEDIA_COUNT_HEADER,
} from "@/lib/admin-data";
import { emit, state, type AdminSlice } from "./state";
import { noteWrite, settleChanges, writtenSince } from "./changes";
import { keepPreview } from "./preview";
import { keepSame } from "../keep-same";
import { adminSignInHref, redirectedRecently, reloadOnceFor } from "./sign-in";

type SnapshotBody =
  | { ok: true; unchanged?: boolean; version: string; data?: AdminSnapshot }
  | { ok: false; error?: string };

let inFlight: Promise<void> | null = null;
let again = false;
let retriedSignIn = false;
let queue: Promise<void> = Promise.resolve();

const shownMedia = () => adminMediaCount(state.data?.media.items.length ?? 0);

function stopWith(update: () => void) {
  settleChanges();
  update();
  emit();
}

function handleUnauthorized() {
  if (!state.data) {
    if (redirectedRecently()) return stopWith(() => {
      state.signedOut = true;
    });
    location.assign(adminSignInHref());
    return;
  }
  if (!retriedSignIn) {
    retriedSignIn = true;
    again = true;
    return;
  }
  stopWith(() => {
    state.signedOut = true;
  });
}

function fail(message: string) {
  stopWith(() => {
    if (!state.data) state.failure = message;
  });
}

async function request(requestedMedia: number) {
  const headers: Record<string, string> = { [MEDIA_COUNT_HEADER]: String(requestedMedia) };
  if (state.version) headers[KNOWN_VERSION_HEADER] = state.version;
  return fetch(ADMIN_SNAPSHOT_PATH, { cache: "no-store", headers });
}

async function fetchSnapshot() {
  const startedAt = Date.now();
  const requestedMedia = shownMedia();
  let res: Response;
  try {
    res = await request(requestedMedia);
  } catch {
    return fail("No connection.");
  }
  if (res.status === 401) return handleUnauthorized();
  const body = (await res.json().catch(() => null)) as SnapshotBody | null;
  if (!res.ok || !body?.ok) {
    return fail((body && !body.ok && body.error) || `Could not load the admin (error ${res.status}).`);
  }
  if (writtenSince(startedAt) || shownMedia() > requestedMedia) {
    again = true;
    return;
  }
  if (body.data && body.data.build !== ADMIN_BUILD && reloadOnceFor(body.data.build)) return;

  const wasHeld = settleChanges();
  const wasSignedOut = state.signedOut;
  state.failure = null;
  state.signedOut = false;
  retriedSignIn = false;
  let changed = false;
  if (body.data && !body.unchanged) {
    const next = keepSame(body.data, state.data);
    state.version = body.version;
    changed = next !== state.data;
    if (changed) {
      state.data = next;
      state.generation += 1;
      keepPreview(next);
    }
  }
  if (changed || wasHeld || wasSignedOut) emit();
}

export function refreshAdminData({ changed = false }: { changed?: boolean } = {}): Promise<void> {
  if (inFlight) {
    if (changed) again = true;
    return inFlight;
  }
  inFlight = (async () => {
    do {
      again = false;
      await fetchSnapshot();
    } while (again);
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export function markAdminDataChanged(touches: readonly AdminSlice[]) {
  noteWrite(touches);
  emit();
  void refreshAdminData({ changed: true });
}

export function runAfterAdminData(task: () => Promise<unknown>) {
  queue = queue
    .then(async () => {
      await Promise.resolve();
      while (inFlight) await inFlight;
      await task();
    })
    .catch(() => {});
  return queue;
}
