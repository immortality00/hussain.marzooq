import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Content Security Policy for Firebase
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com;
              connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.google.com https://firestore.googleapis.com https://*.cloudfunctions.net wss://*.firebaseio.com;
              img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com;
              frame-src 'self' https://*.firebaseapp.com;
              style-src 'self' 'unsafe-inline';
              font-src 'self' data:;
              object-src 'none';
            `.replace(/\s+/g, ' ').trim()
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  // Optimize images
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  }
};

export default nextConfig;
