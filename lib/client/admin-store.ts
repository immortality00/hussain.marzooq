import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { overviewOf, type AdminPreview } from "./admin-overview";
import type { AnalyticsStats } from "@/lib/server/analytics";
import { ADMIN_ANALYTICS_PATH, ADMIN_SNAPSHOT_PATH, KNOWN_VERSION_HEADER } from "@/lib/admin-data";
import { keepLoadedMedia } from "./keep-loaded-media";

export type { AdminPreview };
export type AdminSlice = keyof AdminSnapshot;
export type AdminChanges = { pending: boolean; applied: readonly AdminSlice[] };
type SliceUpdate<T> = T | ((previous: T) => T);

const PREVIEW_KEY = "hm.admin.preview";
const SIGN_IN_REDIRECT_KEY = "hm.admin.signin-redirect";
const SIGN_IN_REDIRECT_GAP_MS = 60_000;
const listeners = new Set<() => void>();

let data: AdminSnapshot | null = null;
let version: string | null = null;
let failure: string | null = null;
let signedOut = false;
let retriedSignIn = false;
let preview: AdminPreview | null | undefined;
let overview: { of: AdminSnapshot; value: AdminPreview } | null = null;
let changes: AdminChanges = { pending: false, applied: [] };
let analytics: AnalyticsStats | null = null;
let analyticsLoading: Promise<void> | null = null;
let inFlight: Promise<void> | null = null;
let again = false;
let lastLocalChange = 0;
let queue: Promise<void> = Promise.resolve();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeAdminData(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getAdminData = () => data;
export const getAdminDataFailure = () => failure;
export const getAdminSignedOut = () => signedOut;
export const getAdminAnalytics = () => analytics;
export const getAdminChanges = () => changes;

export function screenHeld(state: AdminChanges, reads?: readonly AdminSlice[]) {
  return state.pending && !(reads && reads.every((key) => state.applied.includes(key)));
}

function settleChanges() {
  if (!changes.pending) return false;
  changes = { pending: false, applied: [] };
  return true;
}

function currentOverview(snapshot: AdminSnapshot) {
  if (overview?.of !== snapshot) overview = { of: snapshot, value: overviewOf(snapshot) };
  return overview.value;
}

export function getAdminPreview(): AdminPreview | null {
  if (data) return currentOverview(data);
  if (preview === undefined) {
    try {
      preview = JSON.parse(localStorage.getItem(PREVIEW_KEY) ?? "null") as AdminPreview | null;
    } catch {
      preview = null;
    }
  }
  return preview;
}

function keepPreview(snapshot: AdminSnapshot) {
  preview = currentOverview(snapshot);
  try {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(preview));
  } catch {}
}

export function forgetAdminData() {
  data = null;
  version = null;
  preview = null;
  analytics = null;
  try {
    localStorage.removeItem(PREVIEW_KEY);
  } catch {}
  emit();
}

export function setAdminSlice<K extends keyof AdminSnapshot>(key: K, next: SliceUpdate<AdminSnapshot[K]>) {
  if (!data) return;
  const previous = data[key];
  const value = typeof next === "function" ? (next as (p: AdminSnapshot[K]) => AdminSnapshot[K])(previous) : next;
  if (value === previous) return;
  data = { ...data, [key]: value };
  version = null;
  noteLocalChange(key);
  keepPreview(data);
  emit();
}

export function adminSignInHref() {
  const target = new URL("/admin", location.origin);
  target.searchParams.set("next", `${location.pathname}${location.search}`);
  return target.href;
}

function redirectedRecently() {
  try {
    const at = Number(sessionStorage.getItem(SIGN_IN_REDIRECT_KEY) ?? 0);
    sessionStorage.setItem(SIGN_IN_REDIRECT_KEY, String(Date.now()));
    return Date.now() - at < SIGN_IN_REDIRECT_GAP_MS;
  } catch {
    return false;
  }
}

function handleUnauthorized() {
  if (!data) {
    if (redirectedRecently()) {
      signedOut = true;
      settleChanges();
      emit();
      return;
    }
    location.assign(adminSignInHref());
    return;
  }
  if (!retriedSignIn) {
    retriedSignIn = true;
    again = true;
    return;
  }
  signedOut = true;
  settleChanges();
  emit();
}

async function fetchSnapshot() {
  const startedAt = Date.now();
  try {
    const res = await fetch(ADMIN_SNAPSHOT_PATH, {
      cache: "no-store",
      headers: version ? { [KNOWN_VERSION_HEADER]: version } : undefined,
    });
    if (res.status === 401) return handleUnauthorized();
    const body = (await res.json().catch(() => null)) as
      | { ok: true; unchanged?: boolean; version: string; data?: AdminSnapshot }
      | { ok: false; error?: string }
      | null;
    if (!res.ok || !body || !body.ok) throw new Error((body && !body.ok && body.error) || "Could not load the admin.");
    if (startedAt < lastLocalChange) {
      again = true;
      return;
    }
    const wasHeld = settleChanges();
    const wasSignedOut = signedOut;
    failure = null;
    retriedSignIn = false;
    signedOut = false;
    const changed = !body.unchanged && Boolean(body.data);
    if (body.data && changed) {
      data = keepLoadedMedia(body.data, data);
      version = body.version;
      keepPreview(data);
    }
    if (changed || wasHeld || wasSignedOut) emit();
  } catch (error) {
    settleChanges();
    if (!data) failure = error instanceof Error ? error.message : "Could not load the admin.";
    emit();
  }
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

function noteLocalChange(key?: AdminSlice) {
  lastLocalChange = Date.now();
  const applied = !changes.pending ? (key ? [key] : []) : changes.applied;
  if (!changes.pending || applied !== changes.applied) changes = { pending: true, applied };
}

export function markAdminDataChanged() {
  noteLocalChange();
  version = null;
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

export function loadAdminAnalytics(force = false) {
  if (analyticsLoading) return analyticsLoading;
  if (analytics && !force) return Promise.resolve();
  analyticsLoading = (async () => {
    try {
      const res = await fetch(ADMIN_ANALYTICS_PATH, { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; stats?: AnalyticsStats } | null;
      if (res.ok && body?.ok && body.stats) {
        analytics = body.stats;
        emit();
      }
    } catch {}
  })().finally(() => {
    analyticsLoading = null;
  });
  return analyticsLoading;
}
