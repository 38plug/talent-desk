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
    backgroundColor: "rgb(20 20 20 / 0.78)"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
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

## Overview

**Creative North Star: "The Lime Glass Desk"**

Talent Desk is a charcoal operating floor: `#111` canvas, lime conversion, peach kickers, and Plus Jakarta Sans as the only working face. It is an operate-mode SPA, not a marketing site. Auth is a centered glass card on a mesh of lime / peach / violet orbs, with a film-grain overlay and a sound toggle. Once inside, a collapsible raised rail plus a sticky glass header hold the desk; the working canvas is glass KPI heroes, glowing Recharts, and data tables — never a photo-led landing.

The room is signed by a solid lime **TD** mark (14px at 44px in the rail, 18px at 64px on auth) with a lime bloom. Lime is the conversion color (primary CTA, active nav pill, selection wash, scrollbar). Peach is the floating-label / estimated-series voice. Violet, cyan, and magenta remain as heritage signals on charts, KPI sparks, and leftover field-focus — they do not replace lime on conversion. Emerald / amber / rose are pipeline status only.

Density is operational. Dashboard panes use `.glass-panel` (20px blur, 20px radius) with `p-6` / `sm:p-7` inner padding so titles do not hug the frost. Working forms still sit on `.card-surface` (charcoal gradient + 4% lime wash, default `p-6`). Motion is cinematic: GSAP stretchy slide-pill that follows **hover and active** (in-flight tweens killed so rapid hover never stacks), icon micro-scale, collapsed-rail glass tooltips, Framer **spring** page enter (opacity + y only — no CSS `filter` on the wrapper, so overlays stay viewport-fixed), spring stagger on the dashboard. Modals and drawers portal to `document.body` and open with a snappy blur-scale on the **dialog panel** (not the overlay). Offer cards open a wide glass preview. UI SFX (thud / bass / pop) exist but are **muted by default**. `prefers-reduced-motion` collapses animations to 0.01ms and silences SFX. The world rejects light SaaS, Inter as the product face, sharp 2px chrome, and the previous violet-conversion neon desk.

**Key Characteristics:**
- Charcoal canvas (`#111111`) with a lime / violet / peach mesh and optional film grain on auth
- Lime (`#C6F432`) as conversion; peach (`#F4B183`) as kicker and estimated series; heritage violet / cyan / magenta as chart sparks only
- Soft 12–20px radii on controls and cards; pills for badges, search, and toggle chips
- Plus Jakarta Sans for all UI; JetBrains Mono only for money and counts (`.tabular`)
- Solid lime TD mark + glow as the brand lockup (not a three-stop gradient)
- GSAP stretchy lime nav pill on hover + active + collapsible 17rem → 4.75rem rail with glass tooltips
- Glass dashboard panels (`.glass-panel`) as the working signature; neon Recharts (lime + peach)
- Auth glass card on orbs — no rail until session; no demo-preview bypass
- Offer cards click into a wide glass preview modal; Edit/Delete stay independent

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
- **Signal Cyan** (`#22D3EE`): Income spark, cyan button variant, sound-toggle hover. Global `:focus-visible` is **lime**, not cyan.
- **Cyan Glow** (`#67E8F9`): Cyan button hover.
- **Signal Magenta** (`#EC4899`): Candidates KPI spark; magenta button variant still exists but register is lime, not magenta.
- **Magenta Glow** (`#F472B6`): Magenta hover.

### Tertiary
- **Emerald** (`#10B981`): Hired / Paid / Live. Status only.
- **Amber** (`#F59E0B`): Screening / Paused / interviews KPI. Status only.
- **Rose** (`#F43F5E`): Overdue / Rejected / Closed / form errors. Status and danger buttons only.

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

**The Mesh-Is-Atmosphere Rule.** `.bg-mesh` orbs are ground lighting, not a fill token for cards. Dashboard panes stay on `.glass-panel`; forms stay on `.card-surface`.

## Typography

