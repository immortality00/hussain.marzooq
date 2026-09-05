import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * External surfaces this app legitimately loads:
 * - Cloudinary CDN images: res.cloudinary.com (custom image loader).
 * - Cloudinary upload widget: script + iframe from upload-widget.cloudinary.com,
 *   signed-upload POSTs to api.cloudinary.com, image polling to res.cloudinary.com.
 *   Used on public pages too (testimonial review form), not just admin.
 * - OpenStreetMap embed: read-only map iframe (www.openstreetmap.org) on the
 *   testimonials page showing each reviewer's city — needs frame-src.
 * - Cloudinary video: <video> elements stream from res.cloudinary.com (showreel,
 *   videography grid, lightbox) — needs media-src (no media-src falls back to
 *   default-src 'self' and silently blocks every video).
 * - Video embeds: YouTube (youtube-nocookie.com) and Vimeo (player.vimeo.com)
 *   iframes from toEmbedUrl (showreel embed, lightbox) — need frame-src.
 * - Instagram post embeds: www.instagram.com iframes on the dancing page
 *   (admin-picked post/reel URLs via toInstagramEmbedUrl) — need frame-src.
 * - GoatCounter Analytics: count.js from gc.zgo.at (script-src) sending a
 *   cookieless pageview beacon to {code}.goatcounter.com/count (img-src pixel
 *   + connect-src sendBeacon fallback). Public pages only, loaded by
 *   SiteAnalytics when NEXT_PUBLIC_GOATCOUNTER_CODE is set. The /admin/analytics
 *   dashboard reads GoatCounter's API server-side, so it is not a CSP surface.
 * - Fonts are self-hosted (geist via next/font) — no external font origin.
 *
 * `script-src` keeps 'unsafe-inline': Next's App Router injects inline hydration
 * scripts, and nonce-based CSP is impractical on this Netlify/App-Router setup
 * (a wrong nonce silently breaks hydration). Three.js does NOT need 'unsafe-eval'
 * in production — only Next's dev/HMR runtime does, so it's added dev-only, along
 * with the HMR websocket origins in connect-src.
 */
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://upload-widget.cloudinary.com https://gc.zgo.at${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.goatcounter.com",
  "media-src 'self' blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com https://upload-widget.cloudinary.com https://*.goatcounter.com${isDev ? " ws: http://localhost:*" : ""}`,
  "frame-src https://upload-widget.cloudinary.com https://www.openstreetmap.org https://www.youtube-nocookie.com https://player.vimeo.com https://www.instagram.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

/**
 * Baseline security headers. Applied to every route.
 */
const securityHeaders = [
  // Clickjacking: stop the site (and the admin panel) being framed.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: cspDirectives.join("; ") },
  // Stop browsers guessing content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing on this site needs these.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Force HTTPS for a year (Netlify already serves HTTPS).
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  images: {
    // Resizing happens at Cloudinary's CDN, not in Next's optimizer.
    // See lib/cloudinary-image-loader.ts for why.
    loader: "custom",
    loaderFile: "./lib/cloudinary-image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Admin must never be cached or indexed.
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // Private client galleries must never be indexed.
        source: "/g/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
