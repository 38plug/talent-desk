---
name: Talent Desk
description: Charcoal lime-glass forex recruiting command center — #111 canvas, lime conversion, peach kickers, Plus Jakarta Sans, stretchy nav pill.
colors:
  canvas: "#111111"
  canvas-raised: "#161616"
  surface: "#1A1A1A"
  surface-raised: "#1F1F1F"
  surface-hover: "#262626"
  border: "rgb(255 255 255 / 0.08)"
  border-strong: "rgb(255 255 255 / 0.14)"
  lime: "#C6F432"
  lime-glow: "#D9FF6A"
  peach: "#F4B183"
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
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  subtitle:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
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
  rail-collapsed: "4.75rem"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.canvas}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.lime-glow}"
    textColor: "{colors.canvas}"
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
  button-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.canvas}"
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
    backgroundColor: "rgb(22 22 22 / 0.90)"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  panel-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  glass-panel:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  button-glass:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  chip-pill:
    backgroundColor: "rgb(198 244 50 / 0.15)"
    textColor: "{colors.lime}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.nav}"
    padding: "10px 12px"
  nav-link-active:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.nav}"
    padding: "10px 12px"
---

# Design System: Talent Desk

> Visual SoT for the Vite + React 19 SPA on Vercel. Companion: [`.impeccable/design.json`](./.impeccable/design.json). Product/architecture: [`HANDOFF.md`](./HANDOFF.md), [`PRODUCT.md`](./PRODUCT.md). Settings UI still shows a leftover violet/cyan/magenta swatch card — this file wins.

## Overview

**Creative North Star: "The Lime Glass Desk"**

Talent Desk is a charcoal operating floor: `#111` canvas, lime `#C6F432` conversion, peach kickers, and Plus Jakarta Sans as the only working face. It is an operate-mode Vite SPA on Vercel — not a marketing site and not a Next.js app. Persistence is hosted Supabase when `VITE_SUPABASE_*` is set, otherwise device-local `localStorage`; the visual world does not change between those modes. Auth is a centered glass card on a mesh of lime / peach / violet orbs, with a film-grain overlay, a sound toggle, and a 12px muted helper line that says whether cloud sync is on. Once inside, a collapsible raised rail plus a sticky glass header (peach date kicker + mono live time on `sm+`, lime notification bell, sound toggle) hold the desk; the working canvas is Pattern C liquid-glass KPI heroes (`<GlassPanel>` over `[data-td-glass-stage]`), a glowing **DeskTotalsStrip** on Candidates / Offers / Interviews, an Interview Calendar at `/calendar`, a personal Telegram chat at `/telegram`, glowing Recharts, and data tables — never a photo-led landing. Interview start alerts portal a lime toast to `document.body` (`z-[220]`) while the desk is open.

The room is signed by a solid lime **TD** mark (14px at 44px in the rail, 18px at 64px on auth) with a lime bloom. Lime is the conversion color (primary CTA, active nav pill, selection wash, scrollbar). Peach is the floating-label / estimated-series voice. Violet, cyan, and magenta remain as heritage signals on charts, KPI sparks, and leftover field-focus — they do not replace lime on conversion. Emerald / amber / rose are pipeline status only.

Density is operational. Dashboard panes, the auth card, and DeskTotalsStrip use `<GlassPanel>` — Pattern C liquid glass from vendored `src/lib/liquid-glass.js`: an aligned copy of the desk mesh is bent with `filter: url(#…)` so rim refraction reads in Chrome, Safari/iOS, and Firefox. Host chrome is `.liquid-glass-host` (20px radius, transparent fill, inset highlight + 6% lime seam). Optics stay restrained (`chroma` ≤ 0.08, `specular` ≈ 0.4) so rims do not oil. Inner padding stays `p-6` / `sm:p-7` so titles do not hug the frost. Working forms still sit on `.card-surface` (charcoal gradient + 4% lime wash, default `p-6`). Motion is cinematic: GSAP stretchy slide-pill that follows **hover and active** (in-flight tweens killed so rapid hover never stacks), icon micro-scale, collapsed-rail glass tooltips, Framer **spring** page enter (opacity + y only — no CSS `filter` on the wrapper, so overlays stay viewport-fixed), spring stagger on the dashboard, a slow lime orb pulse on the totals strip. Modals and drawers portal to `document.body` and open with a snappy blur-scale on the **dialog panel** (not the overlay); `glass` modals skip that Framer `filter` because the SVG lens already lives on the panel. Offer cards open a wide liquid-glass preview that lists linked candidates. Chrome actions (CSV export, calendar Today/prev/next, Scan offer, Edit offer) may use `Button variant="glass"`. UI SFX (thud / bass / pop) exist but are **muted by default**. `prefers-reduced-motion` and `prefers-reduced-transparency` skip refraction (tint + rim only), collapse animations to 0.01ms, silence SFX, and still the totals-strip orb. The leftover `.glass-panel` CSS frost utility is unused by live panes — do not revive it as the working surface. The world rejects light SaaS, Inter as the product face, sharp 2px chrome, and the previous violet-conversion neon desk.

