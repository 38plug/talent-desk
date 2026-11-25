---
name: Talent Desk
description: Neon-dark forex recruiting command center — violet/cyan/magenta signals on near-black canvas, Plus Jakarta Sans, glow chrome.
colors:
  canvas: "#080A10"
  canvas-raised: "#0B0D14"
  surface: "#121622"
  surface-raised: "#171C2B"
  surface-hover: "#1C2235"
  border: "rgb(255 255 255 / 0.08)"
  border-strong: "rgb(255 255 255 / 0.14)"
  violet: "#7C3AED"
  violet-glow: "#A78BFA"
  cyan: "#22D3EE"
  cyan-glow: "#67E8F9"
  magenta: "#EC4899"
  magenta-glow: "#F472B6"
  emerald: "#10B981"
  amber: "#F59E0B"
  rose: "#F43F5E"
  ink: "#F8FAFC"
  ink-muted: "#94A3B8"
  ink-dim: "#64748B"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.18em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "10px"
  control: "12px"
  nav: "14px"
  mark: "18px"
  card: "20px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  section: "32px"
  gutter: "32px"
  rail: "17rem"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "#FFFFFF"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.violet-glow}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-cyan:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-magenta:
    backgroundColor: "{colors.magenta}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-danger:
    backgroundColor: "rgb(244 63 94 / 0.15)"
    textColor: "{colors.rose}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  input-field:
    backgroundColor: "rgb(11 13 20 / 0.90)"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  panel-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  chip-pill:
    backgroundColor: "rgb(124 58 237 / 0.15)"
    textColor: "{colors.violet-glow}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.nav}"
    padding: "10px 12px"
  nav-link-active:
    backgroundColor: "rgb(124 58 237 / 0.28)"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
    padding: "10px 12px"
---

# Design System: Talent Desk

## Overview

**Creative North Star: "The Neon Signal Desk"**

Talent Desk is a night-shift recruiting floor: near-black canvas, violet/cyan/magenta signal glows, and Plus Jakarta Sans as the only working face. It is an operate-mode SPA, not a marketing site. Auth is a centered neon card on a mesh of blurred orbs. Once inside, a 17rem raised rail plus a sticky glass header hold the desk; the working canvas is KPI heroes, neon charts, and data tables — never a photo-led landing.

The room is signed by a 14–18px rounded **TD** mark filled with a violet→magenta→cyan gradient and a violet bloom. Violet is the conversion color (primary CTA, active nav wash). Cyan is the focus/link/chart signal. Magenta is the register CTA, the “Desk” kicker, and the 3px inset bar on the active nav row. Emerald / amber / rose are pipeline status only — not a second brand.

Density is operational. Cards sit at 20px radius with a 1px white-8% seam and an inner highlight. Motion is 200ms ease on chrome; charts glow via SVG filters. `prefers-reduced-motion` collapses animations to 0.01ms. The world rejects light SaaS, Inter as the product face, sharp 2px chrome, and filling large interiors with solid violet.

**Key Characteristics:**
- Near-black canvas (`#080A10`) with a four-stop mesh of violet / cyan / magenta orbs
- Violet (`#7C3AED`) as conversion; cyan (`#22D3EE`) as focus and charts; magenta (`#EC4899`) as the second signal
- Soft 12–20px radii on controls and cards; pills for badges, search, and toggle chips
- Plus Jakarta Sans for all UI; JetBrains Mono only for money and counts (`.tabular`)
- Gradient TD mark + glow as the brand lockup
- Neon Recharts (area / bar / donut / spark) as the dashboard signature, not a marketing hero
- Auth orbs (`filter: blur(48px)`) behind a glowing card — no rail until session or demo UI

## Colors

A three-signal neon palette on near-black. Neutrals are cool slate, never cream.

### Primary
- **Signal Violet** (`#7C3AED`): Conversion. Primary CTA, active pill, selection wash, scrollbar rest. Keep large fills rare — the dashboard hero gradient is the exception.
- **Violet Glow** (`#A78BFA`): Primary hover, page-kicker, estimated KPI spark, chart dash series.
- **Violet Bloom** (`0 0 28px rgb(124 58 237 / 0.4)`): Primary button rest, brand mark, active nav.

