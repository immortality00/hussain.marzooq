# Hussain.Art

Portfolio and booking site for **Hussain Marzooq** — internationally exhibited
photographer and videographer, NFT artist, dance teacher, and web developer, based in
Dubai. Public portfolio across five disciplines (photography, videography, NFT, dancing,
web development), an exhibition globe, a testimonials system, private client galleries,
and a full admin CMS.

Primary domain: **hussain.art** (hussain-marzooq.com redirects to it).

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind CSS 4**
- **MongoDB Atlas** (data) · **Cloudinary** (image/video delivery) · **Resend** (email)
- **shadcn/ui** (new-york) · **Three.js** · **react-globe.gl** · **GSAP** + ScrollTrigger ·
  **Lenis**
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
- `NOTIFICATION_EMAIL` — turns admin alert emails on (blank = off) and receives them until
  `RESEND_DOMAIN` is set; `RESEND_DOMAIN` — the domain verified in Resend (`hussain.art`): each
  alert then goes to its own address in `lib/site-emails.ts` (inquiries@ for the contact form; without it, Resend's test sender
  only delivers to the Resend account owner); `RESEND_NEWS_DOMAIN` — the Resend-verified subdomain blog
  posts are sent from (`news.hussain.art`; unset, posts come from `RESEND_DOMAIN`)
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — admin push notifications; generate once with
  `node scripts/generate-vapid-keys.mjs` (optional `VAPID_SUBJECT`, defaults to the site URL)
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

Deployed on **Netlify**. Admin routes (`/admin/*`) ship a `noindex` header (the admin screens are
pre-built shells served from Netlify's cache; their data comes from `/api/admin/snapshot`, which answers
`no-store` and only with a valid session) and a strict, dev/prod-aware Content-Security-Policy — both
configured in `next.config.ts`. At
first deploy, rotate `ADMIN_COOKIE_SECRET` in the Netlify environment and re-verify the CSP
against the live origin (see `SESSION-QUEUE.md` §L1).

## Working document

`CLAUDE.md` is the source of truth for design rules, architecture decisions, the image
pipeline, security rules, and the session workflow. Read it before changing anything.