**Display Font:** Plus Jakarta Sans (with ui-sans-serif) via `--font-sans`
**Body Font:** Plus Jakarta Sans
**Label/Mono Font:** JetBrains Mono (with ui-monospace) via `--font-mono` and `.tabular`

**Character:** One geometric sans does the room — extra-bold tracking-tight titles, semibold controls, medium labels. Mono is reserved for money, KPI numerals, and nav indexes (`01`–`07`). There is no serif editorial voice. Dashboard card titles are `text-xl` (`CardTitle`); subtitles are `15px` / `text-base` (`CardSubtitle`); empty panes use `CardEmpty` at `16–18px` so glass does not look empty.

### Hierarchy
- **Display** (800, `text-3xl`–`text-4xl`, tracking tight, lime text-glow on auth): Login wordmark, dashboard “Pipeline command center”, live-desk paid figure.
- **Headline** (800, `text-lg`–`text-xl`): Sticky header page title (`Overview`, `Candidates`, …). Modal title is `text-lg` / `sm:text-xl` bold in the sticky bar.
- **Title** (600, `text-xl` / `CardTitle`): Card titles, operator name, table names. Sized up so glass panes read as occupied.
- **Subtitle** (400, `15px` / `sm:text-base` leading-snug muted / `CardSubtitle`): Supporting line under a card title.
- **Body** (400–500, `14px`): Forms, descriptions, table cells. `CardEmpty` is `text-base` / `sm:text-lg`. Chart axis ticks are `14px` medium `#cbd5e1`, not 11px gray dust.
- **Label** (700, `10–11px`, tracking `0.16–0.22em`, uppercase, peach via `.floating-label`): “Desk”, `APP_NAME` kicker, table thead (`0.06em` on thead).
- **Mono** (500, tabular-nums): `formatMoney`, spark KPI values, nav index digits, `AnimatedNumber`.

### Named Rules
**The One-Sans Rule.** Plus Jakarta Sans is the product face. Do not introduce Inter, Geist, Syne, or a serif masthead. JetBrains Mono does not set sentences.

**The Tracked Kicker Rule.** Eyebrows are 10px uppercase with `0.18–0.22em` tracking in **peach** (`.floating-label`). Do not restore a magenta kicker or a lime square badge as the system eyebrow.

**The Occupied Glass Rule.** Card titles are `text-xl`; subtitles `15–16px`; empty-state copy `16–18px`; chart ticks `14px` `#cbd5e1`. Inner padding on glass panes is `p-6` / `sm:p-7`. Do not drop supporting copy back to 11px gray on glass.

## Layout

The authenticated product is a collapsible rail-plus-canvas command floor.

- **Rail:** Fixed `17rem` expanded / `4.75rem` collapsed (`talent-desk.sidebar-collapsed`). `bg-canvas-raised/95` + `backdrop-blur-xl`, 1px right seam. Width transition `400ms` `cubic-bezier(0.16, 1, 0.3, 1)`. Brand lockup, peach “Desk” kicker, indexed nav with a GSAP lime slide-pill that tracks **hover or active** (`focusKey = hoveredKey ?? activeKey`). Icons scale `1.08` focused / `1.06` active. Collapsed rail shows a fixed glass tooltip 10px right of the row. Operator chip (lime/10 wash), ghost Sign out, collapse control. Below `lg` it slides off-canvas (`-translate-x-full`) behind a `bg-black/55` scrim.
- **Header:** Sticky, `bg-canvas/80` + blur, 12px vertical padding. Page title left; search (md+), sound toggle, lime-ring initials avatar right. Mobile hamburger is a 12px-radius bordered square.
- **Main:** `px-4 py-6` → `sm:px-6` → `lg:px-8`. Vertical stack `space-y-5` / `gap-4`. Page content swaps through `PageTransition` (`springSoft` opacity + `y: 14` in; exit opacity + `y: -8` in 0.2s). **No CSS `filter` or scale on this wrapper**, so `position: fixed` overlays are not clipped.
- **Auth:** Centered `max-w-md` `.glass-panel.card-glow` on `.bg-mesh` with three `.auth-orb` blobs (lime, peach, violet; `blur(48px)`). Film-grain overlay. Sound toggle top-right. No rail.
- **Dashboard:** 5-col hero (`3 + 2`) at `lg`; 4 glass KPI cards (`!p-4`); then area + attention, donut + bar + estimated list (`p-6 sm:p-7`), recent table (`!p-0`). Empty desk shows a lime/10 banner and zeros — never seeded demo income.
- **Working tables:** `.data-table` full width, 14px body, 11px uppercase thead, 13.6×16px cells, hover lime-5%. Candidates table is `min-w-[860px]` with Location + actions (Edit / Delete).
- **Dialogs:** Modal and Drawer **portal to `document.body`** at `z-[200]`. Overlay is `bg-black/75` (no backdrop-blur) fading 0.2s. Dialog shell is `max-h-[min(90vh,calc(100dvh-2rem))]` with a sticky title bar and a scrollable body; wide forms use `max-w-2xl`. Open uses `springSnappy` on the panel: scale `0.94` → `1`, `blur(8px)` → `0`, `y: 12` → `0`. `glass` variant applies `.glass-panel` + lime/20 seam (offer preview). Drawer is a right `max-w-md` panel at `100dvh` sliding `x: 28` with a 6px blur. Body scroll is locked while either is open. Escape and overlay click close.