### Secondary
- **Signal Cyan** (`#22D3EE`): Focus rings, in-page links, cyan CTA, income spark/area, live-desk hero. Global `:focus-visible` is a 2px cyan outline, 2px offset.
- **Cyan Glow** (`#67E8F9`): Cyan button hover.
- **Signal Magenta** (`#EC4899`): Register CTA, “Desk” kicker, candidates KPI spark, donut slice. Active nav draws a 3px magenta inset bar.
- **Magenta Glow** (`#F472B6`): Magenta hover and operator-chip rim.

### Tertiary
- **Emerald** (`#10B981`): Hired / Paid / Live / auth-healthy. Status only.
- **Amber** (`#F59E0B`): Screening / Paused / interviews KPI / connectivity warning. Status only.
- **Rose** (`#F43F5E`): Overdue / Rejected / Closed / form errors. Status and danger buttons only.

### Neutral
- **Canvas** (`#080A10`): Page ground, `body` fill.
- **Canvas Raised** (`#0B0D14`): Rail, field wells (`bg-canvas-raised/90`).
- **Surface** (`#121622`): Cards, modal, drawer.
- **Surface Raised** (`#171C2B`): Secondary buttons, chart tooltip fill.
- **Surface Hover** (`#1C2235`): Secondary hover.
- **Ink** (`#F8FAFC`): Primary text. Selection is violet-40% on white.
- **Ink Muted** (`#94A3B8`): Supporting copy, inactive nav.
- **Ink Dim** (`#64748B`): Placeholders, table headers, axis ticks.
- **Border** (`rgb(255 255 255 / 0.08)`): Default seam.
- **Border Strong** (`rgb(255 255 255 / 0.14)`): Field rest stroke (tightened for auth readability).

### Named Rules
**The Violet Conversion Rule.** `#7C3AED` is the irreversible action: Sign in, primary save, active pill. Cyan and magenta may light charts, links, and register — they do not replace the primary CTA on a working pane.

**The Status-Not-Brand Rule.** Emerald, amber, and rose map pipeline / earning / offer states through `stageTone`. Do not promote them into a four-color brand.

**The Mesh-Is-Atmosphere Rule.** `.bg-mesh` orbs are ground lighting, not a fill token for cards. Cards stay on `card-surface` (steel gradient + 6% violet wash).

## Typography

**Display Font:** Plus Jakarta Sans (with ui-sans-serif) via `--font-sans`
**Body Font:** Plus Jakarta Sans
**Label/Mono Font:** JetBrains Mono (with ui-monospace) via `--font-mono` and `.tabular`

**Character:** One geometric sans does the room — extra-bold tracking-tight titles, semibold controls, medium labels. Mono is reserved for money, KPI numerals, and nav indexes (`01`–`07`). There is no serif editorial voice.

### Hierarchy
- **Display** (800, `text-3xl`–`text-4xl`, tracking tight): Login wordmark, dashboard “Pipeline command center”, live-desk paid figure.
- **Headline** (800, `text-lg`–`text-xl`): Sticky header page title (`Overview`, `Candidates`, …).
- **Title** (600–700, `text-base`): Card titles, operator name, table names.
- **Body** (400–500, `14px`): Forms, descriptions, table cells, connectivity hints.
- **Label** (600, `10–11px`, tracking `0.16–0.22em`, uppercase): “Desk”, `APP_NAME` kicker, table thead, empty-state eyebrow.
- **Mono** (500, tabular-nums): `formatMoney`, spark KPI values, nav index digits.

### Named Rules
**The One-Sans Rule.** Plus Jakarta Sans is the product face. Do not introduce Inter, Geist, Syne, or a serif masthead. JetBrains Mono does not set sentences.

**The Tracked Kicker Rule.** Eyebrows are 10px uppercase with `0.18–0.22em` tracking in violet-glow or magenta-glow — not a lime square, not a serif kicker.

## Layout

The authenticated product is a rail-plus-canvas command floor.

