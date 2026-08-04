# SkoolToolz Growth Plan — 1,000 Tries at $0

> **Status: sidelined.** Not currently a priority — the sprint below hasn't
> been run. Product/new-tool work (`ROADMAP.md` Phase 4) is the active focus;
> this plan is kept as reference for whenever growth becomes the priority
> again.

> Goal: get **1,000 people to open SkoolToolz** using only free/organic channels
> in a **2–4 week aggressive sprint**, without violating the product's own
> promise: *no accounts, no servers, no tracking, no upsell.*

**Working URL** (from the deploy pipeline): `https://www.playologyentertainment.com/SkoolToolz/SkoolToolz.html`
— **please confirm this is the exact public link** (or the friendlier one you
want people sharing) before any of the copy below goes out. Every asset in
this doc uses a `[LINK]` placeholder — find/replace once you confirm it.

---

## 1. Positioning: the angles that actually sell this

Pull these straight from what's shipped (`ROADMAP.md`) — they're true, and
they're the strongest hooks:

- **"The anti-ChatGPT homework tool."** 2026's backlash against AI-written
  essays and AI-solved math is a gift. SkoolToolz is deterministic and *shows
  its work* — it teaches the method instead of handing over an answer. This
  is your strongest single hook for teachers and skeptical parents.
- **"No account. No tracking. No upsell."** Genuinely rare in edtech. Say it
  in almost every post — it's the thing that makes people trust a link from
  a stranger enough to click it.
- **"55 free tools, one HTML file, works offline after first load."** No
  install, no signup wall, no "create an account to continue." Zero friction
  between click and try.
- **Depth, not just breadth** — pick the flagship per audience:
  - STEM: step-by-step **Calculus Solver**, chemistry **equation balancer +
    titration curves**, **Stats** distributions/regression, **Matrix/Truth
    Table** tools.
  - Test prep: **13 AP subject flashcard decks (~449 cards)**, **SAT/ACT Math
    Drill** with scaled scoring, **Exam Countdown**, **Free-Response Pacer**.
  - Writing/humanities: **Citation Helper** (DOI/ISBN autofill), **Essay
    Scaffold** planner.
  - Accessibility: **Dyslexia-friendly mode**, **Read Aloud**, **Reading
    Ruler** — a genuinely underserved niche online.
  - CS/programming: **Code Playground** (JS/Python via Pyodide/HTML),
    **Regex Tester**, **Base Converter**.
  - Study logistics: **Flashcards** with Anki import + share-by-code,
    **Enhanced Focus Lock** with soundscapes.

**One-line pitches** (pick by audience):
- *Short:* "55 free study tools, no login, no ads, no AI shortcuts."
- *Student:* "It's Symbolab + Quizlet + a periodic table + a citation
  generator, minus the account wall and the paywall. One page, works
  offline."
- *Teacher:* "A free, AI-free tool site for your students that shows its
  work instead of doing it for them — no accounts, nothing to install,
  nothing collecting student data."
- *Dev/HN crowd:* "A 55-tool study app shipped as a single offline-capable
  HTML file, with a lazy-loaded symbolic calculus engine. No backend, no
  accounts, no tracking."

---

## 2. The measurement problem (read this before you launch)

The product's own guardrail is *"no accounts, no servers, no tracking."*
That means there's no built-in way to count "1,000 tries" from inside the
app without contradicting the brand promise — so don't add a client-side
analytics script just to get a number. Two zero-dollar ways to measure that
don't touch that guardrail:

1. **Server-side aggregate logs only.** Most hosts (Hostinger included)
   ship free raw traffic stats (AWStats/Webalizer under hPanel →
   Statistics, or raw access logs) — these count *hits*, not *people*, with
   no cookies, no client JS, no personal data. Check `SkoolToolz.html`
   requests weekly. Bonus signal: watch **`calculus-engine.js`** and
   **`ap-packs.js`** requests specifically — those only load when a student
   actually *opens* the Calculus Solver or an AP pack, so they're a rough
   proxy for real engagement vs. a bounce.
