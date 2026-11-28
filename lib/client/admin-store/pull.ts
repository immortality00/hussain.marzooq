import { emit, state } from "./state";
import { lastCheckFailure, refreshAdminData } from "./fetch";

const reloads = new Set<Promise<unknown>>();

/** A screen's reload of what it keeps outside the shared data (useOnAdminDataChange's result): a pull waits for it. */
export function trackAdminReload(result: unknown) {
  if (!(result instanceof Promise)) return;
  reloads.add(result);
  const settled = () => reloads.delete(result);
  result.then(settled, settled);
}

// The screens' reloads start in effects, which run once the change has rendered.
const afterRender = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Pull to refresh in the admin (MO5): one check, sent even when one is under way, then every screen reloads
 * what it keeps outside the shared data — even when the check found nothing new. Resolves once those reloads
 * are in, with the reason the check failed when there is data on screen to keep showing (with nothing on
 * screen, the screen itself says why).
 */
export async function pullAdminData(): Promise<string | null> {
  const before = state.generation;
  await refreshAdminData({ changed: true });
  if (state.signedOut) return null;
  const failure = lastCheckFailure();
  if (failure) return state.data ? failure : null;
  if (state.generation === before) {
    state.generation += 1;
    emit();
  }
  await afterRender();
  while (reloads.size) await Promise.allSettled([...reloads]);
  return null;
}
