// The part of a hero photo that must stay in view, as percentages of its width
// and height. Runtime-agnostic: the hero, the admin framing window and the save
// route all use it. A photo without one is centred.

export type HeroFocus = { x: number; y: number };

export const CENTRE_FOCUS: HeroFocus = { x: 50, y: 50 };

function percent(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100
    ? Math.round(value * 10) / 10
    : null;
}

export function heroFocusOf(value: unknown): HeroFocus | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const x = percent((value as Record<string, unknown>).x);
  const y = percent((value as Record<string, unknown>).y);
  return x === null || y === null ? null : { x, y };
}

// Something was sent as a focus, and it is not one.
export function isBadHeroFocus(value: unknown): boolean {
  return value !== undefined && value !== null && heroFocusOf(value) === null;
}

export function clampFocus(x: number, y: number): HeroFocus {
  const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
  return { x: clamp(x), y: clamp(y) };
}

// The two custom properties `.hm-focus-frame` (app/styles/hero.css) reads.
export function heroFocusVars(focus: HeroFocus | undefined): Record<string, string> | undefined {
  return focus ? { "--focus-x": `${focus.x}%`, "--focus-y": `${focus.y}%` } : undefined;
}
