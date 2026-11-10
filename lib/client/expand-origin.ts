/**
 * Where a popup grows from (MO3). A card records its place on screen and the
 * photo it already shows when tapped; the popup it opens takes that record once.
 * The geometry below is pure, so it is unit-tested.
 */

export type Box = { left: number; top: number; width: number; height: number };

/** Corner radii in px: top-left, top-right, bottom-right, bottom-left. */
export type Radii = [number, number, number, number];

export type ExpandOrigin = {
  box: Box;
  /** The file the card already shows (loaded, an allowed size); null = no photo to grow. */
  src: string | null;
  /** The photo's own width / height; null when unknown. */
  ratio: number | null;
  radii: Radii;
  /** Measured again on close; null when the source cannot be found again (the cylinder). */
  element: Element | null;
};

const MAX_AGE_MS = 1000;
let pending: { origin: ExpandOrigin; at: number } | null = null;

export function rememberOrigin(origin: ExpandOrigin | null) {
  pending = origin ? { origin, at: Date.now() } : null;
}

/** The last recorded origin, once, if it was recorded within the last second. */
export function takeOrigin(now = Date.now()): ExpandOrigin | null {
  const record = pending;
  pending = null;
  if (!record || now - record.at > MAX_AGE_MS) return null;
  return record.origin;
}

export function boxOf(element: Element): Box {
  const r = element.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function uniformRadii(radius: number): Radii {
  return [radius, radius, radius, radius];
}

/**
 * Record a card's image area. `area` is the element whose box the photo fills;
 * its first `<img>` gives the file and the ratio. `withPhoto: false` records the
 * place only, so the popup opens from the card without a photo growing.
 */
export function originFromElement(
  area: Element,
  radii: Radii,
  { withPhoto = true }: { withPhoto?: boolean } = {},
): ExpandOrigin {
  const img = withPhoto ? area.querySelector("img") : null;
  const ready = img && img.complete && img.naturalWidth > 0;
  return {
    box: boxOf(area),
    src: ready ? img.currentSrc || img.src : null,
    ratio: ready ? img.naturalWidth / img.naturalHeight : null,
    radii,
    element: area,
  };
}

/** The part of `box` a photo of `ratio` fills under object-fit: contain. */
export function containBox(box: Box, ratio: number): Box {
  if (!(ratio > 0) || box.width <= 0 || box.height <= 0) return box;
  const boxRatio = box.width / box.height;
  const width = ratio > boxRatio ? box.width : box.height * ratio;
  const height = ratio > boxRatio ? box.width / ratio : box.height;
  return {
    left: box.left + (box.width - width) / 2,
    top: box.top + (box.height - height) / 2,
    width,
    height,
  };
}

/** True when the box is at least partly on screen. */
export function isOnScreen(box: Box, viewport: { width: number; height: number }): boolean {
  return (
    box.width > 0 &&
    box.height > 0 &&
    box.left < viewport.width &&
    box.top < viewport.height &&
    box.left + box.width > 0 &&
    box.top + box.height > 0
  );
}

const px = (n: number) => `${Math.round(n * 100) / 100}px`;

function inset(top: number, side: number, radii: Radii, scale: number) {
  const corners = radii.map((r) => px(r / scale)).join(" ");
  return `inset(${px(top)} ${px(side)} ${px(top)} ${px(side)} round ${corners})`;
}

export type GhostFrame = { transform: string; clipPath: string };

/**
 * The photo ghost sits at `to` (its final place). Its first frame scales it
 * evenly (never stretched) until it covers `from`, centred on `from`, and clips
 * it to `from` with the card's corners — exactly what the card showed.
 */
export function ghostFrames(from: Box, to: Box, fromRadii: Radii, toRadii: Radii): [GhostFrame, GhostFrame] {
  const scale = Math.max(from.width / to.width, from.height / to.height);
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const sideInset = Math.max(0, (to.width - from.width / scale) / 2);
  const topInset = Math.max(0, (to.height - from.height / scale) / 2);
  return [
    {
      transform: `translate(${px(dx)}, ${px(dy)}) scale(${Math.round(scale * 10000) / 10000})`,
      clipPath: inset(topInset, sideInset, fromRadii, scale),
    },
    { transform: "translate(0px, 0px) scale(1)", clipPath: inset(0, 0, toRadii, 1) },
  ];
}

/** Where a panel opening from a card scales from, in the panel's own pixels. */
export function originWithin(panel: Box, card: Box): string {
  const x = card.left + card.width / 2 - panel.left;
  const y = card.top + card.height / 2 - panel.top;
  return `${px(x)} ${px(y)}`;
}
