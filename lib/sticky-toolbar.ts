// Shared by StickyToolbar (the bars) and AdminStickyRegion (which publishes how
// much of the top of the admin screen its save messages and bulk bar cover).

export const STICKY_OFFSET_EVENT = "hm-sticky-offset";
export const ADMIN_STICKY_OFFSET_VAR = "--admin-sticky-offset";

// A sticky bar is stuck once it sits on (or has been pushed above) its stick
// line — its computed `top`. Half a pixel absorbs sub-pixel rounding.
export function isStuck(barTop: number, stickTop: number) {
  return Number.isFinite(barTop) && Number.isFinite(stickTop) && barTop <= stickTop + 0.5;
}
