# HM Visuals

Portfolio and booking site for **Hussain Marzooq** — internationally exhibited
photographer and videographer, NFT artist, dance teacher, and web developer, based in
Dubai. Public portfolio across five disciplines (photography, videography, NFT, dancing,
web development), an exhibition globe, a testimonials system, private client galleries,
and a full admin CMS.

Primary domain: **hussain-marzooq.com** (target: hussain.art when ready).

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS 4**
- **MongoDB Atlas** (data) · **Cloudinary** (image/video delivery) · **Resend** (email)
- **shadcn/ui** (new-york) · **Three.js** · **react-globe.gl** · **GSAP** + ScrollTrigger ·
  **Framer Motion** · **Lenis**
- Deployed on **Netlify** — not Vercel.

Images bypass Next's optimizer: a custom Cloudinary loader
(`lib/cloudinary-image-loader.ts`) rewrites every `next/image` src to a Cloudinary
delivery URL, so resizing happens at Cloudinary's CDN. See `next.config.ts` and
`CLAUDE.md` for why.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required environment variables (in `.env.local`, never committed):

- `MONGODB_URI` — MongoDB Atlas connection string
- `ADMIN_PASSWORD_HASH` — scrypt hash of the admin password (plaintext passwords are not
  supported)
- `ADMIN_COOKIE_SECRET` — HMAC secret for signing admin session cookies
- `RESEND_API_KEY` — transactional email
- Cloudinary credentials (cloud name, API key/secret) — see `lib/` for the exact names

## Verification

**Do not run `next build` to verify.** The verification chain is:

```bash
npm run test        # vitest run
npm run lint        # eslint --max-warnings 0 (0 errors AND 0 warnings)
npx tsc --noEmit    # typecheck
```

CI (`.github/workflows/ci.yml`, Node 22) runs exactly typecheck + lint + test on push and
PR — no build step. Then run `npm run dev` and check the affected page in the browser.

## Deployment

Deployed on **Netlify**. Admin routes (`/admin/*`) ship `no-store` + `noindex` headers and
a strict, dev/prod-aware Content-Security-Policy — both configured in `next.config.ts`. At
first deploy, rotate `ADMIN_COOKIE_SECRET` in the Netlify environment and re-verify the CSP
against the live origin (see `SESSION-QUEUE.md` §L1).

## Working document

`CLAUDE.md` is the source of truth for design rules, architecture decisions, the image
pipeline, security rules, and the session workflow. Read it before changing anything.
