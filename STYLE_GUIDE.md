# SkoolToolz — Visual Style Guide

> The current, shipped visual direction of the app. **This is the course we are
> holding** — new v2.0 tools must match this, not the older warm-paper brand
> section in `skooltoolz-design-doc.html` (which is now superseded by what's
> below).

The look is a **neon-on-black "glitch-book / graffiti"** aesthetic: a dark desk
under a lamp, lit by highlighter-bright accents, with neo-brutalist hard-offset
shadows. Playful but never childish; sharp typography, restrained motion.

**Source of truth:** the `:root` block and component CSS in `SkoolToolz.html`.
Values below are mirrored from there — if they ever drift, the HTML wins.

---

## 1. Palette

Dark neon. Near-black violet ground; one saturated accent per surface.

| Token | Hex | Role |
|-------|-----|------|
| `--paper` | `#0A0813` | Page — near-black, faint violet |
| `--paper-2` | `#14101F` | Card |
| `--paper-3` | `#1E1830` | Raised surface |
| `--ink` | `#F2EFFA` | Body text — near-white |
| `--ink-2` | `#C7BEDC` | Secondary lavender |
| `--muted` | `#897F9E` | Muted text |
| `--muted-2` | `#4B4460` | Faint / disabled |
| `--rule` | `#F2EFFA1A` | Hairline border |
| `--rule-2` | `#F2EFFA0E` | Fainter hairline |
| `--accent` | `#9A33EA` | **Neon purple — primary** |
| `--accent-soft` | `#9A33EA26` | Purple wash (backgrounds, pulses) |
| `--accent-2` | `#2FE4E4` | Cyan glitch — highlight / focus ring |
| `--accent-3` | `#3DDC97` | Neon mint — pass / success |
| `--accent-4` | `#3AA0F0` | Electric blue |
| `--purple` | `#B98BFF` | Light purple |
| `--purple-deep` | `#8B1FD6` | Deep purple — Numbers emphasis |
| `--pink` | `#FF3D9A` | Pink — Toolbox |
| `--orange` | `#FF8C00` | Orange — Plan |

**Usage rules**
- One saturated accent per screen — like a single highlighter stroke. Don't
  flood a panel with color.
- Pure black is never used for text or ground; ink is `#F2EFFA`, ground is
  `#0A0813`.
- `--accent-2` (cyan) is the **focus / selection** color (`:focus-visible`,
  `::selection`, pin-active).
- `--accent-3` (mint) means **pass / correct / success** only.

### Category colors (per shelf)

Each shelf owns a color, exposed on cards and panels as `--cat-color`. Inside an
open panel, `--accent` is **derived** from the category color so the tool's UI
matches its shelf.

| Shelf | Color token |
|-------|-------------|
| Numbers | `--purple-deep` |
| Lab | `--accent-4` (electric blue) |
| Words | `--accent-3` (mint) |
| Study | `--accent-2` (cyan) |
| Plan | `--orange` |
| Toolbox | `--pink` |

New shelves planned in `ROADMAP.md` need a category color assigned from the
palette (suggested: Test Prep → `--purple`; Accessibility & Focus → reuse
`--accent-3` or a dedicated token).

---

## 2. Typography

Three families, loaded as one personality:

| Family | Token | Use |
|--------|-------|-----|
| **Fraunces** (variable serif) | `--serif` | Display: tool names, headings, splash, any branded moment. Engage the `opsz`, `SOFT`, and `WONK` axes. Accent-colored italics act as a verbal highlighter. |
| **Inter Tight** | `--sans` | Body, UI labels, inputs. Tight tracking keeps dense cards from feeling sparse. Base 16px, line-height 1.55, features `ss01`/`cv11`. |
| **JetBrains Mono** | `--mono` | Calculator/result readouts, formulas, metadata (tags, version, kbd, counts, ribbons). |

**Fraunces axis settings** (display): `font-variation-settings:"opsz" 144,"SOFT" 30,"WONK" 1`; italics push `SOFT` to 100.

