import { centreOf, type Rect } from "@/lib/title-bar-flight";

/** The box a title's words take up (an h1 spans its column; its words may not). */
export function textRect(element: Element): Rect {
  const range = document.createRange();
  range.selectNodeContents(element);
  const rect = range.getBoundingClientRect();
  return rect.width > 0 ? rect : element.getBoundingClientRect();
}

// A copy that only shows: no ids, no link, no focus, nothing for a screen reader, and no
// entrance animation of its own (a title's words would reveal themselves again).
function quiet(root: HTMLElement) {
  for (const node of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
    node.removeAttribute("id");
    node.style.animation = "none";
    for (const name of node.getAttributeNames()) {
      if (name.startsWith("data-title")) node.removeAttribute(name);
    }
  }
  root.removeAttribute("href");
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("inert", "");
  root.querySelectorAll("img").forEach((img) => {
    img.decoding = "sync";
    img.loading = "eager";
  });
}

/**
 * A stand-in for one piece of the page's header (Back, the photo, the title), drawn over the
 * page at the piece's own size and place, ready to be moved and scaled by a transform. It is a
 * copy of the piece itself, so the photo is the file already on screen and nothing new loads.
 * Above the page's content and bar, below the navbar (z 50).
 */
export function makeStandIn(source: HTMLElement, text: boolean) {
  const rect = text ? textRect(source) : source.getBoundingClientRect();
  const standIn = source.cloneNode(true) as HTMLElement;
  quiet(standIn);
  Object.assign(standIn.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width + (text ? 1 : 0)}px`,
    height: text ? "auto" : `${rect.height}px`,
    margin: "0",
    zIndex: "45",
    pointerEvents: "none",
    transformOrigin: "50% 50%",
    willChange: "transform",
    transition: "none",
  });
  if (text) standIn.style.textAlign = getComputedStyle(source).textAlign;
  document.body.append(standIn);

  // A copied title can draw its first line a pixel or two off the original: line it up again.
  if (text) {
    const drawn = textRect(standIn);
    standIn.style.left = `${2 * rect.left - drawn.left}px`;
    standIn.style.top = `${2 * rect.top - drawn.top}px`;
  }
  return { standIn, base: centreOf(rect) };
}