**Key Characteristics:**
- Charcoal canvas (`#111111`) with a soft lime / violet / peach orb mesh (no hard stripes) and optional film grain on auth
- Lime (`#C6F432`) as conversion; peach (`#F4B183`) as kicker and estimated series; heritage violet / cyan / magenta as chart sparks only
- Soft 12–20px radii on controls and cards; pills for badges, search, and toggle chips
- Plus Jakarta Sans for all UI; JetBrains Mono only for money, counts, and the header clock (`.tabular`)
- Solid lime TD mark + glow as the brand lockup (not a three-stop gradient)
- GSAP stretchy lime nav pill on hover + active + collapsible 17rem → 4.75rem rail with glass tooltips
- Pattern C liquid-glass panes (`<GlassPanel>` over `[data-td-glass-stage]`) as the working signature; neon Recharts (lime + peach)
- `Button variant="glass"` for quiet chrome (export, calendar, scan, offer edit) — not conversion
- Auth liquid-glass card on orbs — no rail until session; no demo-preview bypass
- Offer cards click into a wide glass preview modal with a linked-candidates list; Edit/Delete stay independent
- Candidates / Offers / Interviews open with a lime **DeskTotalsStrip** (unfiltered shared counts, `AnimatedNumber`)
- Interview Calendar (`/calendar`, nav `05`) is month / week / day on `.card-surface`; today is a lime disc
- Sticky header clock: peach `.floating-label` date + JetBrains Mono live time (`sm+` only)
- Header notification bell: 40px pill, lime unread badge, 16px glass dropdown of Added candidate/offer activity
- Interview start toast: body-portaled lime glass bar (`z-[220]`), auto-dismiss 14s; Settings **Interview alerts** card + Interviews lime permission banner
- Past interviews: lime **Confirmed** / rose **Declined** (`size="sm"`); Confirmed is emerald `stageTone`, Declined by company is rose
- Personal Telegram (`/telegram`, nav `07`): amber unofficial-client notice, `.card-surface` login steps, then three-pane chat with lime **Chats / Groups** tab strip (dialogs / thread / candidate match)
- Settings Account card shows a Storage row; cloud mode adds a `.card-surface` Cloud sync card with a secondary upload button — same desk chrome, not a second look

## Colors

A lime-primary charcoal palette. Neutrals are warm-black, not cool navy.

### Primary
- **Signal Lime** (`#C6F432`): Conversion. Primary CTA, “Join Talent Desk”, active nav pill, selection (`rgb(198 244 50 / 0.35)` on `#111`), scrollbar rest, in-page links, confirm buttons. Keep large fills rare — the lime hero CTA and the stretchy pill are the exceptions.
- **Lime Glow** (`#D9FF6A`): Primary hover, gauge end-stop.
- **Lime Bloom** (`0 0 28px rgb(198 244 50 / 0.35)`): Primary button rest, TD mark, active pill, dashboard lime CTA.

### Secondary
- **Peach** (`#F4B183`): `.floating-label` kickers (“Desk”, `APP_NAME`, auth tagline), estimated chart series (dashed), bar-chart end-stop, auth orb, gauge start-stop. Peach is voice, not conversion.
- **Signal Violet** (`#7C3AED`): Heritage. KPI spark, donut slice, leftover field `:focus` ring. Do not use as the primary CTA.
- **Violet Glow** (`#A78BFA`): Estimated KPI spark; leftover empty-state eyebrow.
- **Signal Cyan** (`#22D3EE`): Income spark, cyan button variant, sound-toggle hover, **Chinese** market chip, **Male** gender chip. Global `:focus-visible` is **lime**, not cyan.
- **Cyan Glow** (`#67E8F9`): Cyan button hover.
- **Signal Magenta** (`#EC4899`): Candidates KPI spark; **Female** gender chip. Magenta button variant still exists but register is lime, not magenta — do not promote magenta to conversion.
- **Magenta Glow** (`#F472B6`): Magenta hover.

### Tertiary
- **Emerald** (`#10B981`): Hired / Paid / Live / **Confirmed**. Status only.
- **Amber** (`#F59E0B`): Screening / Paused / interviews KPI. Status only.
- **Rose** (`#F43F5E`): Overdue / Rejected / Closed / **Declined by company** / form errors. Status and danger buttons only.

### Neutral
- **Canvas** (`#111111`): Page ground, `body` fill, lime-on-canvas text.
- **Canvas Raised** (`#161616`): Rail, field wells (`bg-canvas-raised/90`).
- **Surface** (`#1A1A1A`): Modal, some rest cards, chart tooltip fill.
- **Surface Raised** (`#1F1F1F`): Secondary buttons.
- **Surface Hover** (`#262626`): Secondary hover.
- **Ink** (`#F8FAFC`): Primary text.
- **Ink Muted** (`#94A3B8`): Supporting copy, inactive nav, chart ticks.
- **Ink Dim** (`#64748B`): Placeholders, table headers, taglines.
- **Border** (`rgb(255 255 255 / 0.08)`): Default seam.
- **Border Strong** (`rgb(255 255 255 / 0.14)`): Field rest stroke.

### Named Rules
**The Lime Conversion Rule.** `#C6F432` is the irreversible action: Enter Talent Desk, Join Talent Desk, Confirm, Open candidates, the stretchy nav pill. Peach, violet, cyan, and magenta may light charts and kickers — they do not replace the primary CTA on a working pane.

**The Status-Not-Brand Rule.** Emerald, amber, and rose map pipeline / earning / offer states through `stageTone`. Do not promote them into a four-color brand.

**The Market-Chip Rule.** Candidate market uses the same values as offer categories (`forex` | `chinese`). Forex is lime (`marketTone`); Chinese is cyan. Unset is a dim em-dash, never a muted fake badge.

**The Mesh-Is-Atmosphere Rule.** `.bg-mesh` is a soft atmospheric wash of lime / violet / peach orbs (no hard repeating stripes — those turned into oily glare bands under the displacement map). It is ground lighting **and** the Pattern C backdrop copy, not a fill token for cards. Dashboard panes stay on `<GlassPanel>`; forms stay on `.card-surface`.

## Typography

**Display Font:** Plus Jakarta Sans (with ui-sans-serif) via `--font-sans`
**Body Font:** Plus Jakarta Sans
**Label/Mono Font:** JetBrains Mono (with ui-monospace) via `--font-mono` and `.tabular`

**Character:** One geometric sans does the room — extra-bold tracking-tight titles, semibold controls, medium labels. Mono is reserved for money, KPI numerals, the header clock, DeskTotalsStrip counts, and nav indexes (`01`–`08` plus Admin `09`). There is no serif editorial voice. Dashboard card titles are `text-xl` (`CardTitle`); subtitles are `15px` / `text-base` (`CardSubtitle`); empty panes use `CardEmpty` at `16–18px` so glass does not look empty.

