import { HERO_PHONE_MAX_PHOTOS, heroOpenShare } from "@/lib/hero-photos";

// The hero shapes the admin framing window previews, in px on a 1440×900 desktop
// and a 375×812 phone, each less the 49px navbar.
const DESKTOP = { width: 1440, height: 851 };
const PHONE = { width: 375, height: 763 };

export type HeroPreviewShape = { key: string; label: string; strip: number; photo: number; height: number };

export function heroPreviewShapes(total: number): HeroPreviewShape[] {
  const count = Math.max(total, 1);
  const desktopPhoto = DESKTOP.width * heroOpenShare(count);
  const phonePhoto = PHONE.width * heroOpenShare(Math.min(count, HERO_PHONE_MAX_PHOTOS), true);
  const desktop = { key: "desktop", label: "Desktop", strip: desktopPhoto, photo: desktopPhoto, height: DESKTOP.height };
  const rest = { key: "rest", label: "At rest", strip: DESKTOP.width / count, photo: desktopPhoto, height: DESKTOP.height };
  const phone = { key: "phone", label: "Phone", strip: phonePhoto, photo: phonePhoto, height: PHONE.height };
  return count > 1 ? [desktop, rest, phone] : [desktop, phone];
}