- **Rail:** Fixed `17rem` (`w-[17rem]`), `bg-canvas-raised/95` + `backdrop-blur-xl`, 1px right seam. Brand lockup, “Desk” kicker, indexed nav, operator chip, ghost Sign out. Below `lg` it slides off-canvas (`-translate-x-full`) behind a `bg-black/55` scrim.
- **Header:** Sticky, `bg-canvas/75` + blur, 12px vertical padding. Page title left; search (md+) and initials avatar right. Mobile hamburger is a 12px-radius bordered square.
- **Main:** `px-4 py-6` → `sm:px-6` → `lg:px-8`. Vertical stack `space-y-5` / `gap-4` / `gap-5`.
- **Auth:** Centered `max-w-md` card on `.bg-mesh` with three `.auth-orb` blobs. No rail.
- **Dashboard:** 5-col hero (`3 + 2`) at `lg`; 4 KPI cards; then area + donut, bar + estimated list, attention + recent table.
- **Working tables:** `.data-table` full width, 14px body, 11px uppercase thead, 13.6×16px cells, hover violet-6%.
- **Dialogs:** Modal `max-w-lg` (or `max-w-2xl` wide) at 20px radius; candidate detail is a right `max-w-md` drawer.

Spacing rhythm is 8 / 12 / 16 / 20 / 24 / 32.

## Elevation & Depth

Depth is glow plus tonal steel, not Material elevation. Cards are opaque gradients with an inset 1px white highlight. The page mesh and auth orbs supply atmosphere.

### Shadow Vocabulary
- **Violet glow** (`0 0 28px rgb(124 58 237 / 0.4), 0 0 8px rgb(124 58 237 / 0.25)`): Primary CTA, TD mark, active pill.
- **Cyan glow** (`0 0 28px rgb(34 211 238 / 0.35), 0 0 8px rgb(34 211 238 / 0.2)`): Cyan CTA, live-desk hero (`0 0 40px`).
- **Magenta glow** (`0 0 28px rgb(236 72 153 / 0.35)`): Magenta CTA, operator chip rim.
- **Card glow** (`inset 0 1px 0 rgb(255 255 255 / 0.05), 0 0 0 1px rgb(124 58 237 / 0.12), 0 12px 40px rgb(0 0 0 / 0.35)`): Auth card (`.card-glow`); login adds `0 0 80px rgb(124 58 237 / 0.22)`.
- **Hero violet** (`0 0 48px rgb(124 58 237 / 0.4)`): Dashboard command-center slab.
- **Active nav** (inset 3px magenta bar + 1px violet seam + `0 0 24px rgb(124 58 237 / 0.2)`).
- **Focus** (inputs): `ring-2 ring-violet/30` + `border-violet/70`. Global `:focus-visible` is cyan, not violet.
- **Badge** (`0 0 12px rgb(0 0 0 / 0.15)`): Soft rest under pills.

### Named Rules
**The Glow-Is-Signal Rule.** Bloom belongs on conversion, brand mark, active nav, and charts. Do not put a 48px glow under every card — rest cards use `card-surface` only (inset highlight, no outer bloom).

**The Steel Card Rule.** Working surfaces are `.card-surface`: 165° steel gradient + 6% violet wash, 1px `--color-border`, 20px radius. Do not restyle them into glassmorphism or a flat `#111`.

## Shapes

The silhouette is softly rounded night chrome — 12px controls, 20px slabs, full pills for status.

- **Brand mark:** 14px at 44px (rail); 18px at 64px (auth).
- **Nav rows:** 14px.
- **Buttons / fields / header menu:** 10–12px (`rounded-[10px]` sm, `12px` md/lg).
- **Search:** full pill (`rounded-full`).
- **Cards / modal / empty / dashboard heroes:** 20px (`--radius-card` / `rounded-[20px]`).
- **Operator chip:** 18px outer gradient frame, 17px inner.
- **Badges / pill toggles / header avatar:** `9999px`.
- **Table:** no radius on rows; the wrapping card carries the 20px.

Borders are 1px white at 8% rest, 14% on fields. Active filters and badges pick up a 30% tint of their signal color.

## Components

### Buttons
- **Shape:** 12px (10px at `sm`), height 40px (`h-8` sm / `h-11` lg), semibold, 8px icon gap, 200ms transition.
- **Primary:** Violet fill, white text, 20px violet bloom. Hover `#A78BFA`.
- **Secondary:** Surface-raised, 1px border, hover `border-strong` + surface-hover.
- **Ghost:** Transparent, muted text; hover ink + `white/5`. Sign out in the rail.
- **Cyan / Magenta:** Signal fills with matching glow. Magenta is **Join Talent Desk** only.
- **Danger:** Rose veil 15% + rose text + rose/30 border.
- **Disabled:** 45% opacity, no pointer.