Spacing rhythm is 8 / 12 / 16 / 20 / 24 / 32.

## Elevation & Depth

Depth is glass plus lime bloom, not Material elevation. Dashboard panes are frosted (blur 20px, saturate 1.25) with an inset 1px white highlight and a 6% lime seam. Forms stay opaque charcoal. The page mesh and auth orbs supply atmosphere.

### Shadow Vocabulary
- **Lime glow** (`0 0 28px rgb(198 244 50 / 0.35), 0 0 8px rgb(198 244 50 / 0.2)`): Primary CTA, TD mark, active pill, confirm lime.
- **Violet glow** (`0 0 28px rgb(124 58 237 / 0.4)`): Heritage CTA variant only.
- **Cyan glow** (`0 0 28px rgb(34 211 238 / 0.35)`): Cyan CTA variant.
- **Magenta glow** (`0 0 28px rgb(236 72 153 / 0.35)`): Magenta CTA variant.
- **Card glow** (`inset 0 1px 0 rgb(255 255 255 / 0.05), 0 0 0 1px rgb(198 244 50 / 0.1), 0 12px 40px rgb(0 0 0 / 0.4)`): Auth / KPI `.card-glow`.
- **Auth bloom** (`0 0 80px rgb(198 244 50 / 0.12)`): Login glass extra bloom.
- **Hero lime** (`0 0 48px rgb(198 244 50 / 0.15)`): Dashboard command-center slab.
- **Glass panel** (`inset 0 1px 0 rgb(255 255 255 / 0.07), 0 0 0 1px rgb(198 244 50 / 0.06), 0 18px 48px rgb(0 0 0 / 0.45)`): Dashboard working panes.
- **Focus (global)** (`outline: 2px solid #C6F432; outline-offset: 2px`).
- **Focus (fields, leftover):** `ring-2 ring-violet/30` + `border-violet/70`. Search uses lime (`border-lime/50` + `ring-lime/20`).
- **Badge** (`0 0 12px rgb(0 0 0 / 0.15)`): Soft rest under pills.

### Named Rules
**The Glow-Is-Signal Rule.** Bloom belongs on conversion, brand mark, the stretchy pill, and charts. Rest forms use `.card-surface` only (inset highlight, no outer bloom). Dashboard KPIs may take `.card-glow` on glass.

**The Glass Desk Rule.** Overview panes are `.glass-panel` (`backdrop-filter: blur(20px) saturate(1.25)`). Do not flatten them back to opaque navy steel (`#121622`) or a single un-blurred `#111` slab.

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
- **Cyan / Magenta:** Heritage signal fills. Magenta is **not** the register CTA anymore.
- **Danger:** Rose veil 15% + rose text + rose/30 border. Used for **Delete** on the candidates table, detail drawer, and the named confirm modal. Compact table actions are `h-8 px-2`.
- **Disabled:** 45% opacity, no pointer.
- **Motion shell:** `MotionButtonShell` scales 1.015 / 0.985 on hover/tap.

