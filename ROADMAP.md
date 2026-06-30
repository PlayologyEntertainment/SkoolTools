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

### 2.3 Matrix Calculator  *(Numbers)*  ✅ *shipped*
- ✅ **Add / subtract / multiply**, scalar multiply, transpose, and integer
  matrix powers.
- ✅ **Determinant**, **inverse**, **RREF with the row-operation steps shown**,
  rank, trace, and **solve Ax = b**.
- ✅ All arithmetic is **exact over the rationals** (BigInt fractions) with a
  fraction⇄decimal display toggle — no floating-point drift.
- ✅ Workspace autosaves to localStorage and **shares by code** (`#matrix=…`),
  no backend. Linear algebra + AP CS.

### 2.4 Truth Table / Logic  *(Numbers, or future CS group)*  ✅ *shipped*
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

## Phase 3 — New shelves (categories)  ⬜ *not started*

### 3.1 🎯 Test Prep shelf  🔄 *in progress — 4 / 5 shipped*
Curated, deterministic, content-driven — **not** AI. New shelf (`testprep`, neon
crimson). Built easy-wins-first; the last content-heavy applet (AP flashcard
packs) is live in the UI as a `SOON` card while its original-authored content is
built out.

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
- ⬜ AP-aligned **flashcard packs** *(SOON)* — original-authored subject decks +
  pack browser, reusing the Flashcards SRS / share-by-code engine.
- ✅ **Cheat-Sheet Builder** — relocated here from Toolbox (see 2.7); an
  exam-prep tool, it belongs on this shelf.
- *Why:* strongest organic-search growth lever fully inside the HS+college
  audience.

### 3.2 ♿ Accessibility & Focus shelf  🔄 *in progress — 3 / 4 shipped*
Fulfills a11y promises and surfaces them as first-class tools. New shelf —
**Focus** (`a11y`, warm light brown `--brown` `#9F8170`), sequenced above Study.
Built contained-tools-first; the two cross-cutting applets are live in the UI as
`SOON` cards.
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
- ⬜ **Dyslexia-friendly mode** *(SOON)* — Atkinson Hyperlegible (embedded as
  base64 for true offline), wider spacing, 1.8 line height — as a **global
  app-wide toggle** plus a reading surface.
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

### 3.3 (Optional) 💻 CS shelf  ⬜ *not started*
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

| Phase | Theme | Items | Status |
|------|-------|-------|--------|
| **1** | Deepen existing | Calculus, Graphing, Stats, Chem balancer, Periodic trends, Flashcards import/share, Citation autofill, Notes scaffold | ✅ **8 / 8 shipped** |
| 2 | New tools | Concept Map, Lab Report, Matrix, Truth Table, Inequality, Music Theory, Cheat-Sheet | ✅ **7 / 7 shipped** |
| 3 | New shelves | Test Prep, Accessibility & Focus, (optional CS) | 🔄 Test Prep 4 / 5 · A11y & Focus 3 / 4 |

**Status as of 2026-06-30:** Phases 1 and 2 are complete — all eight Phase 1
deepen-items and all seven Phase 2 new tools (through the **Exam Cheat-Sheet
Builder, 2.7**) are shipped. **Phase 3 has begun:** the Test Prep shelf (3.1) is
live with its three self-contained tools — **Score Goal**, **Exam Countdown**, and
**Free-Response Pacer** — shipped easy-wins-first, joined now by the **SAT / ACT
Math Drill**, which uses original parameterized question generators (SAT + ACT
formats, quick and full-timed sections, raw + estimated scaled scoring, and a
worked-solution review). Only **AP flashcard packs** remains a `SOON` card,
pending original-authored content. **Accessibility & Focus (3.2) has begun:** the shelf
is live with **Reading Ruler**, **Read Aloud** (text-to-speech), and the
**Enhanced Focus Lock** — which builds on the original Focus Lock (now removed
from Study) and adds configurable break cycles, offline Web-Audio soundscapes,
and informational session stats. **Dyslexia-friendly mode** remains the one
`SOON` card on this shelf. The optional CS shelf (3.3) has not been started.

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
- **Code Playground** *(Toolbox)* — JS · Python (Pyodide) · HTML. *(The Phase 3.3
  CS shelf would consolidate this with Truth Table, Matrix, and Base Converter.)*
- **Focus Lock** *(originally Study)* — fullscreen, hide tabs, countdown. *(Phase
  3.2's **Enhanced Focus Lock** superseded this: the tool was rebuilt with break
  cycles, soundscapes, and stats and moved to the Focus shelf, and the original
  Study-shelf card was removed.)*
