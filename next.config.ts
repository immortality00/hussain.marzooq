import type { NextConfig } from "next";

/**
 * Baseline security headers. Applied to every route.
 *
 * No Content-Security-Policy yet — a correct CSP for this app has to allow
 * Cloudinary, the upload widget, and Next's inline runtime, and a wrong one
 * silently breaks image loading and admin uploads. Scoped as its own task in
 * Session S1 (SESSION-QUEUE.md) so it can be verified in-browser properly.
 */
const securityHeaders = [
  // Clickjacking: stop the site (and the admin panel) being framed.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
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
    ];
  },
};

export default nextConfig;
