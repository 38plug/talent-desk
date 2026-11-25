# Agent / contributor guardrails — Talent Desk

This is a **Vite + React 19** static SPA, not Next.js. Ignore Next.js App Router / `middleware` / server-component habits unless a later rebuild explicitly adds a server.

## Stack facts

- Package manager: npm. Node 20+.
- Dev: `npm run dev` → `http://127.0.0.1:5173`
- Build: `npm run build` (`tsc -b && vite build`) → `dist`
- Lint: `npm run lint` (`oxlint`); typecheck: `npm run typecheck`
- Tailwind v4 via `@import "tailwindcss"` + `@theme` in `src/index.css` — **no** `tailwind.config.*`
- Data + auth: `src/lib/local-db.ts` + `src/lib/api.ts` over `localStorage`. No `@supabase/*`.
- Host: Vercel SPA (`vercel.json` rewrite to `index.html`). No backend env.

## Read first

1. [`HANDOFF.md`](./HANDOFF.md) — architecture, invariants, file map
2. [`DESIGN.md`](./DESIGN.md) — Lime Glass Desk tokens and motion
3. [`PRODUCT.md`](./PRODUCT.md) — product purpose and constraints
4. [`docs/local-data.md`](./docs/local-data.md) — storage keys / export shape

## Do

- Keep brand **Talent Desk** and lime `#C6F432` as conversion on `#111` charcoal.
- Portal `Modal` / `Drawer` to `document.body`. Do not put CSS `filter` on `PageTransition`.
- Keep SFX muted by default; honor `prefers-reduced-motion`.
- Migrate missing candidate fields to `null` on load/import — do not wipe older rows.
- Confirm candidate delete by name; cascade interviews + earnings; leave linked offers.
- Open offer cards into a wide `glass` preview; keep card Edit/Delete `stopPropagation`.
- Slide the lime nav pill on hover **and** active; kill in-flight GSAP tweens.
- Ship empty Overview as zeros — never invent demo income.

## Don't

- Do not reintroduce Supabase, Edge Functions, Docker, Cloudflared, or `VITE_SUPABASE_*`.
- Do not restore Next.js App Router, API routes, or SSR hosting assumptions.
- Do not restore The Neon Signal Desk (violet primary CTA, `#080A10`, magenta inset nav) or dealing-slip cream/brass.
- Do not commit secrets, password hashes, export JSON with credentials, or print `OWNER_EMAIL` in docs.
- Do not seed `DEMO_METRICS` or a demo-UI bypass on login.
- Do not invent extra market/gender options beyond `forex`/`chinese` and `male`/`female`.

## PR hygiene

- Branch from `main`. Prefer focused PRs.
- Run `npm run typecheck` (and `npm run build` when touching routes/assets) before claiming done.
- Refresh `HANDOFF.md` / `DESIGN.md` when UI, auth, data model, motion, or hosting changes.