2. **Per-channel UTM tags on your outbound links only** (e.g.
   `?src=reddit-apstudents`, `?src=pt-teacher-freebie`), read back out of
   those same server logs. This tags *where a click came from*, not *who
   clicked* — no cookie, no script, nothing stored about the visitor.

Recommendation: use both, reviewed weekly, and treat "1,000 tries" as
"1,000 hits to SkoolToolz.html across the sprint" rather than a precise
unique-visitor count.

**Update:** `SkoolToolz.html` now also loads
[GoatCounter](https://playologyentertainment.goatcounter.com/) — a
cookieless, open-source, no-personal-data pageview counter (no accounts
created for visitors, nothing beyond a hit count and referrer/UA, so it
doesn't contradict the "no tracking" promise). It skips localhost/private-IP
loads by default, so local dev doesn't pollute the dashboard. Use its
dashboard as the primary "1,000 tries" source; server logs and UTM tags
remain useful for per-channel breakdown.

---

## 3. The sprint (2–4 weeks, front-loaded)

| Week | Focus | Target outcome |
|---|---|---|
| **1** | Foundation: confirm link, seed 2–3 quiet test posts, warm up accounts, prep all copy | First real traffic trickle, posts battle-tested |
| **2** | Broad blitz: Reddit + Discord across every subreddit/server in §4.1, Teachers Pay Teachers listing + teacher FB groups | Bulk of the 1,000 |
| **3** | Launch-site day: Product Hunt + Show HN + Indie Hackers + AlternativeTo/SaaSHub, follow-up comments on week-2 posts | Second wave + backlinks (SEO compounds later) |
| **4 (stretch)** | Personal network asks, short-form video, re-post to any subreddit with a "new semester" rule reset, collect testimonials | Push over 1,000, seed for the real back-to-school wave in August |

**Timing note:** it's July 1 — most US students are on summer break, so the
*biggest* natural wave (searches, teacher prep) hits mid-August. Front-load
this sprint anyway: it builds backlinks and testimonials now that compound
by the time school starts, and summer-school / credit-recovery / rising
college-freshman audiences are actively searching right now.

---

## 4. Channel playbooks

### 4.1 Reddit & Discord (broad, high-volume — the workhorse channel)

**Rules of engagement first (do this or you'll get banned/removed):**
- Warm up: comment genuinely in each subreddit for a few days before
  posting a link — many require account age/karma minimums or ban
  first-time-poster links outright.
- Never post the identical text to every subreddit back-to-back. Space
  posts out over hours/days, vary the framing per audience (see below).
- Disclose you built it ("I made this" / "OC") — undisclosed self-promo
  gets removed as spam far more often than disclosed self-promo.
- Reply to every comment for the first 24–48 hours. Engagement is what
  keeps a post alive in feeds, and objections answered in the thread do
  more conversion work than the post itself.
- Check each sub's self-promo rule (some cap it to certain days/threads).

**Target subreddits (student-facing):**
r/APStudents · r/HomeworkHelp · r/GetStudying · r/study · r/Sat · r/ACT ·
r/college · r/highschool · r/EngineeringStudents · r/learnmath ·
r/AskStatistics · r/chemhelp · r/calculus · r/learnprogramming · r/Python ·
r/InternetIsBeautiful (huge — perfect fit for a single-page, no-account,
offline tool) · r/SideProject · r/coolgithubprojects (if the repo is
public)

**Target subreddits (teacher/accessibility-facing):**
r/Teachers · r/ScienceTeachers · r/matheducation · r/AskTeachers ·
r/homeschool · r/Dyslexia · r/specialed

**Discord servers:** Study Together (large public studying server —
search Disboard.org for "study together"), subject-specific AP Discords
(AP Chem/Calc/Stats servers exist and are searchable), homework-help
Discords, r/APStudents' own server. Post in the resource-sharing /
self-promo channel, not general chat, and read pinned rules first.

**Ready-to-use posts** (fill in `[LINK]`, tweak the bracketed line per sub):

```
[r/InternetIsBeautiful / r/SideProject]
Title: I made a free, offline, no-account site with 55 study tools (calc solver, chem balancer, stats, citations, flashcards...)

Built this over [time period] — SkoolToolz is a single HTML page with 55
small tools across math, chem, stats, writing, and test prep. No account,
no ads, no tracking, works offline after the first load. Everything solves
step-by-step (no AI black box) so it actually teaches the method instead of
just handing you an answer.

Highlights: a symbolic calculus solver (derivatives/integrals/limits with
full steps), a chemistry equation balancer + titration curve tool, a stats
sheet with distributions and regression, a citation helper with DOI/ISBN
autofill, Anki-importable flashcards with SM-2 spaced repetition, and 13
AP subject flashcard decks.

[LINK] — feedback welcome, especially "what tool is missing."
```

```
[r/APStudents / r/Sat / r/ACT — test-prep framing]
Title: Free tool with 13 AP flashcard decks + a full SAT/ACT math drill (scaled scoring), no login

Sharing in case it helps someone this cycle: SkoolToolz has AP flashcard
packs (13 subjects, ~449 cards) with spaced repetition built in, plus a
SAT/ACT math drill that gives you an estimated scaled score and reviews
every wrong answer step-by-step. There's also an Exam Countdown and a
Free-Response Pacer if you're timing FRQs. No account, free, works
offline once loaded.

[LINK]
```

```
[r/chemhelp / r/calculus / r/AskStatistics — subject-specific]
Title: Free [chemistry equation balancer + titration curves / calculus solver with full steps / stats sheet with distributions & regression] tool, no login

[One tool per post, tailored:]
- Chem: balances equations via matrix/null-space method and shows the
  atom-conservation equations, does limiting-reagent walkthroughs, and
  plots titration curves (strong/weak acid & base) with equivalence
  points marked.
- Calc: symbolic derivatives/integrals/limits, full rule-by-rule steps
  (product/quotient/chain/u-sub/by-parts), Simpson's-rule fallback for
  integrals without a closed form.
- Stats: normal/binomial/t distribution lookups both directions, linear
  regression with residual plots, CIs and one/two-sample t-tests.

Free, no account, [LINK]. Would love feedback from people actually taking
this course.
```

```
[r/Teachers / r/ScienceTeachers / r/matheducation — teacher framing]
Title: Made a free AI-free tool site for students — shows work, no accounts, nothing to install

I know this sub is (rightly) tired of "AI tool for students" posts, so I
want to be upfront: this has **no AI** in it anywhere. Every solver is
deterministic and shows its steps — it's built specifically so students
can't shortcut past the method. No accounts, nothing to install, no
student data collected anywhere, works offline after the first load.
55 tools total (math/chem/stats/writing/test-prep/accessibility),
including a dyslexia-friendly mode, read-aloud, and a reading ruler if
that's useful for your classroom.

Not selling anything — genuinely just want more classrooms using it.
[LINK]
```

```
[r/Dyslexia / r/homeschool / r/specialed — accessibility framing]
Title: Free study tool site with a dyslexia-friendly mode, read-aloud, and reading ruler built in

Sharing because this doesn't get talked about much: SkoolToolz (55 free
study tools, no account) has a global dyslexia-friendly mode (swaps in
Atkinson Hyperlegible font app-wide), a read-aloud/text-to-speech tool,
and a reading ruler — alongside the regular math/science/writing tools.
Free, no login, works offline. [LINK]
```

```
[r/learnprogramming / r/Python — dev framing]
Title: Built a study-tools site as a single offline HTML file — 55 tools, lazy-loaded engines, no backend

Technical angle for this sub: it's a single-file app (no build step to
run it) with lazy-loaded modules for the heavy stuff — a symbolic
calculus engine only fetches when you open that tool, and a Python
sandbox (Pyodide) runs entirely client-side in the Code Playground
alongside JS/HTML. No accounts, no server, 0 network calls before
interactive. [LINK] — curious what this sub would build differently.
```

### 4.2 Launch sites (week 3 — fewer, bigger swings)

- **Product Hunt** — submit as a maker, tag "Education," "Productivity."
  Draft tagline: *"55 free study tools. No account, no ads, no AI
  shortcuts."* Draft description: adapt the r/InternetIsBeautiful post
  above; PH rewards a punchy first line and a GIF/screenshot of the tool
  grid.
- **Hacker News (Show HN)** — title: *"Show HN: SkoolToolz – 55 free study
  tools in one offline HTML file, no accounts"*. HN responds well to the
  engineering story (single-file architecture, lazy-loaded symbolic
  calculus engine, 0 network calls before interactive) more than the
  marketing pitch — lead with that.
- **Indie Hackers** — post in the "Show IH" / milestones section, framed
  as a solo/small-team build story with the guardrails (no accounts, no
  tracking) as the differentiator.
- **AlternativeTo.net** and **SaaSHub** — list SkoolToolz as a free
  alternative to Photomath, Symbolab, Wolfram Alpha, Desmos, Quizlet, and
  EasyBib/Citation Machine. Free to list, and these sites rank well in
  Google for "X alternative" searches — good long-tail SEO with zero
  ongoing effort.
- **Teachers Pay Teachers** — list SkoolToolz as a **free resource** (TPT
  explicitly allows free listings). Teachers browse TPT constantly looking
  for free classroom tools; this is a channel most "growth hacking" lists
  skip entirely and it's built for exactly this audience.

### 4.3 Teacher outreach (personal + async)

**Email template** (for teachers you or your network actually know, or
public contact-a-teacher forms/pages):

```
Subject: A free, AI-free tool site for your students (no account, no ads)

Hi [Name],

I wanted to flag a resource in case it's useful for your class: SkoolToolz
is a free site with 55 study tools spanning math, chemistry, statistics,
writing, and test prep — [LINK].

A few things I think matter for a classroom setting specifically:
- No AI anywhere. Every solver shows its steps deterministically, so it
  can't be used to skip the actual work — it's built to teach method, not
  hand over answers.
- No accounts, nothing to install, no student data collected or stored
  anywhere (everything runs and saves locally in the student's browser).
- Free, no ads, no upsell — it's a side project, not trying to become a
  subscription.
- There's a dyslexia-friendly mode, read-aloud, and a reading ruler if
  that's relevant for any of your students.

No ask here beyond "take a look" — if it's useful, sharing it with a
class or department would mean a lot. Happy to answer any questions.

Thanks,
[Your name]
```

**Where to send/post it:** teacher Facebook groups (search "[Subject]
Teachers," "iTeachMath," "Secondary ELA Teachers," "AP Chemistry
Teachers" — most are public-join and allow free-resource shares),
r/Teachers weekly resource-sharing threads if the sub runs one, school
department listservs if you have a personal contact.

### 4.4 Personal network (fastest-converting, don't skip it)

- Direct-message or tell in person every student, teacher, tutor, or
  parent-of-a-student you know. A warm, specific ask converts far higher
  than any cold post: *"I built a free study tool site, would you try one
  tool for 5 minutes and tell me what's confusing?"* — the "tell me what's
  confusing" framing gets replies where "check this out" doesn't.
- Ask each person who tries it to share with **one** study group, class
  Discord/GroupMe, or Instagram close-friends story — this is the
  zero-dollar equivalent of a referral program and often outperforms cold
  channels for a niche audience like "kids taking AP Chem right now."
- If you're near a school, library, or tutoring center, a single flyer/QR
  code taped near a study room (with permission) costs nothing and
  reaches people at the exact moment they need a study tool.

### 4.5 Short-form video & social (week 4, supporting channel)

Short-form video works here because the product is visual (neon-on-black
UI, live step-by-step solves) — a 15–30s screen-recording sells it faster
than any text post.

**Script (TikTok/Reels/Shorts, ~20s):**
```
[Hook, first 2s, text on screen]: "This site does your calc homework's
WORK for you — not the answer, the steps."
[0-5s] Screen-record: type a derivative into the Calculus Solver, show the
rule-by-rule steps appearing.
[5-12s] Quick cuts: chemistry balancer solving an equation → stats
regression plotting a line → citation helper autofilling from a DOI.
[12-18s] Text on screen: "55 tools. No account. No ads. No AI answers —
just the work shown."
[18-20s] End card: "Free, link in bio/comments — SkoolToolz"
```

**Caption (same for TikTok/Reels/Shorts):**
```
found a free study site with 55 tools (calc, chem, stats, citations,
flashcards...) that shows every step instead of just giving you the
answer. no account, no ads. link in comments 🔗 #studytok #apclasses
#studytips #calculus #APChem
```

**X/Twitter thread starter:**
```
1/ Built a free study-tools site: 55 tools, one HTML file, no account,
no ads, no AI. Here's what's in it 🧵

2/ A symbolic calculus solver — full rule-by-rule steps for derivatives,
integrals, and limits, not just the answer.

3/ A chemistry equation balancer (matrix/null-space method, shows its
work) + titration curve plotter.

4/ A stats sheet: distributions, regression, CIs, t-tests, with plots.

5/ 13 AP flashcard decks (~449 cards) with spaced repetition, a citation
helper with DOI/ISBN autofill, a dyslexia-friendly mode, and 40+ more.

6/ No signup wall. Works offline after first load. Free: [LINK]
```

**Instagram caption (single post/carousel of screenshots):**
```
55 free study tools. No account, no ads, no AI shortcuts — just tools
that show their work. Swipe for a few → link in bio. #studygram
#studytips #apstudent #highschool #studyaccount
```

### 4.6 SEO / evergreen quick wins (compounding, low effort)

- Backlinks from AlternativeTo/SaaSHub/TPT (§4.2) are free, permanent, and
  keep paying off in search rankings long after the sprint ends.
- If/when you're open to a small code change, the single highest-leverage
  SEO/share fix is adding Open Graph tags (`og:title`, `og:description`,
  `og:image`) to `SkoolToolz.html` — right now shared links (Reddit,
  Discord, iMessage, Slack) won't render a preview card, which measurably
  hurts click-through on every link in this whole plan. Flagging it here
  rather than changing it, since you scoped this round to plan + copy —
  happy to do it in a follow-up if you want.

---

## 5. Guardrails while being "aggressive"

Aggressive ≠ spammy. To stay effective and avoid bans:
- One post per subreddit, spaced out, tailored copy (never verbatim
  copy-paste across subs — mods and users both notice).
- Always disclose "I made this."
- Answer every comment/reply for the first 48 hours of each post.
- Read each community's self-promo rule before posting; some restrict it
  to a weekly thread.
- Don't buy followers/upvotes/reviews — it's detectable, costs trust, and
  several of these platforms will remove the post for it.

---

## 6. After 1,000 tries: monetization on-ramp (for later)

Not this sprint's job, just the forward pointer you asked for:
- The product's own brand promise ("no account, no tracking, no upsell")
  is in tension with most ad networks (many require analytics/cookies).
  Worth a dedicated conversation on which ad model (if any) fits without
  breaking the trust that made people share it in the first place —
  e.g. static, non-tracking sponsorships vs. a conventional ad network.
- Cheapest signal to collect in the meantime: informal feedback from
  people who tried it (via the Reddit threads, teacher replies, DMs) on
  which tools they'd pay to remove ads from, or what a "supporter" tier
  would need to include — free market research, no code required.

---

## 7. Checklist

- [ ] Confirm the exact public `[LINK]` and replace it in every asset above
- [ ] Week 1: warm up Reddit/Discord accounts, post 2–3 test threads
- [ ] Week 2: post across the full subreddit/Discord list (§4.1), list on TPT
- [ ] Week 3: Product Hunt, Show HN, Indie Hackers, AlternativeTo, SaaSHub
- [ ] Week 3: send teacher outreach emails + FB group posts
- [ ] Week 4: personal-network asks, short-form video, re-check any
      "no self-promo repeats" cooldowns for a second pass
- [ ] Weekly: check server logs for `SkoolToolz.html` / `calculus-engine.js`
      / `ap-packs.js` hit counts as your 1,000-tries proxy