### Chips / Badges
- Full pill, 11px semibold, 1px tinted border, 15% fill of the tone. Tones now include **lime** plus violet, cyan, magenta, emerald, amber, rose, muted.
- `stageTone()` maps Hired/Paid/Live → emerald; Accepted/Pending/Interview → cyan; Offer/Estimated → violet; Overdue/Rejected/Closed → rose; Paused/Screening → amber.
- Pill toggle (`.pill-toggle`): surface well; active item is solid lime + glow.

### Cards / Containers
- **`Card`:** `.card-surface p-6` (settings, forms). Header is title left, actions right (`mb-5`).
- **Dashboard panes:** `.glass-panel` + optional `.card-glow` + `p-6 sm:p-7`. KPI cards `!p-4`. Recent-candidates table pane `!p-0`.
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

Header kicker is peach uppercase `APP_NAME`; title is the current nav label. Avatar is a 40px lime/20 disc with lime ring.

### Signature: body-portaled dialog
`Modal` / `Drawer` in `src/components/ui/Modal.tsx`. Portal to `document.body`. Overlay `fixed inset-0 z-[200]` with `overflow-y-auto`, `bg-black/75`, `p-4 sm:p-6`, opacity fade 0.2s (`AnimatePresence`). Dialog: `rounded-[20px]`, `bg-surface` (or `.glass-panel` + lime/20 when `glass`), `max-h-[min(90vh,calc(100dvh-2rem))]`, sticky `px-5 py-4` title bar, scrollable `px-5 py-5` body. Open/exit uses `springSnappy` (stiffness 380 / damping 28 / mass 0.7) on the panel only: scale `0.94`, `blur(8px)`, `y: 12` → rest; exit scale `0.96`, `blur(6px)`, `y: 8`. Wide candidate form and offer preview are `max-w-2xl`. Confirm-delete is `max-w-lg` and names the candidate. Drawer scrim `bg-black/60`; panel `x: 28` + `blur(6px)`. Body scroll lock compensates for scrollbar width. Reduced motion is opacity-only at 0.01s. Do not reintroduce overlay `backdrop-blur` or nest these inside `PageTransition`.

### Signature: stretchy lime pill
`src/lib/slide-pill.ts`. The pill is a lime rectangle under the nav; clip-path reveals the **hovered or active** row with a stretchy lead/trail. Lead 0.32s `power3.out`, trail 0.52s `power3.inOut`. `gsap.killTweensOf` on both the anim state and the pill node before every move so rapid hover never stacks. Reduced motion snaps via `setPillImmediate`. Do not restore a 3px magenta inset bar as the active treatment.

### Signature: offer glass preview
`OffersPage` cards are `.card-surface !p-4` in a 2/3-col grid. Click / Enter / Space opens a wide `Modal glass` titled “Offer preview”: title `text-xl`, provision/salary tiles, package lime badges, description well, Edit offer / Delete. Card Edit and Delete `stopPropagation` so they do not open the preview. Hover: lime/25 border + 12% lime ring. Do not make the card itself a modal.

### Signature: collapsed rail tooltip
`.nav-tooltip` in `src/index.css`. Fixed, `z-60`, 10px radius glass chip, 12px semibold, 70ms delay in / 180ms out, `translateX(-4px) scale(0.96)` → rest. 8px diamond caret on the left. Only when the rail is collapsed. Do not use a native `title` attribute as the collapsed label.

### Signature: neon charts
`Sparkline`, `NeonAreaChart`, `NeonBarChart`, `NeonDonut` in `src/components/ui/charts.tsx`. Lime + peach area (estimated series dashed), lime→peach bar gradient, donut palette lime/peach/violet/emerald/amber/rose. Axis ticks `14px` medium `#cbd5e1`. Tooltips: `#1A1A1A`, 12px radius, 14px type. Gauge ring on the live-desk pane is peach→lime with a lime drop-shadow. Sparklines sit on KPI cards; they do not replace the TD mark.

