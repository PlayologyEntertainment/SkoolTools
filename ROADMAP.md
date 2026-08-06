# SkoolToolz — Roadmap

> *Many small, smart, sharp tools. No account. No tracker. No upsell.*

This document tracks SkoolToolz's full build history and active plan. v1.0
launched with ~39 tools across six shelves (Numbers, Lab, Words, Study, Plan,
Toolbox), built as a single offline-capable HTML file with local-only
storage. **v2.0 (Phases 1–3 below) shipped 2026-07-01**, growing that to 55
tools across nine shelves — adding Test Prep, Focus (Accessibility), and Code
— while keeping the single-file, local-only architecture.

Work didn't stop at the v2.0 mark: a handful of tools and fixes shipped
ad hoc afterward without ever being scoped in this document (see **"Shipped
since v2.0"** near the bottom). The app runs **59 tools across nine shelves**
as of this update (57 ad hoc + the AP Psychology tool and the Algebra Solver,
Phase 4's first two scoped-and-shipped items) — **Phase 4 is where that ad
hoc pattern stops:** every new tool from here forward gets scoped,
prioritized, and checked off in this doc before it ships, the same
discipline Phases 1–3 held.

**Current cycle scope:** Phase 4 (new tools/features) is the active,
in-scope work. Two adjacent tracks are deliberately **not** part of this
cycle:
- **Mobile app port** (`MOBILE_PLAN.md`) — queued to start **after** Phase 4
  reaches a satisfying stopping point, not concurrently with it.
- **Growth/marketing** (`GROWTH_PLAN.md`) — sidelined; the sprint hasn't been
  run and isn't a current priority.

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

**Under early exploration, not committed:** optional Google OAuth for
cross-device saves. If it ever ships, it would be additive/opt-in — local
storage stays the default and share-by-code stays the no-backend fallback —
and it gets its own scoped plan and a dedicated privacy review before any
code is written. **Nothing in Phase 4 below depends on it or assumes it
ships.**

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

### 1.1 Calculus Solver  *(new tool, Numbers shelf — but logically a "deepen")*  ✅ *shipped*
The single biggest curricular gap for late-HS (AP Calc AB/BC) and college.
- ✅ Symbolic **derivatives** with rule-by-rule steps (power, product, quotient,
  chain, trig, exp/log).
- ✅ **Indefinite & definite integrals** with shown work — linear & general
  u-substitution and by-parts steps, standard-table antiderivatives, and a
  Simpson's-rule numeric fallback for definite integrals that lack a closed form.
- ✅ **Limits** with direct-substitution and indeterminate-form handling,
  including one-sided (left/right) limits and limits at ±∞.
- ✅ Lazy-loaded symbolic engine (`calculus-engine.js`, fetched via `<script>` on
  first open so it also works from a local `file://` copy, then cached); results
  render through the shared KaTeX/LaTeX path.
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

### 1.8 Notes / Essay Planner → outline-to-draft scaffolding  ✅ *shipped*
- ✅ Structural (not AI) **Scaffold** tab: hook + context → body paragraphs, each
  with a **transition prompt**, **topic sentence**, and repeatable **evidence
  slots** (quote → source → analysis) → restatement + closing. Nothing is
  generated for the student — the tool only frames the skeleton they fill in.
- ✅ **Transition-prompt suggestions** tuned to the essay type (argumentative /
  expository / analytical / narrative).
- ✅ Companion **Thesis · Outline · Sources · Draft · Checklist** tabs, with a live
  word-goal counter on a pasted draft and a copyable outline / source list.
- ✅ **Export to `.md`** (full plan *or* draft skeleton) and **print-to-PDF**
  (full plan or draft skeleton); everything autosaves to localStorage.

**Phase 1 exit criteria:** ✅ all eight items shipped; ✅ lazy-load path proven on
the Calculus Solver; performance budget re-verified; a11y pass on new UI.

---

## Phase 2 — New tools (within existing shelves)

New standalone tools that fit the current IA. Each is a distinct artifact a
student actually exports or reuses.

### 2.1 Concept Map / Mind Map  *(Study)*  ✅ *shipped*
- ✅ **Node-and-edge canvas** (SVG for interaction): add nodes, drag to arrange,
  connect with edges, edit/recolor, with fit-to-view.
- ✅ **Multiple maps** kept side by side and persisted in localStorage.
- ✅ **Export PNG** (dark / white / transparent backgrounds, rendered via
  Canvas-2D) and **export / import JSON**.
- ✅ **Share-by-code** (`#mindmap=…` code + link, no backend) — paste a code or
  link to import a map as a new copy.

### 2.2 Lab Report Builder  *(Lab ↔ Words bridge)*  ✅ *shipped*
- ✅ Full standard template: title/info (name, partners, course, instructor,
  section, date), Purpose, Hypothesis, Materials, Procedure, Data Table,
  Sample Calculations, Error Analysis, Conclusion, References.
- ✅ **Sig-fig-aware data table** with **computed columns**: type a formula
  (e.g. `B/C`) referencing other columns by letter and the column auto-evaluates
  per row. A small no-`eval` recursive-descent parser handles `+ - * / ^`,
  parentheses, and `sqrt/ln/log/sin/…`/`pi`. Each column carries a sig-fig
  setting; computed columns round to it, and **`auto`** rounds to the fewest sig
  figs of its inputs (reusing the Sig Figs count/round logic). `#REF`/`#ERR`/
  `#CYC` flags surface bad references, parse errors, and cycles.
- ✅ **Print / PDF** (clean document view), **.md / .txt export** (the data
  table renders as a Markdown / aligned-text table), **localStorage autosave**,
  and **share-by-code** (`#labreport=…` code + link, no backend).

### 2.3 Matrix Calculator  *(shipped on Numbers; consolidated onto Code shelf in 3.3)*  ✅ *shipped*
- ✅ **Add / subtract / multiply**, scalar multiply, transpose, and integer
  matrix powers.
- ✅ **Determinant**, **inverse**, **RREF with the row-operation steps shown**,
  rank, trace, and **solve Ax = b**.
- ✅ All arithmetic is **exact over the rationals** (BigInt fractions) with a
  fraction⇄decimal display toggle — no floating-point drift.
- ✅ Workspace autosaves to localStorage and **shares by code** (`#matrix=…`),
  no backend. Linear algebra + AP CS.

### 2.4 Truth Table / Logic  *(shipped on Numbers; consolidated onto Code shelf in 3.3)*  ✅ *shipped*
- ✅ **Expression parser** with no `eval` — a hand-written tokenizer +
  precedence-climbing parser builds an AST. Accepts every common notation
  interchangeably: words (`AND OR NOT XOR NAND NOR XNOR IMPLIES IFF`), logic
  symbols (`∧ ∨ ¬ ⊕ → ↔ ↑ ↓`), programming (`&& || ! ^`), and ASCII shorthand
  (`& | ~ -> <->`), plus digital-logic postfix complement (`A'`). A clickable
  **symbol palette** inserts operators at the caret.
- ✅ **Full truth table** with **subexpression columns** (each distinct
  sub-formula gets its own column, simple → full, with the root column
  highlighted), a fraction-free `T/F`↔`1/0` toggle, and standard
  all-true-at-top row ordering. **Classifies** the expression as tautology /
  contradiction / contingent with a true-row count.
- ✅ **Normal forms** derived from the table: **DNF** (sum of products /
  minterms) and **CNF** (product of sums / maxterms), each copyable.
- ✅ **Equivalence checker**: enter a second expression and it reports whether
  the two are logically equivalent across the union of their variables, naming
  the first differing assignment when they aren't.
- ✅ **Print-free workflow**: localStorage autosave, copy-as-TSV table, and
  **share-by-code** (`#truthtable=…` code + link, no backend). Discrete math,
  CS, and philosophy-logic units.

### 2.5 Inequality / Interval Solver  *(Numbers)*  ✅ *shipped*
- ✅ Solve **linear, compound, absolute-value, polynomial, and rational**
  inequalities in one variable and **visualize the solution on a number line**.
- ✅ Output in **interval, set-builder, and inequality** notation (each copyable).
- ✅ A second **interval / set algebra** tab (union, intersection, complement,
  difference) sharing the same number-line view.
- ✅ **No `eval`:** a hand-written tokenizer + recursive-descent parser build an
  AST, then exact-fraction polynomial/rational arithmetic drives a sign-chart
  solver. Autosaves to localStorage and **shares by code** (`#inequality=…`).

### 2.6 Music Theory Helper  *(Toolbox)*  ✅ *shipped*
Distinctive, on-brand-playful, underserved by free tools. Five tabs, all
deterministic and offline:
- ✅ **Scales** — major, the seven modes, harmonic/melodic minor, major/minor
  pentatonic, blues, and whole-tone built from any root, with **correct
  enharmonic spelling** (each diatonic degree keeps its own letter; accidentals
  are derived), scale-degree labels, and the whole/half **step pattern**.
- ✅ **Intervals** — name the interval between two notes (quality + number +
  semitone count, ascending/descending) *and* build any interval up or down
  from a note, with quality options gated to the interval number.
- ✅ **Chords** — spell triads, suspended, 6th and 7th chords from a root +
  quality, plus a **chord identifier** that names a set of notes (with
  inversion) by matching pitch-class sets across every root.
- ✅ **Keys** — key signature (sharps/flats in order), relative + parallel key,
  and an **interactive Circle of Fifths** (click any major/minor key to load it).
- ✅ **Metronome** — Web-Audio click with accented downbeat, adjustable BPM +
  tempo name, time-signature beat dots, and **tap-tempo**. A lookahead scheduler
  keeps timing tight; audio is torn down on panel close.
- ✅ Notes render on an **SVG staff** (treble / bass clef toggle, ledger lines,
  accidentals); a small triangle-wave synth plays scales/chords/keys.
- ✅ Autosaves to localStorage and **shares by code** (`#music=…`), no backend.

### 2.7 Exam Cheat-Sheet Builder  *(Test Prep — moved from Toolbox)*  ✅ *shipped*
Compose a one-page allowed formula sheet, then print to PDF. Maps to real exam
policies (a permitted, integrity-safe use).
- ✅ Builds from the **shared Formula Reference library** (lifted to module scope
  as `FREF_FORMULAS` so the Reference and the Builder are one source of truth)
  **plus the student's own custom formulas / notes** — searchable, category-
  filterable, checkbox-picked.
- ✅ **One-tap subject presets** (Algebra, Geometry, Trig, AP Calc, AP Physics,
  Chemistry, AP Stats) bulk-select a sensible set you then trim.
- ✅ **Full layout controls** on a live WYSIWYG paper preview: sheet title,
  course/exam label, **1/2/3 columns**, **compact/normal/roomy** density,
  **Letter/A4** page size, **portrait/landscape**, and show/hide notes &
  variables. Formulas render through the shared lazy-loaded KaTeX path (raw-text
  fallback offline).
- ✅ **Print / PDF** (the preview *is* the print artifact, sized via a dynamic
  `@page` rule), **.md export**, **localStorage autosave**, and **share-by-code**
  (`#cheatsheet=…` code + link, no backend).

---

## Phase 3 — New shelves (categories)  ✅ *complete*

### 3.1 🎯 Test Prep shelf  ✅ *complete — 5 / 5 shipped*
Curated, deterministic, content-driven — **not** AI. New shelf (`testprep`, neon
crimson). Built easy-wins-first; the last content-heavy applet (AP flashcard
packs) shipped with its original-authored deck library, completing the shelf.

- ✅ **Score Goal** *(was "What score do I need")* — reverse-engineers the SAT,
  ACT, or AP score you still need. SAT solves the missing 200–800 section from a
  target total (with a superscore note); ACT solves the score needed on each
  remaining 1–36 section for a target composite (rounding-aware); AP solves the
  free-response % needed to clear an editable cut-score band from a weighted
  multiple-choice score. Pure arithmetic, nothing leaves the device.
- ✅ **Exam Countdown** — counts down to every exam. Bundled official **AP
  administration window is *computed*** from the standard first-two-full-weeks-of-
  May rule (auto-rolls to the next upcoming cycle, so it never goes stale) and the
  student adds their own finals / test dates (AP-subject autocomplete). Colour-
  coded urgency (≤7d red, ≤30d amber), hide-past toggle, localStorage only.
- ✅ **Free-Response Pacer** *(was "free-response timing trainer")* — multi-phase
  pacing timer with editable per-question budgets and subject presets (AP Calc,
  Bio, APUSH DBQ+LEQ, English). Big countdown, overall-time readout, progress bar,
  phase overview, Web-Audio beep at each transition, pause / next / reset.
- ✅ SAT / ACT **timed math drill** — original **parameterized question
  generators** (fresh numbers every run, never a fixed bank) across four
  domains: Heart of Algebra, Problem Solving & Data, Advanced Math, and
  Geometry & Trig. Both **SAT** (4-choice multiple choice **+ grid-in /
  student-produced response**) and **ACT** (5-choice) formats, with **quick
  drills** (5–20 questions, optional test-pace timer) and **full timed
  sections** (SAT 22 Q / 35 min · ACT 60 Q / 60 min, Web-Audio time's-up beep).
  Scores show both **raw count** and a clearly-labeled **estimated scaled
  score** (SAT 200–800 / ACT 1–36), a per-topic breakdown, and a full
  **wrong-answer review** with shown-work solutions rendered through the shared
  KaTeX path. Real test questions are copyrighted, so every question is built to
  match the style and difficulty — nothing is copied. Config persists to
  localStorage; nothing leaves the device.
- ✅ AP-aligned **flashcard packs** — **13 original-authored subject decks**
  (~449 term→definition cards) across Sciences (Biology, Chemistry, Physics 1,
  Environmental Science), History & Social Science (US/World/European History,
  Psychology, Human Geography, US Gov), and Math & CS (Calculus AB/BC,
  Statistics, CS Principles). A grouped **pack browser** opens each deck into an
  **in-tool study view** running the same **SM-2-lite** scheduler as Flashcards
  (per-pack progress in `appacks:v1`, due counts on each card). Every pack can be
  **copied into the student's own Flashcards** (`flashcards:v2`) to edit/mix, or
  **shared by code** via the Flashcards-compatible `#flashcards=…` string/link —
  reusing the Flashcards SRS / share-by-code engine, no backend. All content is
  original to SkoolToolz (nothing copied from the exam); the deck library is a
  **lazy-loaded module** (`ap-packs.js`, fetched on first open, then cached) so
  the single-file fast-paint budget holds.
- ✅ **Cheat-Sheet Builder** — relocated here from Toolbox (see 2.7); an
  exam-prep tool, it belongs on this shelf.
- *Why:* strongest organic-search growth lever fully inside the HS+college
  audience.

### 3.2 ♿ Accessibility & Focus shelf  ✅ *complete — 4 / 4 shipped*
Fulfills a11y promises and surfaces them as first-class tools. New shelf —
**Focus** (`a11y`, warm light brown `--brown` `#9F8170`), sequenced above Study.
Built contained-tools-first; all four tools — including the cross-cutting
**Dyslexia-friendly mode** — now ship.
- ✅ **Reading Ruler** — paste a passage and read it on a calmer, **tinted
  surface** (7 Irlen-style background tints) with a movable **reading ruler /
  typoscope**: a clear band that follows the pointer (or ↑/↓ keys) and dims
  everything above and below. Adjustable text size, line spacing, ruler height,
  and a high-legibility "readable font" toggle. Pure DOM/CSS, no network;
  settings persist in localStorage.
- ✅ **Read Aloud** *(text-to-speech)* — speaks any pasted text via the browser
  `SpeechSynthesis` API (offline, free, nothing leaves the device). Voice
  picker, speed + pitch controls, play / pause / resume / stop, and **live
  word highlighting** driven by `boundary` events. Degrades gracefully where
  voices or boundary events are unavailable.
- ✅ **Dyslexia-friendly mode** — **Atkinson Hyperlegible embedded as base64**
  (latin regular / bold / italic via `@font-face`, no network) drives a **global
  app-wide toggle**: flipping it on adds `.dys` to `<html>`, which swaps the
  `--sans` / `--serif` type to Atkinson everywhere and opens up line height (1.8)
  and letter / word spacing — monospace (code / math) is left untouched. Three
  live, persisted sliders tune line height + letter / word spacing, with a
  reading-surface **preview** (showing all three faces) that renders even while
  the mode is off. State persists in localStorage and is re-applied at boot
  (no flash). Also fixes the Reading Ruler's "readable font", which referenced
  Atkinson but had no face to load.
- ✅ **Enhanced Focus Lock** — builds on the original Study-shelf Focus Lock,
  which has now **moved onto this shelf** (and been removed from Study). Adds
  **configurable work/break cycles** (25/5 · 50/10 · 90/15 presets + custom work,
  short-break, long-break, and a long break after *N* rounds, with auto-continue),
  filled **round dots** and a phase-aware countdown/overlay; offline
  **soundscapes** synthesised live with the Web Audio API (white / pink / brown
  noise, plus filtered **rain** and a slow-swell **ocean**) with a volume control,
  playing only during focus; and plain **session stats** (focus time today + this
  week, blocks and tasks this week, average block length) — informational only,
  no streaks or badges, resettable, localStorage. Keeps the v1 fullscreen lock
  (Esc now exits fullscreen without closing the tool).

### 3.3 💻 Code shelf  ✅ *complete — 5 / 5 shipped*
Consolidated the scattered CS tools onto their own shelf (`code`, amber),
seated between Lab and Toolbox.
- ✅ **Code Playground** — moved here from Toolbox (JS · Python via Pyodide ·
  HTML), unchanged.
- ✅ **Truth Table / Logic** — moved here from Numbers (see 2.4), unchanged.
- ✅ **Matrix Calculator** — moved here from Numbers (see 2.3), unchanged.
- ✅ **Base Converter** — moved here from Numbers; binary/octal/decimal/hex plus
  an arbitrary base (2–36), live two-way sync across fields.
- ✅ **Regex Tester** *(new tool)* — pattern + flag picker (`g i m s u y` with
  inline explanations), live match highlighting and count, capture-group
  breakdown, and a replacement-string preview (`$1`, `$&`, `$<name>`)  —
  no `eval`, pure `RegExp`.
- *Result:* consolidating these four tools plus the new Regex Tester gives
  the Code shelf real weight (discrete math, linear algebra, intro CS/dev
  work) without duplicating anything already covered elsewhere.

---

## Phase 4 — New subject coverage  📝 *planned, not started — active cycle*

Scoped to **new tools and features only.** Same guardrails as Phases 1–3
apply in full (AI-free, no accounts, HS-primary/college-secondary, tool-first
— see the OAuth exploration note above for the one thing under review).

Priorities are ordered by **curricular gap × competitive gap** — where a
student currently has to leave SkoolToolz (for Symbolab, a subject-specific
Quizlet deck, or nothing at all) for something the guardrails would let us
build ourselves, deterministic and show-work.

### Tier A — top priority, start here

#### 4.1 Algebra / Equation Solver  *(new tool, Numbers shelf)*  ✅ *shipped*
The single biggest remaining gap versus Symbolab/Mathway-style competitors —
"solve for x" is their highest-traffic use case, and SkoolToolz has no
general-purpose equation solver today (Calculus Solver covers derivatives/
integrals/limits; Inequality Solver covers inequalities; nothing solves a
plain equation).
- ✅ **Linear** tab — solves any equation that simplifies to linear, with
  distribution, fractions, and nested parentheses handled by the parser
  (not just `ax+b=cx+d` coefficient boxes). Identity (`0=0`, infinitely many
  solutions) and contradiction (no solution) cases are detected and called
  out rather than silently mis-answered.
- ✅ **Quadratic** tab — shows the **quadratic formula**, **completing the
  square**, *and* a **verified factoring** every time they apply (not just
  one method): factoring only renders when the re-expanded factored form is
  checked to exactly match the original equation, so a shaky derivation
  never reaches the screen. Handles rational, irrational (simplified
  radical), and complex (`a ± bi`) roots. An equation that turns out to be
  degree ≤1 still solves correctly with a note, rather than erroring.
- ✅ **Systems** tab — 2×2 and 3×3 linear systems, with **both substitution
  and elimination shown fully worked**, side by side. Detects inconsistent
  (no solution) and dependent (infinitely many solutions) systems.
- ✅ **Polynomial** tab — degree ≤4, via the **Rational Root Theorem +
  synthetic division** (tableau shown per tested root), cascading down to
  the quadratic formula for the final degree-2 factor, with a numeric
  bisection fallback clearly labeled as an approximation when no more
  rational roots remain.
- ✅ Exact **BigInt-fraction arithmetic** throughout (no floating-point
  drift) and a no-`eval` tokenizer/recursive-descent parser, reusing the
  pattern proven in the Inequality Solver; steps render through the shared
  KaTeX path proven in the Calculus Solver. Autosaves to localStorage and
  **shares by code** (`#algebra=…`), no backend.
- ✅ Engine lives in a **lazy-loaded module** (`algebra-engine.js`, fetched
  via `<script>` on first open so it also works from a local `file://`
  copy, then cached) so the single-file fast-paint budget holds.
- *Why first:* pure show-work, no accounts, closes the loudest and most
  commonly searched-for gap.

#### 4.2 AP Psychology tool  *(new tool, Words shelf)*  ✅ *shipped*
Flashcards already cover AP Psych vocabulary (one of the 13 existing AP
packs); this is the **interactive companion** the cards don't provide,
matching the reference-plus-practice pattern of Chemistry Helpers / Periodic
Table rather than duplicating Flashcards.
- ✅ **Research Methods practice** — parameterized scenario generators (fresh
  researcher/setting/number details every question, mirroring the SAT/ACT
  Math Drill's generator pattern) across four categories: IV/DV
  identification, research-design classification (experiment / correlational
  / case study / naturalistic observation / survey / longitudinal /
  cross-sectional), validity threats (confound, placebo effect, experimenter
  bias, demand characteristics, social desirability bias, sampling bias,
  order effects), and ethics guidelines — the FRQ topic students consistently
  miss most. Multiple-choice with immediate feedback + explanation,
  per-category toggles, and a running score.
- ✅ **Psych Stats reference** — a z-score mini-calculator (z = (x−μ)/σ), a
  correlation strength/direction table using the **same |r| thresholds as
  Statistics Sheet's Regression tab**, an **"Open Statistics Sheet"** button
  for the full distribution lookup, and original reference content for
  reliability (test–retest, split-half, inter-rater) vs. validity (content,
  criterion, construct) — psychometrics Statistics Sheet doesn't cover.
- ✅ **Perspectives & theorists reference** — the 7 major perspectives
  (biological, behavioral, psychodynamic, humanistic, cognitive,
  sociocultural, evolutionary) each with their associated theorists/studies,
  plus additional frequently tested figures (Harlow, Ainsworth, Kohlberg,
  Zimbardo, Bandura, Baumrind) — with a **self-check matching quiz** (read a
  contribution, pick the theorist).
- ✅ **Disorders & treatments reference table** — 21 DSM-5-aligned disorders
  (including narcissistic personality disorder, added post-ship) across 10
  categories (anxiety, OCD-related, trauma/stressor, depressive, bipolar,
  schizophrenia spectrum, dissociative, feeding/eating, personality,
  neurodevelopmental) with symptoms and linked treatment approaches
  (psychodynamic, humanistic, behavioral, cognitive, CBT, biomedical),
  searchable and filterable by category. Treatment chips are tappable
  (expand an inline blurb — works on touch, not just hover) and the tab
  includes a collapsible **Treatment approaches reference** table listing
  all six approaches on their own.
- ✅ Original-authored content only, same integrity bar as the AP Flashcard
  Packs — nothing lifted from the exam. Content lives in a **lazy-loaded
  module** (`ap-psych.js`, fetched on first open via the same `<script>`-tag
  pattern as `ap-packs.js`, then cached) so the single-file fast-paint budget
  holds.

#### 4.3 Genetics / Punnett Square Solver  *(new tool, Lab shelf)*
AP Biology's most FRQ-heavy topic has zero coverage today (Chemistry
Helpers, Physics Solver, and Periodic Table cover the rest of the sciences;
nothing covers genetics).
- Monohybrid and dihybrid crosses, sex-linked traits, and basic pedigree
  analysis — the cross grid and resulting genotype/phenotype ratios shown as
  work, not just a final answer.
- A chi-square goodness-of-fit tie-in for expected-vs-observed ratios,
  reusing the Statistics Sheet's distribution engine.

#### 4.4 Personal Finance Toolkit  *(new tool, Toolbox shelf)*
Underserved by every adjacent competitor (Symbolab/Quizlet/Photomath don't
touch it) and increasingly a **required HS course** in many states — squarely
in-audience and useful past graduation, which fits the brand's practical
streak (GPA Calculator, Schedule Builder).
- Compound interest, loan amortization, and credit-card interest
  calculators — each shows the formula and schedule, not just a number.
- A simple budget builder (income vs. categorized expenses) and a
  paycheck/withholding estimator.
- Calculators only — no investment advice or product recommendations,
  consistent with "shows its work, doesn't tell you what to do."

### Tier B — strong candidates, sequence after Tier A

#### 4.5 Economics Toolkit  *(new tool, shelf TBD — likely Numbers)*
AP Micro/Macro have no coverage at all today.
- Supply-and-demand curve grapher with equilibrium price/quantity,
  surplus/shortage shading, and shift analysis — reuses the Graphing
  Calculator's canvas patterns.
- Elasticity, GDP components, inflation (CPI), and unemployment-rate
  calculators, each with the formula shown.

#### 4.6 AP English Language & Literature tool  *(new tool, Words shelf)*
The Words shelf is essay-mechanics-heavy (Essay Planner, Citation Helper,
Grammar & Spellcheck) but has nothing for the literature/rhetoric side of
AP Lang/Lit.
- Rhetorical devices and literary terms glossary with a self-check quiz.
- Structural close-reading scaffolding (annotate-by-prompt, not
  AI-generated) in the same non-generative spirit as the Essay Planner's
  Scaffold tab.

#### 4.7 Physics Solver → AP Physics C mode  *(deepen, Lab shelf)*
The existing Physics Solver reads as algebra-based (Physics 1/2 style).
AP Physics C is calculus-based mechanics and E&M — add a mode that ties into
the Calculus Solver for derivative/integral-based kinematics and
circuit/field equations.

#### 4.8 US Government / Civics reference tool  *(deepen, Test Prep or Lab shelf)*
AP Gov has a flashcard pack but no interactive tool. A Constitution /
landmark-Supreme-Court-case / checks-and-balances reference with a
self-check quiz would match the AP Psych tool's pattern (4.2).

### Tier C — later / lower confidence, revisit after Tier A+B

#### 4.9 Music Theory Helper → AP Music Theory alignment  *(deepen)*
Interval/chord dictation and basic part-writing practice, aligned to the
actual AP Music Theory exam sections. Niche audience — sequence only once
Tier A/B create bandwidth.

#### 4.10 AP Computer Science A (Java) — feasibility check only
Code Playground runs JS · Python (Pyodide) · HTML today; adding Java would
need a browser-side JVM (e.g. a WASM JVM), meaningfully heavier than
anything else on this list. **Investigate feasibility before committing a
real phase item** — don't scope build work until there's a proof-of-concept
that respects the offline/lazy-load performance budget.

#### 4.11 Foreign-language AP deepening (Spanish/French)  *(deepen Language Drill)*
High content cost per language for uncertain lift over the existing generic
drill. Revisit if specific user feedback asks for it.

**Phase 4 exit criteria:** Tier A (4.1–4.4) shipped, a11y-passed, and
performance-budget-verified — the same bar Phase 1 held. Tier B and Tier C
are not committed; promote items individually as Tier A clears, the same way
Phase 4 itself was just promoted from an unscoped placeholder.

---

## Phase 5 — Mobile app port  ⏸ *queued, starts after Phase 4*

Full plan lives in `MOBILE_PLAN.md` (Capacitor wrapper, Android + iOS,
~2–4 weeks to first submission once started). **Deliberately sequenced
after Phase 4**, not concurrent with it — the new-tool work above ships
first. Nothing here is scheduled yet; treat `MOBILE_PLAN.md`'s "Still open"
section (bundle ID) as the one decision to lock before kickoff.

---

## Explicitly NOT doing (holds the line)

- AI tutor / essay feedback / answer generation.
- Accounts or cloud sync (share-by-code is the only exception; see the
  guardrails section above for the one thing under early, uncommitted
  exploration — optional Google OAuth for saves).
- Gamification, streaks, badges, engagement loops.
- Anything designed to hide the site from a supervising adult.
- Middle-school or teacher/parent/gradebook features (out of audience scope).

---

## Sequencing summary

| Phase | Theme | Items | Status |
|------|-------|-------|--------|
| **1** | Deepen existing | Calculus, Graphing, Stats, Chem balancer, Periodic trends, Flashcards import/share, Citation autofill, Notes scaffold | ✅ **8 / 8 shipped** |
| 2 | New tools | Concept Map, Lab Report, Matrix, Truth Table, Inequality, Music Theory, Cheat-Sheet | ✅ **7 / 7 shipped** |
| 3 | New shelves | Test Prep, Accessibility & Focus, Code | ✅ **3 / 3 shipped** — Test Prep 5/5 · A11y & Focus 4/4 · Code 5/5 |
| — | *(ad hoc, untracked)* | SAT/ACT Reading & Writing Drill, Extracurricular Journal, Schedule Builder upgrades, Privacy/Terms pages, GoatCounter analytics, Send Feedback, Help section | ✅ shipped 2026-07 → 2026-08, see "Shipped since v2.0" below |
| **4** | New subject coverage *(active cycle)* | Tier A: Algebra Solver, AP Psych tool, Genetics Solver, Personal Finance · Tier B: Economics, AP English Lang/Lit, Physics C, Civics · Tier C: AP Music Theory, AP CS A (Java, feasibility only), foreign-language deepening | 📝 **2 / 11 shipped** — Algebra Solver (4.1) and AP Psych tool (4.2) done; 4.3, 4.4 next |
| 5 | Mobile app port | Capacitor · Android + iOS (`MOBILE_PLAN.md`) | ⏸ queued after Phase 4 |
| — | Growth/marketing | Zero-dollar sprint (`GROWTH_PLAN.md`) | ⏸ sidelined, not run |

**Status as of 2026-07-01: v2.0 is complete.** All eight Phase 1 deepen-items
and all seven Phase 2 new tools (through the **Exam Cheat-Sheet Builder, 2.7**)
are shipped, and **Phase 3's three new shelves are all complete:**
- **Test Prep (3.1, 5/5)** — **Score Goal**, **Exam Countdown**,
  **Free-Response Pacer**, the **SAT / ACT Math Drill** (original parameterized
  generators, SAT + ACT formats, quick and full-timed sections, raw +
  estimated scaled scoring, worked-solution review), and the **AP Flashcard
  Packs** (13 original-authored AP subject decks, ~449 cards, grouped pack
  browser with in-tool SM-2-lite study, copy-into-Flashcards, and
  Flashcards-compatible share codes, deck library lazy-loaded from
  `ap-packs.js`).
- **Accessibility & Focus (3.2, 4/4)** — **Reading Ruler**, **Read Aloud**
  (text-to-speech), the **Enhanced Focus Lock** (builds on the original Focus
  Lock, now removed from Study, adding configurable break cycles, offline
  Web-Audio soundscapes, and informational session stats), and the
  **Dyslexia-friendly mode** (a global app-wide toggle backed by an embedded
  base64 Atkinson Hyperlegible font, with live persisted controls and a
  preview).
- **Code (3.3, 5/5)** — **Code Playground**, **Truth Table**, **Matrix
  Calculator**, and **Base Converter** consolidated from their old shelves
  onto the new amber Code shelf, joined by a new **Regex Tester**.

v2.0 (Phases 1–3) shipped **55 tools across nine shelves** (Numbers, Lab,
Words, Study, Plan, Toolbox, Test Prep, Focus, Code). Nothing in the app is a
`SOON`-ribbon placeholder — every registered tool is fully built and live.
The app has since grown to **57 tools** via the ad hoc additions listed
above and detailed in **"Shipped since v2.0"** below; **Phase 4 (above) is
now the active, scoped plan** for everything after that.

**Visual direction for all of the above:** see `STYLE_GUIDE.md`. Hold the current
neon-on-black "glitch-book" course — no aesthetic changes in v2.0.

---

## Shipped beyond this roadmap (v1.0 tools not tracked above)

The v2.0 roadmap only enumerates the tools it *changes*. For completeness, these
tools already ship in the app and are **part of the v1.0 baseline** (they predate
this roadmap, which the intro counts as "~39 tools across six shelves"). They are
not Phase 1–3 work — listed here only so the doc reflects everything that's live:

- **Vocabulary Builder** *(Words)* — word lists with SRS quizzing.
- **Language Drill** *(Words)* — conjugation + vocab trainer.
- **Grammar & Spellcheck** *(Words)* — offline spelling/grammar/style checks.
- **Assignments & Planner** *(Plan)* — due dates, classes, checkboxes.
- **Schedule Builder** *(Plan)* — weekly class & period grid.
- **Code Playground** *(now Code shelf)* — JS · Python (Pyodide) · HTML;
  originally on Toolbox, moved when Phase 3.3 consolidated it with Truth Table,
  Matrix Calculator, and Base Converter onto the new Code shelf.
- **Focus Lock** *(originally Study)* — fullscreen, hide tabs, countdown. *(Phase
  3.2's **Enhanced Focus Lock** superseded this: the tool was rebuilt with break
  cycles, soundscapes, and stats and moved to the Focus shelf, and the original
  Study-shelf card was removed.)*

---

## Shipped since v2.0 (2026-07-01 → today, previously untracked)

Between the v2.0 "complete" mark and this update, these shipped without ever
being scoped in this document. Recorded here for accuracy — they're **not**
Phase 4 work, they're why Phase 4 exists as a discipline going forward:

- **SAT / ACT Reading & Writing Drill** *(Test Prep)* — added to the Test
  Prep shelf alongside the existing Math Drill.
- **Extracurricular Journal** *(Toolbox)* — new applet.
- **Schedule Builder + GPA Calculator improvements** — class times, alternate
  schedules, shared Class List.
- **Privacy Policy and Terms of Service pages** (`privacy.html`, `terms.html`).
- **GoatCounter analytics** — cookieless, no-PII pageview counter added to
  `SkoolToolz.html`.
- **Send Feedback button** and a **Help section** added to the toolbar.
- Assorted fixes: Read Aloud pause/stop reliability, Recent-badge sizing,
  Numbers/Words shelf applet ordering.

This is also why the tool count moved from v2.0's **55** to today's **57**
(Reading & Writing Drill + Extracurricular Journal).