### Hierarchy
- **Display** (800, `text-3xl`–`text-4xl`, tracking tight, lime text-glow on auth): Login wordmark, dashboard “Pipeline command center”, live-desk paid figure.
- **Headline** (800, `text-lg`–`text-xl`): Sticky header page title (`Overview`, `Candidates`, …). Modal title is `text-lg` / `sm:text-xl` bold in the sticky bar.
- **Title** (600, `text-xl` / `CardTitle`): Card titles, operator name, table names. Sized up so glass panes read as occupied.
- **Subtitle** (400, `15px` / `sm:text-base` leading-snug muted / `CardSubtitle`): Supporting line under a card title.
- **Body** (400–500, `14px`): Forms, descriptions, table cells. `CardEmpty` is `text-base` / `sm:text-lg`. Chart axis ticks are `14px` medium `#cbd5e1`, not 11px gray dust.
- **Label** (700, `10–11px`, tracking `0.16–0.22em`, uppercase, peach via `.floating-label`): “Desk”, `APP_NAME` kicker, header clock date, table thead (`0.06em` on thead). DeskTotalsStrip labels are the same size/tracking but **lime**, not peach — live counts, not kickers.
- **Mono** (500, tabular-nums): `formatMoney`, spark KPI values, nav index digits, `AnimatedNumber`, header clock time (`text-sm`).

### Named Rules
**The One-Sans Rule.** Plus Jakarta Sans is the product face. Do not introduce Inter, Geist, Syne, or a serif masthead. JetBrains Mono does not set sentences.

**The Tracked Kicker Rule.** Eyebrows are 10px uppercase with `0.18–0.22em` tracking in **peach** (`.floating-label`). Do not restore a magenta kicker or a lime square badge as the system eyebrow.

**The Occupied Glass Rule.** Card titles are `text-xl`; subtitles `15–16px`; empty-state copy `16–18px`; chart ticks `14px` `#cbd5e1`. Inner padding on glass panes is `p-6` / `sm:p-7`. Do not drop supporting copy back to 11px gray on glass.

## Layout

The authenticated product is a collapsible rail-plus-canvas command floor.

- **Rail:** Fixed `17rem` expanded / `4.75rem` collapsed (`talent-desk.sidebar-collapsed`). `bg-canvas-raised/95` + `backdrop-blur-xl`, 1px right seam. Width transition `400ms` `cubic-bezier(0.16, 1, 0.3, 1)`. Brand lockup, peach “Desk” kicker, indexed nav with a GSAP lime slide-pill that tracks **hover or active** (`focusKey = hoveredKey ?? activeKey`). Icons scale `1.08` focused / `1.06` active. Collapsed rail shows a fixed glass tooltip 10px right of the row. Operator chip (lime/10 wash), ghost Sign out, collapse control. Below `lg` it slides off-canvas (`-translate-x-full`) behind a `bg-black/55` scrim.
- **Header:** Sticky, `bg-canvas/80` + blur, 12px vertical padding. Page title left; **HeaderClock** (peach date + mono time, `hidden sm:flex`), search (md+), **HeaderNotifications** (40px pill + lime badge), sound toggle, lime-ring initials avatar right. Mobile hamburger is a 12px-radius bordered square. Do not crowd the clock next to the search well.
- **Main:** `px-4 py-6` → `sm:px-6` → `lg:px-8`. Vertical stack `space-y-5` / `gap-4`. Page content swaps through `PageTransition` (`springSoft` opacity + `y: 14` in; exit opacity + `y: -8` in 0.2s). **No CSS `filter` or scale on this wrapper**, so `position: fixed` overlays are not clipped.
- **Auth:** Centered `max-w-md` `<GlassPanel className="card-glow">` (optics: refraction 20 / bezel 0.3 / chroma 0.07 / specular 0.4 / blur 2) on `.bg-mesh` with `data-td-glass-stage` and three `.auth-orb` blobs (lime, peach, violet; `blur(48px)`). Film-grain overlay. Sound toggle top-right. No rail.
- **Dashboard:** 5-col hero (`3 + 2`) at `lg`; 4 glass KPI cards (`!p-4`); then area + attention, donut + bar + estimated list (`p-6 sm:p-7`), recent table (`!p-0`). Empty desk shows a lime/10 banner and zeros — never seeded demo income.
- **Working tables:** `.data-table` full width, 14px body, 11px uppercase thead, 13.6×16px cells, hover lime-5%. Candidates table is `min-w-[1040px]` with Languages, Market, Gender, Location, and **icon-only** actions (Schedule / Edit / Delete — `h-8 w-8`, aria-label + title). Overview recent-candidates table shows Name / Market / Gender / Stage / Source / Telegram.
- **Interview Calendar:** `/calendar` (nav index `05`). Toolbar is a `.pill-toggle` (month / week / day) + secondary prev/Today/next + extrabold heading + lime **Schedule**. Month grid is `.card-surface !p-0`, Monday-start, today a lime disc with glow; event chips are 8px lime/10 wells. Week/day is a 08–20 hour grid (`min-w-[640px]`). Empty hour cells schedule at that slot.
- **Dialogs:** Modal and Drawer **portal to `document.body`** at `z-[200]`. Overlay is `bg-black/75` (no backdrop-blur) fading 0.2s. Dialog shell is `max-h-[min(90vh,calc(100dvh-2rem))]` with a sticky title bar and a scrollable body; wide forms use `max-w-2xl`. Opaque modals open with `springSnappy` on the panel: scale `0.94` → `1`, `blur(8px)` → `0`, `y: 12` → `0`. `glass` variant is `.liquid-glass-host` Pattern C (lime/25 seam, SVG lens, **no** Framer `filter` on the panel — offer preview). Drawer is a right `max-w-md` panel at `100dvh` sliding `x: 28` with a 6px blur. Body scroll is locked while either is open. Escape and overlay click close.

