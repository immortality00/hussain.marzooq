import localFont from "next/font/local";

// Instrument Serif (SIL Open Font License 1.1, app/fonts/instrument-serif-OFL.txt):
// the hero heading's face, and only that. Imported by the hero alone, so only the
// homepage loads it; everything else on the site stays Geist.
export const heroSerif = localFont({
  src: "../../app/fonts/instrument-serif-latin-400.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});
