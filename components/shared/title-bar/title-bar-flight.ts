import { isScrolledDown } from "@/hooks/useRevealOnScroll";
import {
  FLIGHT_EASE,
  HANDOVER_MS,
  TO_BAR_MS,
  TO_PAGE_MS,
  mixPose,
  onScreen,
  poseOf,
  poseTransform,
  type Pose,
} from "@/lib/title-bar-flight";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { makeStandIn, textRect } from "./stand-ins";

type Side = "page" | "bar";

// Each piece that moves: where it sits in the page, where it sits in the bar, and how its size
// compares (a title by its font size, since a long one wraps in the page but not in the bar).
// A page without Back or a photo (a listing page) simply has no such pieces.
const PIECES = [
  { page: '[data-title-back="page"]', bar: '[data-title-back="bar"]', text: false },
  { page: "[data-title-avatar]", bar: "[data-title-bar-avatar]", text: false },
  { page: "[data-title-heading]", bar: "[data-title-bar-heading]", text: true },
] as const;

type Piece = { page: HTMLElement; bar: HTMLElement; text: boolean };
type Flying = { piece: Piece; standIn: HTMLElement; base: { x: number; y: number }; pose: Pose };

function pageRect(piece: Piece) {
  return piece.text ? textRect(piece.page) : piece.page.getBoundingClientRect();
}

function pagePose(piece: Piece): Pose {
  return poseOf(pageRect(piece));
}

function barPose(piece: Piece): Pose {
  const bar = piece.bar.getBoundingClientRect();
  const scale = piece.text
    ? parseFloat(getComputedStyle(piece.bar).fontSize) / parseFloat(getComputedStyle(piece.page).fontSize)
    : bar.height / pageRect(piece).height;
  return poseOf(bar, scale);
}

/**
 * Moves a page's title (and on a detail page, Back and the photo) into its title bar once the
 * page has scrolled 40px (the booking bar's moment), and back at the top. The phase is
 * `data-title-state` on the frame — absent (the page shows its own), toBar / toPage (copies
 * flying), bar — and title-bar.css draws the rest. Each copy follows its destination while the
 * page is still gliding, so it lands exactly on it, and a change of direction turns the flight
 * around from where it is. Reduced motion: no flight, the two places cross-fade.
 */
export function createTitleBarFlight(frame: HTMLElement) {
  let side: Side = "page";
  let flight: { flying: Flying[]; raf: number } | null = null;
  const fading = new Set<HTMLElement>();

  function setState(state: "toBar" | "bar" | "toPage" | null) {
    if (state) frame.dataset.titleState = state;
    else delete frame.dataset.titleState;
  }

  function pieces(): Piece[] {
    return PIECES.flatMap(({ page, bar, text }) => {
      const pageEl = frame.querySelector<HTMLElement>(page);
      const barEl = frame.querySelector<HTMLElement>(bar);
      return pageEl && barEl ? [{ page: pageEl, bar: barEl, text }] : [];
    });
  }

  function stop() {
    if (!flight) return;
    cancelAnimationFrame(flight.raf);
    flight.flying.forEach((f) => f.standIn.remove());
    flight = null;
  }

  function settle(next: Side) {
    stop();
    side = next;
    setState(next === "bar" ? "bar" : null);
  }

  function land(toBar: boolean) {
    const landed = flight;
    flight = null;
    if (!landed) return;
    if (!toBar) {
      setState(null);
      landed.flying.forEach((f) => f.standIn.remove());
      return;
    }
    setState("bar");
    for (const { standIn } of landed.flying) {
      fading.add(standIn);
      const done = () => {
        standIn.remove();
        fading.delete(standIn);
      };
      standIn
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: HANDOVER_MS, easing: "ease-out", fill: "forwards" })
        .finished.then(done, done);
    }
  }

  function fly(next: Side) {
    side = next;
    const toBar = next === "bar";
    let flying: Flying[];
    if (flight) {
      cancelAnimationFrame(flight.raf);
      flying = flight.flying;
    } else {
      const found = pieces();
      // A title far off screen (a page reopened scrolled down) has nowhere to fly from.
      if (!found.length || found.some((p) => !onScreen(pageRect(p), window.innerHeight))) return settle(next);
      flying = found.map((piece) => {
        const { standIn, base } = makeStandIn(piece.page, piece.text);
        const pose = toBar ? pagePose(piece) : barPose(piece);
        standIn.style.transform = poseTransform(base, pose);
        return { piece, standIn, base, pose };
      });
      // Back from the bar: the copies come in over the bar's own pieces as those fade out.
      if (!toBar) {
        flying.forEach((f) => f.standIn.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "ease-out" }));
      }
    }
    setState(toBar ? "toBar" : "toPage");

    const from = flying.map((f) => f.pose);
    const target = toBar ? barPose : pagePose;
    const duration = toBar ? TO_BAR_MS : TO_PAGE_MS;
    const start = performance.now();
    const step = (now: number) => {
      const eased = FLIGHT_EASE(Math.min(1, (now - start) / duration));
      flying.forEach((f, i) => {
        f.pose = mixPose(from[i], target(f.piece), eased);
        f.standIn.style.transform = poseTransform(f.base, f.pose);
      });
      if (now - start < duration && flight) flight.raf = requestAnimationFrame(step);
      else land(toBar);
    };
    flight = { flying, raf: requestAnimationFrame(step) };
  }

  function onScroll() {
    const next: Side = isScrolledDown(window.scrollY) ? "bar" : "page";
    if (next === side) return;
    if (prefersReducedMotion()) settle(next);
    else fly(next);
  }

  // The first look waits a frame: when this runs, the window may still hold the previous page's
  // scroll (Next.js resets it, or ScrollMemory puts a returning page back, just after), and acting
  // on it would show the bar on arrival and fly the title back down. Until then the page shows
  // its own header, as the server drew it.
  const firstLook = requestAnimationFrame(() => {
    const next: Side = isScrolledDown(window.scrollY) ? "bar" : "page";
    if (next !== side) settle(next);
  });
  window.addEventListener("scroll", onScroll, { passive: true });

  return {
    dispose() {
      cancelAnimationFrame(firstLook);
      window.removeEventListener("scroll", onScroll);
      stop();
      fading.forEach((standIn) => standIn.remove());
      fading.clear();
    },
  };
}