Spacing rhythm is 8 / 12 / 16 / 20 / 24 / 32.

## Elevation & Depth

Depth is Pattern C liquid glass plus lime bloom, not Material elevation. Working panes are a transparent `.liquid-glass-host` that refracts an aligned copy of `[data-td-glass-stage]` through an SVG displacement filter (`src/lib/liquid-glass.js`). Default desk optics (`DESK_GLASS`): radius 20, refraction 22, bezel 0.32, curvature 4, chroma 0.08, blur 2, specular 0.42, specularWidth 1.15, lightAngle −125. Compact chrome (`DESK_GLASS_BUTTON`): radius 12, refraction 12, bezel 0.55, chroma 0.06, specular 0.4. A denser `.td-glass-tint` + quieter `.td-glass-rim` sit over the bent copy so labels stay readable and specular cannot wash the centre. Forms stay opaque charcoal. The page mesh and auth orbs supply atmosphere **and** the lens source. Reduced motion / reduced transparency skip `createGlass` and leave tint + rim. Do not raise chroma above 0.08 or specular much above 0.4 — that was the oily rainbow glare.

### Shadow Vocabulary
- **Lime glow** (`0 0 28px rgb(198 244 50 / 0.35), 0 0 8px rgb(198 244 50 / 0.2)`): Primary CTA, TD mark, active pill, confirm lime.
- **Violet glow** (`0 0 28px rgb(124 58 237 / 0.4)`): Heritage CTA variant only.
- **Cyan glow** (`0 0 28px rgb(34 211 238 / 0.35)`): Cyan CTA variant.
- **Magenta glow** (`0 0 28px rgb(236 72 153 / 0.35)`): Magenta CTA variant.
- **Card glow** (`inset 0 1px 0 rgb(255 255 255 / 0.05), 0 0 0 1px rgb(198 244 50 / 0.1), 0 12px 40px rgb(0 0 0 / 0.4)`): Auth / KPI `.card-glow`.
- **Auth bloom** (`0 0 80px rgb(198 244 50 / 0.12)`): Login glass extra bloom.
- **Hero lime** (`0 0 48px rgb(198 244 50 / 0.15)`): Dashboard command-center slab.
- **Liquid-glass host** (`inset 0 1px 0 rgb(255 255 255 / 0.1), 0 0 0 1px rgb(198 244 50 / 0.06), 0 16px 40px rgb(0 0 0 / 0.45)`): `<GlassPanel>` / `.liquid-glass-host` working panes.
- **Glass button** (`0 8px 24px rgb(0 0 0 / 0.35)`): `Button variant="glass"` rest; hover lime/40 border.
- **Focus (global)** (`outline: 2px solid #C6F432; outline-offset: 2px`).
- **Focus (fields, leftover):** `ring-2 ring-violet/30` + `border-violet/70`. Search uses lime (`border-lime/50` + `ring-lime/20`).
- **Badge** (`0 0 12px rgb(0 0 0 / 0.15)`): Soft rest under pills.

### Named Rules
**The Glow-Is-Signal Rule.** Bloom belongs on conversion, brand mark, the stretchy pill, and charts. Rest forms use `.card-surface` only (inset highlight, no outer bloom). Dashboard KPIs may take `.card-glow` on glass.

**The Glass Desk Rule.** Overview, auth, totals, and `Modal glass` are `<GlassPanel>` / `.liquid-glass-host` over `[data-td-glass-stage]`. Desktop uses Pattern C refraction (`filter: url(#…)`, restrained chroma/specular, soft orbs). Mobile / narrow touch uses polished frost (`.liquid-glass-host--frost`) — no feDisplacementMap, so small cards don’t grow left-edge ripples. Do not flatten panes to opaque slabs. Never put `filter: url(...)` on `PageTransition` or the modal overlay. Glass chrome buttons use `Button variant="glass"`. Honor `prefers-reduced-transparency` by skipping refraction.

**The Overlay-On-Body Rule.** Modal and Drawer always `createPortal` to `document.body` at `z-[200]`. Page shells must not use CSS `filter` or a transform containing block. Overlay fill is `bg-black/75` without `backdrop-blur` (blur on the overlay was cutting the viewport in half). Framer `filter: blur` on the **dialog panel** during open/exit is the preview motion — keep it off the overlay and off `PageTransition`.

## Shapes

The silhouette is softly rounded charcoal chrome — 12px controls, 20px slabs, full pills for status, a 14px-round clip on the nav pill.

- **Brand mark:** 14px at 44px (rail); 18px at 64px (auth). Solid lime fill, black letters — not a violet→magenta→cyan gradient.
- **Nav rows / slide pill:** 14px (`round 14px` clip-path).
- **Buttons / fields / header menu:** 10–12px (`rounded-[10px]` sm, `12px` md/lg).
- **Search / sound toggle / avatar:** full pill.
- **Cards / modal / empty / dashboard heroes / glass:** 20px (`--radius-card`).
- **Operator chip:** 18px, lime/25 border, lime/10 fill.
- **Badges / pill toggles:** `9999px`. Active pill-toggle is solid lime on `#111`.
- **Table:** no radius on rows; the wrapping glass card carries the 20px.

Borders are 1px white at 8% rest, 14% on fields. Active filters and badges pick up a 30% tint of their tone.

## Components

