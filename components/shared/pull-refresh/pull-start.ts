import { allowsVerticalPan } from "@/lib/pull-refresh";

/** The page's own blocks that come down with a pull: the admin page, the site's navbar and page. */
export const PULL_MOVES = "[data-pull-moves]";

// A touch here is the field's: typing, a slider, a picker.
const FIELDS = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";
// Focused, these hold the keyboard up; a pull then would reach past what is being typed.
const TYPING =
  "input:not([type='checkbox'], [type='radio'], [type='button'], [type='submit'], [type='reset'], [type='image'], [type='file'], [type='color'], [type='range']), textarea, select, [contenteditable]:not([contenteditable='false'])";

function scrolledDown(element: Element, style: CSSStyleDeclaration) {
  const scrolls = /^(auto|scroll|overlay)$/.test(style.overflowY);
  return scrolls && element.scrollHeight > element.clientHeight && element.scrollTop > 0;
}

/**
 * Whether a touch on `target` may start a pull. Only on the page itself, and never while a window is open,
 * a field has the keyboard or text is selected; never on a field, on anything floating over the page, on
 * something that handles its own drag (a reorder handle, the cylinder, the globe) or inside a box scrolled
 * down (it scrolls back first, as it would without the pull).
 */
export function canStartPull(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const document = target.ownerDocument;
  if (document.querySelector("[aria-modal='true']")) return false;
  if (document.documentElement.style.overflow === "hidden") return false;
  const selection = document.getSelection();
  if (selection && !selection.isCollapsed) return false;
  if (document.activeElement?.matches(TYPING)) return false;
  if (target.closest(FIELDS)) return false;

  const block = target.closest(PULL_MOVES);
  if (!block) return false;
  for (let element: Element | null = target; element; element = element.parentElement) {
    const style = getComputedStyle(element);
    if (style.position === "fixed") return false;
    if (!allowsVerticalPan(style.touchAction)) return false;
    if (scrolledDown(element, style)) return false;
    if (element === block) break;
  }
  return true;
}