**Patterns**
- Headings & tool names: Fraunces 500, negative letter-spacing (~`-.015em`).
- Mono metadata is small, uppercase, wide-tracked (`letter-spacing:.12–.18em`).
- The wordmark **"SkoolToolz"** ends in a period; the `.dot` is cyan
  (`--accent-2`), the italic emphasis is purple (`--accent`).

---

## 3. Shape, border, shadow

Neo-brutalist with soft edges:

- **Radius:** small — 2–4px (cards `3px`, panels `4px`, buttons/badges `2px`).
- **Borders:** 1px hairlines (`--rule`) on cards; `--ink-2` on the open panel.
- **Hard-offset "pop" shadow** is the signature: `4px 4px 0 0 var(--ink)`
  (token `--shadow-pop` also includes a 1px inset). Cards lift to it on hover.
- **Soft depth shadow** for floating surfaces: `--shadow-card`
  (`0 1px 0 #0000004d, 0 18px 40px -22px #00000080`); the open panel uses a
  deeper `0 30px 80px -20px #000000c0`.
- **Page texture:** two faint radial-dot grids (`28px` and `9px`) — a subtle
  "desk surface," never noisy.

---

## 4. Motion

Restrained. One animated moment per interaction; `prefers-reduced-motion` is
fully honored (transitions collapse to short opacity fades).

- **Timing:** 120ms for hovers/active, ~180ms for panel open, longer only on the
  splash intro.
- **Card hover:** `translate(-2px,-2px)` into the hard shadow; `:active` snaps
  back to `translate(0,0)` with no shadow.
- **Result pulse:** `pulse-accent` — a one-shot accent ring on a freshly computed
  result (`box-shadow` 0→3px `--accent-soft`→transparent).
- **Splash:** logo scales/rotates in (`logo-in`), text rises (`fade-up`), then
  the splash fades out.
- Easing: `cubic-bezier(.2,.7,.2,1)` for entrances; `ease` for micro-states.

---

## 5. Components & states

- **Tool card** (`.tool`): `--paper-2` bg, hairline border, min-height 96px,
  Fraunces name + mono-muted description + emoji icon (slightly desaturated,
  `saturate(.85)`). Hover tints the bg toward the category color
  (`color-mix(... 9%, --paper-2)`).
- **Ribbons:** `NEW` (purple), `UPGRADED` (`--accent-4`), and `SOON`
  (greyed, `.tool.soon`) — `SOON` is the public roadmap surface for planned
  tools (see `ROADMAP.md`).
- **Pin:** star button top-right; active pin is cyan (`--accent-2`).
- **Panel:** centered fixed modal (`min(880px,...)`, `.wide` → `1180px`),
  `--paper` body, `--paper-2` header bar, mono "back" affordance. Back button /
  hash URL / scroll restore behavior from v1.0 is unchanged.
- **Copy button:** small mono uppercase chip, top-right of result blocks.
- **Focus ring:** `2px solid var(--accent-2)`, `2px` offset — required on every
  interactive element.

---

## 6. Voice (unchanged from brand)

Plain-spoken, dry, occasionally winking. Never cheerleader-y, never
condescending — talk to a smart sixteen-year-old.

- **On-brand:** *"Many small, smart, sharp tools. No account. No tracker. No
  upsell."*
- **On-brand:** *"Three pomodoros done. Take five — actually take them, the timer
  is rude about it."*
- **Off-brand:** *"🎉 Awesome job studying! You're a superstar! ✨"*

---

## 7. Accessibility (must hold)

- WCAG 2.2 AA contrast for all text/UI pairs on the dark ground.
- Visible focus ring (cyan) on every interactive element; full keyboard reach.
- Semantic HTML; `aria-live` on computed results; panel-open announcements.
- Honor `prefers-reduced-motion`, `prefers-color-scheme`, `forced-colors`.
- Text scales to 200% without clipping; touch targets ≥ 44×44px (calculator
  keys larger).
- A **Dyslexia-friendly mode** (Atkinson Hyperlegible, wider spacing, 1.8 line
  height) is on the roadmap as a global toggle.

---

*Hold this course for v2.0. The warm-paper "Playology Press" palette in the
original design doc is historical; the neon-on-black direction above is the
shipped identity.*
