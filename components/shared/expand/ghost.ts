import type { Box } from "@/lib/client/expand-origin";

/**
 * A stand-in of the card's photo, drawn above the popup (z 121, popups are 120)
 * while it grows or shrinks. It shows a file the card already loaded, so it
 * paints at once and fetches nothing new.
 */
export function createGhost(src: string, box: Box): HTMLDivElement {
  const ghost = document.createElement("div");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    zIndex: "121",
    pointerEvents: "none",
    overflow: "hidden",
    transformOrigin: "center",
    willChange: "transform, clip-path",
  });

  const img = document.createElement("img");
  img.alt = "";
  img.decoding = "sync";
  img.src = src;
  Object.assign(img.style, { display: "block", width: "100%", height: "100%", objectFit: "cover" });

  ghost.append(img);
  document.body.append(ghost);
  return ghost;
}

function waitFor(el: HTMLElement, events: string[], capMs: number): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      events.forEach((name) => el.removeEventListener(name, finish));
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, capMs);
    events.forEach((name) => el.addEventListener(name, finish));
  });
}

/**
 * Resolves once the popup's own media can be shown without a gap: a photo (or a
 * video's poster) loaded and decoded, an uploaded video's first frame. Until then
 * the stand-in stays, so the hand-over never shows an empty box filling in.
 * Each wait is capped so a failed load never holds the stand-in forever.
 */
export async function mediaReady(target: HTMLElement): Promise<void> {
  const img = target.querySelector("img");
  if (img) {
    if (!(img.complete && img.naturalWidth > 0)) await waitFor(img, ["load", "error"], 15000);
    await img.decode().catch(() => {});
    return;
  }
  const video = target.querySelector("video");
  if (video) {
    if (video.readyState < 2) await waitFor(video, ["loadeddata", "error"], 4000);
  }
}