### Auth card (signature)
Centered `max-w-md` `.glass-panel.card-glow` with three `.auth-orb` blobs (lime, peach, violet; `blur(48px)`, drifting via Framer). Film grain overlay. Login CTA is primary lime (“Enter Talent Desk”); register is `variant="lime"` (“Join Talent Desk”). Links between them are lime. No “Preview Talent Desk UI”. Sound toggle is top-right on the shell.

### Motion + SFX
- **Page:** `springSoft` (stiffness 260 / damping 26 / mass 0.85) opacity + `y: 14` → 0; exit opacity + `y: -8` in 0.2s `[0.4, 0, 1, 1]`. **No CSS `filter` on this wrapper.**
- **Nav pill:** hover + active; kill in-flight GSAP; lead 0.32s / trail 0.52s.
- **Dialog panel:** `springSnappy` blur-scale. Overlay fades 0.2s with no blur.
- **Dashboard:** `staggerContainer` 0.07 / 0.08; items `fadeUp` (y 18, blur 6px) with hover lift −2px. Item-level blur is fine; page-level filter is not.
- **Numbers:** `AnimatedNumber` tabular.
- **SFX:** Web Audio `thud` / `bass` / `pop` / `hover` / `tap` / `success` / `whoosh`. Key `talent-desk.sfx-muted`. Default muted. Honors `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep canvas / canvas-raised / surface as the charcoal ground family and `#C6F432` as the primary conversion color.
- **Do** set titles in extra-bold Plus Jakarta Sans; money and indexes in JetBrains Mono (`.tabular`).
- **Do** build the Overview from `.glass-panel` + `.data-table`; build Settings/forms from `.card-surface`.
- **Do** map pipeline and earning states through `stageTone` — emerald / cyan / violet / rose / amber.
- **Do** keep the solid lime TD mark + glow as the lockup; keep the stretchy lime nav pill.
- **Do** honor `prefers-reduced-motion` (global 0.01ms, no SFX) and keep chrome transitions at 200ms unless a named motion token applies.
- **Do** keep auth as a centered glass card with orbs; do not put the rail on `/login` or `/register`.
- **Do** keep SFX muted by default; never auto-unmute.
- **Do** portal Modal/Drawer to `document.body`. Keep glass pane padding at `p-6` / `sm:p-7` and `CardTitle` at `text-xl`.
- **Do** confirm candidate delete in a modal that names the person; cascade interviews and earnings, leave offers.
- **Do** slide the lime nav pill on hover and active, kill in-flight GSAP tweens, and show a glass tooltip when the rail is collapsed.
- **Do** open offer cards into a wide `glass` preview modal; keep Edit/Delete `stopPropagation`.

### Don't:
- **Don't** restore the violet-conversion Neon Signal Desk (`#080A10` canvas, `#7C3AED` primary CTA, magenta inset nav bar, gradient TD mark).
- **Don't** introduce Inter, Roboto, a serif display, or a light/cream canvas. The build is Plus Jakarta Sans on `#111111`.
- **Don't** sharpen chrome to 2px rectangles or fill working cards with solid lime, violet, cyan, or magenta.
- **Don't** treat emerald / amber / rose as brand fills. Don't treat peach as a primary button fill.
- **Don't** add a second product look for Admin — it uses the same cards, tables, and badges.
- **Don't** seed demo income or restore a demo-preview bypass on the login screen.
- **Don't** put CSS `filter` or backdrop-blur on `PageTransition` or the modal overlay — that was the half-viewport black cut. Dialog-panel Framer blur during open is allowed.
- **Don't** let GSAP pill tweens stack on rapid hover. Don't use a native `title` tooltip for collapsed nav labels.
- **Don't** commit secrets, password hashes, or live account JSON into either design file.