### Chips / Badges
- Full pill, 11px semibold, 1px tinted border, 15% fill of the tone. Tones: violet, cyan, magenta, emerald, amber, rose, muted.
- `stageTone()` maps Hired/Paid/Live → emerald; Accepted/Pending/Interview → cyan; Offer/Estimated → violet; Overdue/Rejected/Closed → rose; Paused/Screening → amber.
- Pill toggle (`.pill-toggle`): surface well; active item is solid violet + glow.

### Cards / Containers
- **`Card`:** `.card-surface p-5`. Header is title left, actions right.
- **Dashboard heroes:** `.hero-gradient-violet` (`#6d28d9 → #a21caf → #db2777`) and `.hero-gradient-cyan` (`#0e7490 → #0891b2 → #22d3ee`), 20px radius, inner blur orbs.
- **Empty:** 20px dashed border, `bg-surface/40`, 64px vertical padding, tracked violet-glow eyebrow.
- **Demo banner:** 16px, cyan/10 fill, cyan/30 border, 24px cyan bloom.

### Inputs / Fields
- **Style:** 12px radius, `border-border-strong`, `bg-canvas-raised/90`, 14px ink, dim placeholder. Height 40px.
- **Focus:** Violet/70 border + 2px violet/30 ring. Do not swap this for the global cyan outline on text fields.
- **Search (header):** Full pill, `bg-surface/80`, 240px, icon inset. Chrome only — no query handler.
- **Error:** Rose/10 panel with rose title and muted hint. Connectivity uses amber (warning) or emerald (healthy).

### Navigation
Rail: 17rem, TD gradient mark, “Talent Desk” 15px extrabold + tagline 10px dim. “Desk” kicker in magenta-glow. Rows are 14px radius; inactive muted; hover `white/5`. Active uses `.nav-active` (violet wash, magenta inset bar). Indexes are 10px mono dim. Operator chip is a 1px magenta→violet→cyan frame. Mobile: hamburger + scrim.

Header kicker is violet-glow uppercase `APP_NAME`; title is the current nav label. Avatar is a 40px gradient disc with initials.

### Signature: neon charts
`Sparkline`, `NeonAreaChart`, `NeonBarChart`, `NeonDonut` in `src/components/ui/charts.tsx`. Cyan + violet area (estimated series dashed), cyan→violet bar gradient, donut palette cyan/violet/magenta/emerald/amber/rose. Tooltips: `#171C2B`, 12px radius. Sparklines sit on KPI cards; they do not replace the TD mark.

### Auth card (signature)
Centered `max-w-md` `.card-surface.card-glow` with three `.auth-orb` blobs (violet, cyan, magenta; `blur(48px)`, 55% opacity). Login CTA is primary violet (“Enter Talent Desk”); register is magenta (“Join Talent Desk”). Links between them are cyan. “Preview Talent Desk UI” (secondary) appears only when Supabase env is missing.

## Do's and Don'ts

### Do:
- **Do** keep canvas / canvas-raised / surface as the ground family and `#7C3AED` as the primary conversion color.
- **Do** set titles in extra-bold Plus Jakarta Sans; money and indexes in JetBrains Mono (`.tabular`).
- **Do** build panes from `.card-surface`, `.data-table`, and the radius steps (10 / 12 / 14 / 18 / 20 / pill).
- **Do** map pipeline and earning states through `stageTone` — emerald / cyan / violet / rose / amber.
- **Do** keep the TD gradient mark + glow as the lockup; do not replace it with a wordmark-only header.
- **Do** honor `prefers-reduced-motion` (global 0.01ms) and keep chrome transitions at 200ms.
- **Do** keep auth as a centered neon card with orbs; do not put the rail on `/login` or `/register`.

### Don't:
- **Don't** introduce Inter, Roboto, a serif display, or a light/cream canvas. The build is Plus Jakarta Sans on `#080A10`.
- **Don't** sharpen chrome to 2px rectangles or restore a single-accent lime/hot-pink world from other studios.
- **Don't** fill working cards with solid violet, cyan, or magenta. Glow is for conversion, mark, charts, and heroes.
- **Don't** treat emerald / amber / rose as brand fills.
- **Don't** add a second product look for Admin — it uses the same cards, tables, and badges.
- **Don't** commit secrets, service-role keys, or live anon tokens into either design file.
