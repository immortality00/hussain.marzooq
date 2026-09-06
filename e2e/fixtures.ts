// Throwaway values for the end-to-end database only. Nothing here is a secret:
// the hash is scrypt over the literal password beside it, and both the seed
// script and this config refuse any database whose name is not an e2e/test one.
export const E2E = {
  dbName: "hm_visuals_e2e",
  port: 3100,
  adminPassword: "e2e-admin-password",
  adminPasswordHash:
    "scrypt:e2e0000000000000000000000000e2e0:21fc8a0fb17a46dc41e5f86322ae5443dd23bd52f5a1af6d4929016b0596652febdf060589d73edfb6682237f9ffe825d31a5c9d76df0a2c9bf07b697d8c1dad",
  adminCookieSecret: "e2e-admin-cookie-secret",
  galleryCookieSecret: "e2e-gallery-cookie-secret",
  galleryPassword: "e2e-gallery-password",
  gallerySlug: "e2e-private-gallery",
  serviceName: "Seed Editorial Session",
  photographyCount: 65,
  videographyCount: 4,
} as const;
