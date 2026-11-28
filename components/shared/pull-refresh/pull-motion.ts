import { PULL_EASE, pullArmed, pullLogoTop, pullProgress, pullWrittenClip } from "@/lib/pull-refresh";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { PULL_MOVES } from "./pull-start";

const shift = (px: number) => `0 ${px}px`;

/**
 * What a pull moves: the page's blocks ([data-pull-moves], by `translate`, set straight on each — the
 * navbar and the page on the site, the admin page) and the logo above them, whose signature is written in
 * by a clip and whose light is data-pull-state (app/styles/pull-refresh.css). Moves the finger drives are
 * inline styles; the ones it doesn't are played with WAAPI, and are instant under reduced motion.
 */
export function createPullMotion(logo: HTMLElement, signature: HTMLElement) {
  let moving: HTMLElement[] = [];
  let running: Animation[] = [];
  let offset = 0;
  let logoHeight = 0;

  function setState(state: "pulling" | "armed" | "refreshing" | null) {
    if (state === null) delete logo.dataset.pullState;
    else if (logo.dataset.pullState !== state) logo.dataset.pullState = state;
  }

  function place(px: number) {
    offset = px;
    for (const element of moving) element.style.translate = px ? shift(px) : "";
    logo.style.translate = shift(pullLogoTop(px, logoHeight));
  }

  function stopRunning() {
    for (const animation of running) animation.cancel();
    running = [];
  }

  return {
    begin() {
      stopRunning();
      moving = Array.from(document.querySelectorAll<HTMLElement>(PULL_MOVES));
      for (const element of moving) element.style.willChange = "translate";
      logoHeight = signature.offsetHeight;
      document.documentElement.dataset.pullActive = "";
      logo.style.opacity = "1";
      setState("pulling");
    },

    follow(px: number) {
      place(px);
      signature.style.clipPath = pullWrittenClip(pullProgress(px));
      setState(pullArmed(px) ? "armed" : "pulling");
    },

    refreshing() {
      setState("refreshing");
    },

    /** The page to `to` px down and the logo with it, faded out when `fade`. */
    glide(to: number, ms: number, fade: boolean): Promise<void> {
      const from = offset;
      const fromOpacity = logo.style.opacity || "1";
      const toOpacity = fade ? "0" : "1";
      stopRunning();
      place(to);
      logo.style.opacity = toOpacity;
      if (prefersReducedMotion()) return Promise.resolve();
      const timing = { duration: ms, easing: PULL_EASE };
      running = moving.map((element) => element.animate([{ translate: shift(from) }, { translate: shift(to) }], timing));
      running.push(
        logo.animate(
          [
            { translate: shift(pullLogoTop(from, logoHeight)), opacity: fromOpacity },
            { translate: shift(pullLogoTop(to, logoHeight)), opacity: toOpacity },
          ],
          timing
        )
      );
      return Promise.all(running.map((animation) => animation.finished)).then(
        () => undefined,
        () => undefined
      );
    },

    /** The gap gone at once (the page was scrolled while it refreshed). */
    close() {
      stopRunning();
      place(0);
      logo.style.opacity = "0";
    },

    /** Everything back as it was before the pull. */
    finish() {
      stopRunning();
      for (const element of moving) {
        element.style.translate = "";
        element.style.willChange = "";
      }
      moving = [];
      offset = 0;
      logo.style.opacity = "";
      logo.style.translate = "";
      signature.style.clipPath = "";
      setState(null);
      delete document.documentElement.dataset.pullActive;
    },
  };
}

export type PullMotion = ReturnType<typeof createPullMotion>;
