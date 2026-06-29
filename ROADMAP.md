# SkoolToolz — v2.0 Roadmap

> *Many small, smart, sharp tools. No account. No tracker. No upsell.*

This document plans the **v2.0** expansion of SkoolToolz. v1.0 is shipped: ~39
tools across six shelves (Numbers, Lab, Words, Study, Plan, Toolbox), built as a
single offline-capable HTML file with local-only storage.

v2.0 does **not** change the mission. It deepens the tools students already use,
adds a focused set of new tools, and opens two new shelves — all while holding
the original rails.

---

## Guardrails (non-negotiable)

These constraints are the product. Every item below respects them:

- **AI-free.** No tutors, no generators, no "solve my homework." Every solver is
  deterministic and shows its work so the student learns the method.
- **No accounts, no servers, no tracking.** Local storage only. The single
  "social" feature we allow is **share-by-code** (an encoded string the student
  copies/pastes — no backend).
- **Offline after first load.** Network is never required to use a tool.
- **HS primary, college secondary** (ages ~14–24). No middle-school or
  teacher/parent features in this cycle.
- **Tool-first, integrity-safe.** If a feature mainly helps a student *skip* the
  work or *hide* the site from a teacher, we don't ship it.

### Single-file budget & the "tiny module split"

v1.0 is one `.html` file. v2.0 introduces **lazy-loaded modules** for heavy
tools only:

- The shell + light tools stay inline in the single file (no regression to the
  fast first paint).
- Heavy engines (symbolic calculus, matrix math, expanded charting) load
  **on first open of their host tool**, with a visible loading state, then cache.
- Performance budget holds: **0 network calls before interactive**, **<1s FCP on
  3G**, **100% offline after first load**. A student who never opens the Calculus
  Solver never downloads its engine.

### Shipping planned tools in the UI

The app already supports a **`SOON` ribbon** on tool cards (`.tool.soon`). We use
it as the public roadmap surface: planned tools appear greyed with a `SOON`
badge so students can see what's coming. On release they flip to a `NEW` (or
`UPGRADED`) ribbon for one version cycle.

---

## Phase 1 — Deepen what's already there  *(START HERE — top priority)*

The highest-confidence work. These tools already have traffic; depth maps
directly to real classroom jobs (AP courses, college intro sequences, labs).

### 1.1 Calculus Solver  *(new tool, Numbers shelf — but logically a "deepen")*
The single biggest curricular gap for late-HS (AP Calc AB/BC) and college.
- Symbolic **derivatives** with rule-by-rule steps (power, product, quotient,
  chain, trig, exp/log).
- **Indefinite & definite integrals** with shown substitution / by-parts steps.
- **Limits** (including one-sided and limits at infinity).
- Lazy-loaded symbolic engine; results render via the existing LaTeX path.
- *Why first:* pure show-work, no accounts, closes the loudest gap.