### Buttons
- **Shape:** 12px (10px at `sm`), height 40px (`h-8` sm / `h-11` lg), semibold, 8px icon gap, 200ms transition. Hover plays `pop`; click plays `tap` (when SFX unmuted).
- **Primary:** Lime fill, canvas (`#111`) text, 20px lime bloom. Hover `#D9FF6A`. “Enter Talent Desk”.
- **Lime (alias):** Same fill; used for “Join Talent Desk” and “Confirmed”.
- **Secondary:** Surface-raised, 1px border, hover `border-strong` + surface-hover.
- **Ghost:** Transparent, muted text; hover ink + `white/5`. Sign out in the rail.
- **Glass:** Transparent `.liquid-glass-host` capsule, ink text, white/15 border, 8px black rest shadow; hover lime/40 border. Pattern C rim refraction over the desk mesh (`DESK_GLASS_BUTTON`). Used for quiet chrome — CSV export, calendar Today/prev/next, Scan offer, Edit offer in the preview. Not conversion (that stays lime fill).
- **Cyan / Magenta:** Heritage signal fills. Magenta is **not** the register CTA anymore.
- **Danger:** Rose veil 15% + rose text + rose/30 border. Used for **Delete** on the candidates table, detail drawer, and the named confirm modal, and for **Declined** on past interviews (`size="sm"`). Compact table actions are `h-8 px-2`.
- **Disabled:** 45% opacity, no pointer.
- **Motion shell:** `MotionButtonShell` scales 1.015 / 0.985 on hover/tap.

### Chips / Badges
- Full pill, 11px semibold, 1px tinted border, 15% fill of the tone. Tones: **lime**, violet, cyan, magenta, emerald, amber, rose, muted. Soft rest shadow `0 0 12px rgb(0 0 0 / 0.15)`.
- `stageTone()` maps Hired/Paid/Live/**Confirmed** → emerald; Accepted/Pending/Interview → cyan; Offer/Estimated → violet; Overdue/Rejected/Closed/**Declined by company** → rose; Paused/Screening → amber.
- `marketTone()` maps `forex` → lime (“Forex”); `chinese` → cyan (“Chinese”); null → no chip (dim `—`).
- `genderTone()` maps `male` → cyan (“Male”); `female` → magenta (“Female”); null → no chip. Magenta here is a chip mapping, not a CTA.
- Admin role badges (not `stageTone`): owner → magenta, admin → lime, moderator/user → violet. Same pill chrome as pipeline chips.
- Pill toggle (`.pill-toggle`): surface well; active item is solid lime + glow.

### Cards / Containers
- **`Card`:** `.card-surface p-6` (settings, forms). Header is title left, actions right (`mb-5`).
- **Dashboard panes:** `<GlassPanel>` (`.liquid-glass-host`) + optional `.card-glow` + `p-6 sm:p-7`. KPI cards `!p-4`. Recent-candidates table pane `!p-0`. Default `DESK_GLASS` optics.
- **Dashboard heroes:** `.hero-gradient-violet` is now a charcoal→violet-wash→green-black slab (`#1a1a1a → #2a1848 → #1a2a22`), not a solid violet fill. `.hero-gradient-cyan` is a lime slab (`#c6f432 → #a8d92a → #8bc420`) used as the live-desk companion only if reapplied — current live-desk pane is glass, not that gradient.
- **Empty:** 20px dashed border, `bg-surface/40`, 64px vertical padding. Eyebrow is still violet-glow (leftover); prefer peach `.floating-label` on new empties.
- **`CardEmpty`:** Dashed `rounded-[16px]` well, `min-h-[11rem]` / `sm:min-h-[12.5rem]`, `text-base` / `sm:text-lg` medium muted, centered. Used on Needs attention / Pipeline mix / Awaiting confirmation when those lists are empty.
- **Empty-desk banner:** 16px, lime/10 fill, lime/30 border, 24px lime bloom. Honest zeros, not demo metrics.

### Inputs / Fields
- **Style:** 12px radius, `border-border-strong`, `bg-canvas-raised/90`, 14px ink, dim placeholder. Height 40px.
- **Focus (shipped):** Violet/70 border + 2px violet/30 ring on `Input` / `Textarea` / `Select`. Search (header) uses lime. Global `:focus-visible` is lime. New fields should follow search/global (lime), not grow the violet leftover.
- **Search (header):** Full pill, `bg-surface/80`, 240px, icon inset. Chrome only — no query handler.
- **Error:** Rose/30 panel, 14px radius, rose title.

### Navigation
Rail: collapsible 17rem / 4.75rem, solid lime TD mark, “Talent Desk” 15px extrabold + 10px dim tagline. “Desk” kicker in peach. Rows are 14px radius; inactive muted; hover ink. The GSAP `.nav-pill` follows the **focused** row (hovered, else active). Active+focused text is canvas (`#111`); hover-only is ink. Lead 0.32s `power3.out`, trail 0.52s `power3.inOut`; other edges 0.38s. Rapid hover kills in-flight tweens. Icons (`.nav-item-icon`) opacity 0.72 rest → 1 focused, scale `1.08` focused / `1.06` active. Collapsed rail: labels `sr-only`; a `.nav-tooltip` glass chip (`10px` radius, 12px type, 70ms show / 180ms hide) sits `left: row.right + 10px`. Indexes are 10px mono dim (hidden when collapsed). Operator chip is a lime-tinted well. Collapse plays `thud`; nav click plays `bass`; nav hover plays `pop` (skipped on the already-active row). Mobile: hamburger + scrim.

Header kicker is peach uppercase `APP_NAME`; title is the current nav label. Nav indexes: Overview `01` … Earnings `06`, Telegram `07` (`MessageCircle`), Settings `08`, Admin `09`. Interview Calendar is `05` (`CalendarDays`). Avatar is a 40px lime/20 disc with lime ring. HeaderClock sits between the title cluster and search; the notification bell sits between search and the sound toggle.

### Signature: Pattern C liquid glass
`src/components/ui/GlassPanel.tsx` + `src/hooks/useLiquidGlass.ts` + vendored `src/lib/liquid-glass.js`. Host is `.liquid-glass-host`. Inside: a pointer-events-none layer copies `[data-td-glass-stage]` background (`AppShell` / `AuthShell` `.bg-mesh`), `createGlass` applies `filter: url(#…)` with `fit` + `clip`, then `.td-glass-tint` and `.td-glass-rim` overlay. Fallback silk (`.td-glass-silk`) if no stage. Skip `createGlass` when `liquid={false}`, `prefers-reduced-motion`, or `prefers-reduced-transparency`. **Never** put this filter on `PageTransition` or the modal overlay — leaf panes and chrome only. `.glass-panel` CSS (backdrop-filter frost) remains in `src/index.css` unused by live TSX; do not revive it.

### Signature: body-portaled dialog
`Modal` / `Drawer` in `src/components/ui/Modal.tsx`. Portal to `document.body`. Overlay `fixed inset-0 z-[200]` with `overflow-y-auto`, `bg-black/75`, `p-4 sm:p-6`, opacity fade 0.2s (`AnimatePresence`). Dialog: `rounded-[20px]`, `bg-surface` (or `.liquid-glass-host` Pattern C + lime/25 when `glass`, optics refraction 20 / bezel 0.3 / chroma 0.07 / specular 0.4), `max-h-[min(90vh,calc(100dvh-2rem))]`, sticky `px-5 py-4` title bar, scrollable `px-5 py-5` body. Opaque modals open/exit with `springSnappy` (stiffness 380 / damping 28 / mass 0.7) on the panel: scale `0.94`, `blur(8px)`, `y: 12` → rest; exit scale `0.96`, `blur(6px)`, `y: 8`. **Glass** modals keep scale/y but drop Framer `filter` so it does not fight the SVG lens. Wide candidate form and offer preview are `max-w-2xl`. Confirm-delete is `max-w-lg` and names the candidate. Drawer scrim `bg-black/60`; panel `x: 28` + `blur(6px)` (drawer is opaque surface, not liquid glass). Body scroll lock compensates for scrollbar width. Reduced motion is opacity-only at 0.01s. Do not reintroduce overlay `backdrop-blur` or nest these inside `PageTransition`.

### Signature: stretchy lime pill
`src/lib/slide-pill.ts`. The pill is a lime rectangle under the nav; clip-path reveals the **hovered or active** row with a stretchy lead/trail. Lead 0.32s `power3.out`, trail 0.52s `power3.inOut`. `gsap.killTweensOf` on both the anim state and the pill node before every move so rapid hover never stacks. Reduced motion snaps via `setPillImmediate`. Do not restore a 3px magenta inset bar as the active treatment.

### Signature: admin seats console
`AdminPage` is the same lime-glass desk, not a second product look. Four `.card-surface !p-4` KPI tiles (seats used, accounts, pipeline totals, estimated aggregate), then a `!p-0` accounts table with 12px role `Select`, Password, and Delete. Owner row is **Protected** (no actions). Add account is a standard `Modal`. Role badges: owner magenta, admin lime, else violet. Do not introduce a distinct admin theme or a second conversion color. Cloud sync chrome lives on Settings, not Admin.

### Signature: Settings cloud storage
Account card adds a **Storage** definition (`sm:col-span-2`): “Hosted Supabase · shared team desk (realtime + refresh)” when `cloudSync`, else “This browser · localStorage (device-local fallback)”. When cloud is on, a second `.card-surface` titled **Cloud sync** with muted 14px copy and a `variant="secondary"` button “Upload this browser’s local desk to cloud”. Success/error are emerald/rose 14px lines. Login helper copy is `text-xs text-ink-muted` inside the auth card — the lime chip stays `APP_NAME`, not a “CLOUD” badge. Do not add a dashboard sync banner, a lime “Synced” pill in the rail, or a second conversion color for upload.

### Signature: candidate market + gender chips
`CandidatesPage` + Overview recent table. Market and gender are optional single-selects on the wide Add/Edit form (`CANDIDATE_MARKETS` / `CANDIDATE_GENDERS`, empty = Unset). Filters: All markets / Forex / Chinese / Unset; All genders / Male / Female / Unset. Table, detail drawer, and dashboard render lime Forex / cyan Chinese and cyan Male / magenta Female pills via `marketTone` / `genderTone`. Unset stays a dim em-dash (or “Unset” in the drawer). Do not invent a third market or a non-binary option the form does not ship.

### Signature: offer glass preview
`OffersPage` cards are `.card-surface !p-4` in a 2/3-col grid. Click / Enter / Space opens a wide `Modal glass` titled “Offer preview”: title `text-xl`, provision/salary tiles, package lime badges, description well, **Candidates** list (rows whose `offerId` matches — name, stage chip, market chip, Open → `/candidates?id=`), Edit offer / Delete. Empty copy: “No candidates linked to this offer.” Card Edit and Delete are icon-only (`h-8 w-8`) and `stopPropagation`. Hover: lime/25 border + 12% lime ring. Do not make the card itself a modal.

### Signature: DeskTotalsStrip
`src/components/desk/DeskTotalsStrip.tsx`. Tops Candidates, Offers, and Interviews. One `<GlassPanel className="!p-4">` (optics refraction 18 / bezel 0.3 / chroma 0.06 / specular 0.38 / blur 2) with three cells (Total candidates / Total offers / Total interviews): 14px lime/15 icon well + `glow-lime`, 11px lime tracked label, `text-3xl` / `sm:text-4xl` lime `AnimatedNumber`, 12px dim “All desk rows · live shared total”. Counts are **unfiltered** shared-desk lengths (not the page’s search/filter). A slow lime orb pulses unless `prefers-reduced-motion`. Do not restyle this as Overview KPI cards or add a fourth money cell.

### Signature: header clock
`src/components/layout/HeaderClock.tsx`. Right of the page title, before search. Peach `.floating-label` date (`weekday short` + `month short` + day via `Intl`) over JetBrains Mono `text-sm` time with seconds, ticking every 1s. Browser locale + local timezone. Hidden below `sm`. Do not use a second conversion color or a pill chrome around the clock.

### Signature: header notification bell
`src/components/layout/HeaderNotifications.tsx`. 40px rounded-full pill (`border-border bg-surface/80`), Bell icon, hover lime. Unread count is a lime disc (`h-4`, `9+` cap, lime bloom). Dropdown is `rounded-[16px]` `bg-canvas-raised/95` blur, lime tracked “Notifications” kicker, 20-row list of Added candidate / Added offer activity (new rows `bg-lime/[0.06]`). Polls `activities` every 1s (cloud realtime also invalidates). Watermark is per-browser. `pop` SFX when unread rises. Do not fold interview reminders into this menu.

### Signature: interview start toast
`InterviewReminderWatcher` portals to `document.body` at `z-[220]`. Centered `max-w-md` bar: `rounded-[16px]`, `border-lime/35`, `bg-canvas/95`, lime bloom, 12px lime/15 Bell well, lime tracked “Interview starting”, candidate name, offer · time, cyan “Open interviews” (leftover — new work should be lime). Auto-dismiss 14s. Settings **Interview alerts** is a `.card-surface` with a lime-accent checkbox; Interviews shows a lime/10 permission banner (`Allow alerts` primary / `Not now` ghost) when permission is `default`. Do not add a second toast theme or a server push.

### Signature: interview confirm / decline
Past-interview cards on `/interviews` (tab **past**, outcome undecided) show lime `size="sm"` **Confirmed** (`variant="lime"`, Check icon) and rose **Declined** (`variant="danger"`, X icon) beside the outcome badge. Confirmed maps `stageTone` emerald; Declined by company maps rose. Preview line is dim 12px “Est. commission {money}”. Do not restyle Confirmed as a cyan free-text chip or use magenta for decline.

### Signature: personal Telegram chat
`TelegramPage` (`/telegram`, nav `07`). Login: amber unofficial-client notice, then `.card-surface !p-5` steps (api_id/hash, phone, code, 2FA). Ready: lime tracked “Telegram” kicker + secondary Disconnect; `lg` grid `300px / 1fr / 240px` of `.card-surface !p-0` panes. Dialog pane header is a 2-col **Chats / Groups** tab strip (`rounded-[12px]` well, selected `bg-lime/20 text-lime`, counts + `999+` unread pills). Active dialog is lime/10; unread is a lime/20 pill (`formatUnread`); outbound bubbles `bg-lime/20 rounded-[14px]`; inbound `bg-canvas-raised` + border. Candidate rail uses a lime kicker. Do not introduce Telegram-blue chrome or a bot-token login.

### Signature: icon-only row actions
Candidates table and offer cards: Schedule / Edit / Delete (and offer Edit / Delete) are `h-8 w-8 px-0` buttons with Lucide icons, `aria-label`, and `title`. Do not restore wordy “Edit” / “Delete” labels in the table. Schedule interview routes to `/calendar?candidate=` (query cleared after the modal opens).

### Signature: Interview Calendar
`InterviewCalendarPage` + `ScheduleInterviewModal`. Same lime-glass desk, not a second product look. Month cells `min-h-[7.5rem]` / `sm:min-h-[8.5rem]`; out-of-month days sit on `bg-canvas/40`. Plus affordance appears on hover. Event chip: `rounded-[8px] border-lime/25 bg-lime/10` 11px semibold, time in tabular lime/80. Deep-link `?candidate=` (optional `at`) opens the schedule modal then strips the params. Do not introduce a full-bleed calendar library chrome or a non-lime today marker.

### Signature: collapsed rail tooltip
`.nav-tooltip` in `src/index.css`. Fixed, `z-60`, 10px radius glass chip, 12px semibold, 70ms delay in / 180ms out, `translateX(-4px) scale(0.96)` → rest. 8px diamond caret on the left. Only when the rail is collapsed. Do not use a native `title` attribute as the collapsed label.

### Signature: neon charts
`Sparkline`, `NeonAreaChart`, `NeonBarChart`, `NeonDonut` in `src/components/ui/charts.tsx`. Lime + peach area (estimated series dashed), lime→peach bar gradient, donut palette lime/peach/violet/emerald/amber/rose. Axis ticks `14px` medium `#cbd5e1`. Tooltips: `#1A1A1A`, 12px radius, 14px type. Gauge ring on the live-desk pane is peach→lime with a lime drop-shadow. Sparklines sit on KPI cards; they do not replace the TD mark.

### Auth card (signature)
Centered `max-w-md` `<GlassPanel className="card-glow">` (optics refraction 20 / bezel 0.3 / chroma 0.07 / specular 0.4 / blur 2) on `.bg-mesh` `data-td-glass-stage` with three `.auth-orb` blobs (lime, peach, violet; `blur(48px)`, drifting via Framer). Film grain overlay. Login CTA is primary lime (“Enter Talent Desk”); register is `variant="lime"` (“Join Talent Desk”). A `text-xs text-ink-muted` helper states whether cloud sync is on. Links between them are lime. No “Preview Talent Desk UI”. Sound toggle is top-right on the shell.

### Motion + SFX
- **Page:** `springSoft` (stiffness 260 / damping 26 / mass 0.85) opacity + `y: 14` → 0; exit opacity + `y: -8` in 0.2s `[0.4, 0, 1, 1]`. **No CSS `filter` on this wrapper.**
- **Nav pill:** hover + active; kill in-flight GSAP; lead 0.32s / trail 0.52s.
- **Dialog panel:** `springSnappy` blur-scale. Overlay fades 0.2s with no blur.
- **Dashboard:** `staggerContainer` 0.07 / 0.08; items `fadeUp` (y 18, blur 6px) with hover lift −2px. Item-level blur is fine; page-level filter is not.
- **Numbers:** `AnimatedNumber` tabular (KPIs, live-desk money, **DeskTotalsStrip**).
- **Totals orb:** `scale`/`opacity` loop 4.5s `easeInOut` on the strip’s lime bloom; skipped when reduced motion.
- **SFX:** Web Audio `thud` / `bass` / `pop` / `hover` / `tap` / `success` / `whoosh`. Key `talent-desk.sfx-muted`. Default muted. Honors `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep canvas / canvas-raised / surface as the charcoal ground family and `#C6F432` as the primary conversion color.
- **Do** set titles in extra-bold Plus Jakarta Sans; money and indexes in JetBrains Mono (`.tabular`).
- **Do** build the Overview from `<GlassPanel>` + `.data-table`; build Settings/forms from `.card-surface`.
- **Do** keep Pattern C liquid glass on leaf panes/buttons only (`GlassPanel`, `Button variant="glass"`, `Modal glass`) via `src/lib/liquid-glass.js`. Never put `filter: url(...)` on `PageTransition` or the modal overlay.
- **Do** skip refraction when `prefers-reduced-motion` or `prefers-reduced-transparency` match — tint + rim only.
- **Do** map pipeline and earning states through `stageTone` — emerald / cyan / violet / rose / amber.
- **Do** keep the solid lime TD mark + glow as the lockup; keep the stretchy lime nav pill.
- **Do** honor `prefers-reduced-motion` (global 0.01ms, no SFX) and keep chrome transitions at 200ms unless a named motion token applies.
- **Do** keep auth as a centered glass card with orbs; do not put the rail on `/login` or `/register`.
- **Do** keep SFX muted by default; never auto-unmute.
- **Do** portal Modal/Drawer to `document.body`. Keep glass pane padding at `p-6` / `sm:p-7` and `CardTitle` at `text-xl`.
- **Do** confirm candidate delete in a modal that names the person; cascade interviews and earnings, leave offers.
- **Do** slide the lime nav pill on hover and active, kill in-flight GSAP tweens, and show a glass tooltip when the rail is collapsed.
- **Do** open offer cards into a wide `glass` preview modal; keep Edit/Delete `stopPropagation`.
- **Do** tag candidates with lime Forex / cyan Chinese market chips and cyan Male / magenta Female gender chips; leave unset as a dim dash, not a muted badge.
- **Do** keep Admin on `.card-surface` KPI tiles + a `!p-0` accounts table; role badges are owner magenta / admin lime / else violet.
- **Do** keep cloud vs local as a Settings fact (Storage row + Cloud sync card + secondary upload). Same lime-glass chrome in both modes.
- **Do** put **DeskTotalsStrip** at the top of Candidates, Offers, and Interviews — unfiltered shared counts, lime on glass, `AnimatedNumber`.
- **Do** keep Interview Calendar as nav `05` (`/calendar`) with pill month/week/day, lime today disc, and lime event chips.
- **Do** keep the header clock as peach date + mono time on `sm+`; do not hide it behind a badge.
- **Do** keep the header bell as a 40px lime-badge pill with a 16px glass dropdown of add-activity only.
- **Do** portal the interview-start toast to `document.body` at `z-[220]` (lime glass, 14s dismiss). Keep alerts as a Settings card + Interviews permission banner.
- **Do** keep Telegram as lime-glass three-pane chat on `/telegram` (nav `07`) with a lime **Chats / Groups** tab strip; login stays `.card-surface`, not a second product look.
- **Do** keep past-interview **Confirmed** as lime `size="sm"` (emerald badge) and **Declined** as rose danger; map those outcomes through `stageTone`.
- **Do** keep candidate STAGE chips honest with interview lifecycle (schedule → Interview cyan; Confirmed → Accepted cyan; Declined → Rejected rose) — do not invent a second stage vocabulary on the table.
- **Do** keep table/card row actions icon-only (`h-8 w-8`) with aria-label + title; Schedule interview goes to `/calendar?candidate=`.
- **Do** list linked candidates inside the offer glass preview and deep-link with `/candidates?id=` (hold the param until the drawer closes).

### Don't:
- **Don't** restore the violet-conversion Neon Signal Desk (`#080A10` canvas, `#7C3AED` primary CTA, magenta inset nav bar, gradient TD mark).
- **Don't** introduce Inter, Roboto, a serif display, or a light/cream canvas. The build is Plus Jakarta Sans on `#111111`.
- **Don't** sharpen chrome to 2px rectangles or fill working cards with solid lime, violet, cyan, or magenta.
- **Don't** treat emerald / amber / rose as brand fills. Don't treat peach as a primary button fill. Don't treat Female's magenta chip as a conversion color.
- **Don't** add a second product look for Admin or for cloud sync — both use the same cards, tables, and badges. Owner/admin/moderator role chips stay magenta/lime/violet heritage, not a new brand. Cloud is not a dashboard banner.
- **Don't** put project refs, anon keys, or service-role values into design files.
- **Don't** seed demo income or restore a demo-preview bypass on the login screen.
- **Don't** put CSS `filter`, SVG `filter: url(...)`, or backdrop-blur on `PageTransition` or the modal overlay — that was the half-viewport black cut. Dialog-panel Framer blur during open is allowed on **opaque** modals only; `glass` modals skip it.
- **Don't** revive the leftover `.glass-panel` CSS frost class as a working pane — live glass is `<GlassPanel>` / `.liquid-glass-host`.
- **Don't** restore hard repeating-stripe mesh or raise `chroma` above 0.08 / `specular` much above 0.4 — that was the oily rainbow glare.
- **Don't** use `Button variant="glass"` as a conversion CTA. Conversion stays lime fill.
- **Don't** let GSAP pill tweens stack on rapid hover. Don't use a native `title` tooltip for collapsed nav labels.
- **Don't** commit secrets, password hashes, or live account JSON into either design file.
- **Don't** restyle DeskTotalsStrip as Overview KPI tiles or add earnings into that strip.
- **Don't** drop Interview Calendar from the rail or merge it into the Interviews list.
- **Don't** promote the offer-preview “Open”, interview-toast, or Telegram candidate cyan links into a second in-page link color — in-page links stay lime.
- **Don't** put Telegram api_id / api_hash / session strings, project refs, or anon keys into design files.
- **Don't** restyle `/telegram` as Telegram-blue messenger chrome, drop the Chats/Groups split, or replace the user client with a bot token.
- **Don't** treat interview **Confirmed** as a cyan free-text badge or paint **Declined** in magenta.
- **Don't** mix interview start alerts into the header bell, or drop Telegram from the rail.