### 1.2 Graphing Calculator → multi-function + tables  ✅ *shipped*
- ✅ Plot multiple functions at once with a value **table** readout.
- ✅ **Derivative overlay** (numeric f′, ties into 1.1) and **area-under-curve**
  shading with a live definite-integral readout (Simpson's rule).
- ✅ **Polar & parametric** modes (segmented plot-type control).
- ✅ Tap-to-read coordinates, root/intersection finding (extend existing canvas).

### 1.3 Statistics Sheet → distributions & regression  ✅ *shipped*
- ✅ **Distribution lookups** (normal, binomial, t) — both directions
  (probability-from-value and inverse / critical value) with a shaded-curve /
  PMF-bar visual. Replaces the printed tables AP Stats students still carry.
- ✅ **Linear regression** with r², **residual plot**, and **prediction** (ŷ for
  a given x, marked on the scatter).
- ✅ Confidence intervals and one/two-sample t-tests — now with a
  one/two-tailed selector and a **CI for the difference of means** (paste-from-
  spreadsheet input already supported).

### 1.4 Chemistry Helpers → balancer & titration  ✅ *shipped*
- ✅ **Equation balancer** via the matrix/null-space method (exact-fraction
  Gaussian elimination), with the atom-count matrix, per-element conservation
  equations, solved coefficients, and atom-balance verification all shown.
- ✅ **Limiting-reagent** walk-through: identifies the limiting reactant, excess
  remaining (mol + g), and theoretical yield of a chosen product. Accepts mol
  or g input.
- ✅ **Acid–base titration** with a plotted **pH-vs-volume curve** (strong/weak
  acid & base), equivalence + half-equivalence markers, equivalence pH, and a
  suggested indicator.
- ✅ Balancer **auto-feeds the Stoichiometry tab** — solved coefficients prefill
  the known/unknown species via one tap.
- ✅ Builds on the existing Moles / Molarity / pH / Gas-law / Stoich modules.

### 1.5 Periodic Table → trend overlays  ✅ *shipped*
- ✅ New **Trends** mode with **heat-map overlays** for electronegativity
  (Pauling), atomic radius (covalent), and first ionization energy — switchable
  via a property selector, with a live color-scale legend (min/max + units).
- ✅ Elements without measured data (noble-gas EN, most synthetics) render as a
  striped "no data" cell rather than a misleading color.
- ✅ Trend-aware detail panel (value, high→low rank, all three properties, and a
  plain-language "increases →, decreases ↓" note); the three properties are also
  surfaced in Browse-mode element details.
- ✅ Data + color scale layered on the existing 118-cell grid; Browse / Electron
  / Quiz modes unchanged.

### 1.6 Flashcards / Vocab → import + share-by-code  ✅ *shipped*
- ✅ **Anki `.csv` import** — reads Anki's `#separator`/`#html` header lines,
  strips HTML, honors the declared delimiter (tab/comma/semicolon/pipe), and
  skips spreadsheet header rows. Plus a **Quizlet / plain-text paste** box with
  selectable term/definition and card separators (auto-detected) and a live
  card-count preview.
- ✅ **Deck share-by-code**: a deck encodes to a compact UTF-8-safe base64url
  string and a matching `#flashcards=…` share link. A friend pastes either under
  Import (or opens the link) to get their own copy. No backend — the only
  sanctioned "social" feature. SRS progress is intentionally not shared.
- ✅ SM-2-lite spaced repetition is surfaced in the UI: the four rating buttons
  show the **projected next interval** each choice schedules, a one-line "SM-2
  lite" explainer appears on flip, and the editor keeps the New/Learning/Review/
  Mature badges and a **Reset SRS** control.

### 1.7 Citation Helper → autofill + annotated mode  ✅ *shipped*
- ✅ **DOI / ISBN autofill** via an explicit, on-demand "Look up" — DOI through
  **Crossref**, ISBN through **Open Library** with a **Google Books** fallback.
  No auto-fetch: the lookup only fires on click, with a one-line disclosure that
  this is the *only* time the tool touches the network. Offline (or no match)
  falls straight back to full manual entry.
- ✅ **Annotated bibliography** mode: build citations and **+ Add to
  bibliography** to a saved, reorderable list (↑/↓, Sort A–Z, Edit, Remove),
  each entry carrying its own annotation note. One shared style applies across
  the whole list; everything persists in localStorage.
- ✅ **Export**: Copy all, download **.md** (annotations as block-quotes) and
  **.txt** (hanging-indent), plus a print-friendly **Print / PDF** view — no
  backend, no account.

### 1.8 Notes / Essay Planner → outline-to-draft scaffolding
- Structural (not AI) scaffold: thesis → topic sentences → evidence slots →
  transition prompts.
- Export to `.md` and print-to-PDF.

**Phase 1 exit criteria:** all eight items shipped; lazy-load path proven on the
Calculus Solver; performance budget re-verified; a11y pass on new UI.

---

## Phase 2 — New tools (within existing shelves)

New standalone tools that fit the current IA. Each is a distinct artifact a
student actually exports or reuses.

### 2.1 Concept Map / Mind Map  *(Study)*
Node-and-edge canvas; drag to arrange; export PNG + JSON. The most-requested
study artifact the app currently lacks.

### 2.2 Lab Report Builder  *(Lab ↔ Words bridge)*
Structured template: hypothesis, materials, procedure, data table (sig-fig
aware, ties into Sig Figs), error analysis. Print/export to PDF.

### 2.3 Matrix Calculator  *(Numbers)*
Add/multiply, determinant, inverse, **RREF with steps**. Linear algebra + AP CS.

### 2.4 Truth Table / Logic  *(Numbers, or future CS group)*
Generate truth tables; evaluate logical expressions. Discrete math, CS, and
philosophy-logic units.

### 2.5 Inequality / Interval Solver  *(Numbers)*
Solve and visualize on a number line; interval & set notation output.

### 2.6 Music Theory Helper  *(Toolbox)*
Scales, intervals, key signatures, metronome. Distinctive, on-brand-playful,
underserved by free tools.

### 2.7 Exam Cheat-Sheet Builder  *(Words/Toolbox)*
Compose a one-page allowed formula sheet from the Formula Reference; print to
PDF. Maps to real exam policies (a permitted, integrity-safe use).

---

## Phase 3 — New shelves (categories)

### 3.1 🎯 Test Prep shelf
Curated, deterministic, content-driven — **not** AI. Reuses the Flashcards and
Math Practice engines.
- SAT / ACT **timed math drill**.
- AP-aligned **flashcard packs** (subject decks).
- **"What score do I need"** (extends Final Grade for standardized exams).
- **Free-response timing trainer**.
- **AP / finals exam-date countdown**.
- *Why:* strongest organic-search growth lever fully inside the HS+college
  audience.

### 3.2 ♿ Accessibility & Focus shelf
Fulfills a11y promises and surfaces them as first-class tools.
- **Dyslexia-friendly mode** (Atkinson Hyperlegible, wider spacing, 1.8 line
  height) as a global toggle + a reading surface.
- **Reading Ruler** and **color overlay** for long passages.
- **Text-to-speech** via the browser `SpeechSynthesis` API (offline, free).
- **Enhanced Focus Lock** (builds on the existing tool).

### 3.3 (Optional) 💻 CS shelf
If we want to consolidate scattered CS tools: Code Playground + Truth Table +
Matrix + Base Converter + a Regex tester, pulled onto one shelf. Lower priority;
revisit after Phase 2.

---

## Explicitly NOT doing (holds the line)

- AI tutor / essay feedback / answer generation.
- Accounts or cloud sync (share-by-code is the only exception).
- Gamification, streaks, badges, engagement loops.
- Anything designed to hide the site from a supervising adult.
- Middle-school or teacher/parent/gradebook features (out of audience scope).

---

## Sequencing summary

| Phase | Theme | Items | Priority |
|------|-------|-------|----------|
| **1** | Deepen existing | Calculus, Graphing, Stats, Chem balancer, Periodic trends, Flashcards import/share, Citation autofill, Notes scaffold | **Now** |
| 2 | New tools | Concept Map, Lab Report, Matrix, Truth Table, Inequality, Music Theory, Cheat-Sheet | Next |
| 3 | New shelves | Test Prep, Accessibility & Focus, (optional CS) | After |

**Visual direction for all of the above:** see `STYLE_GUIDE.md`. Hold the current
neon-on-black "glitch-book" course — no aesthetic changes in v2.0.
