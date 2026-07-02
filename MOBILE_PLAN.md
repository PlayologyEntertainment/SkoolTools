# SkoolToolz — Go-to-Mobile Plan (Android + iOS)

> *Many small, smart, sharp tools. No account. No tracker. No upsell.*
> This plan brings that same app to phones — as **free**, installable,
> **fully offline** native apps in the Google Play Store and the Apple App
> Store — without rewriting a single tool.

**Status:** Proposed · **Target:** Android (Google Play) + iOS (App Store) ·
**Cost model:** Free app (no ads, no in-app purchases, no accounts)

---

## 1. Executive summary

SkoolToolz is already a self-contained, client-side web app: one
`SkoolToolz.html` (~27k lines) plus two lazy-loaded modules (`ap-packs.js`,
`calculus-engine.js`), with all state in `localStorage` and **no backend**.
That architecture makes it an ideal candidate for a **Capacitor** wrapper —
we ship the *exact same web app* inside a thin native shell that both stores
accept as a real, installable application.

**The four decisions driving this plan (confirmed):**

1. **Approach:** Capacitor wrapper (reuse 100% of current code).
2. **Platforms:** Both stores. We will pay Apple's **$99/yr** Developer
   Program fee; Google Play is a **$25 one-time** fee.
3. **Accounts:** None exist yet — this plan includes setup from scratch.
4. **Offline:** Bundle everything (KaTeX, Pyodide, fonts) so every tool works
   with no internet connection.

**Bottom line:** This is a low-risk port. The bulk of the effort is (a)
pulling the runtime CDN dependencies *into* the app for offline use, (b)
standing up the Capacitor project + native niceties (icons, splash, status
bar, share/haptics), and (c) the one-time account setup and store-listing
paperwork. Realistic effort is **~2–4 focused weeks** to first submission,
most of it in store setup and asset production rather than code.

---

## 2. Current architecture assessment

What the port has to work with (verified against the repo):

| Aspect | Finding | Mobile impact |
|---|---|---|
| **Structure** | Single `SkoolToolz.html` + `ap-packs.js` + `calculus-engine.js` | Trivial to bundle as WebView assets |
| **Backend** | None — 100% client-side | No servers, auth, or API keys to manage |
| **State** | `localStorage` (prefixed wrapper class, ~12 call sites) | Persists fine in WebView; survives app restarts |
| **Module loading** | `ap-packs.js` / `calculus-engine.js` lazy-loaded via **relative** `src` | Works as-is from Capacitor's local origin |
| **CDN runtime deps** | Google Fonts; **KaTeX 0.16.9**; **Pyodide 0.25.1** (Python/WASM); Google Books API | Must be **bundled** for offline (except Books — see §4.3) |
| **PWA readiness** | No manifest, no service worker today | Not required for Capacitor; we add a manifest for polish/TWA-optionality |
| **Device APIs used** | `navigator.clipboard`, `<input type=file>` (CSV/JSON import) | Both supported in WebView; add native Share for nicer UX |
| **Analytics** | GoatCounter (cookieless, no PII) | Keep, but gate behind network + disclose in privacy policy |
| **Icons/branding** | `SkoolToolzLogo.png` (1758×526 wordmark), `Favicon.png` (215×147) | **Neither is square** — a 1024×1024 app icon must be produced |
| **Deploy** | GitHub Actions → FTP to Hostinger | Web stays as-is; mobile gets its own build pipeline |

**Only one feature truly requires the network:** the ISBN lookup that calls
`https://www.googleapis.com/books/v1/volumes`. Everything else can run fully
offline once assets are bundled.

---

## 3. Chosen approach — Capacitor (and why)

[Capacitor](https://capacitorjs.com/) (by Ionic) wraps a web app in a native
iOS/Android project, serving the web assets from a local origin inside a
system WebView, and exposing native APIs through plugins.

**Why it fits SkoolToolz:**

- Reuses the entire existing codebase — no rewrite, no framework migration.
- Produces genuine native binaries (`.aab` for Play, `.ipa` for App Store)
  that both stores accept.
- Actively maintained, first-class Android **and** iOS support (unlike a
  pure PWA, which Apple will not accept as an App Store submission).
- Small, well-documented plugin ecosystem for the few native touches we want.

**Rejected alternatives (for the record):**

- *PWA + Android TWA:* cheap on Android, but iOS App Store won't take a pure
  PWA — fails the "both stores" requirement.
- *Full native rewrite (React Native/Flutter):* months of work, throws away
  the single-file architecture, and buys us little for a tool app with no
  heavy native needs.

---

## 4. Technical work breakdown

### 4.1 Stand up the Capacitor project

Keep the current repo layout intact and add a mobile project around it.

- Create a `mobile/` workspace (or a sibling folder) with a `package.json`,
  Capacitor core + CLI, and the Android/iOS native platform folders.
- Point Capacitor's `webDir` at a build folder containing
  `SkoolToolz.html` (copied/renamed to `index.html`), `ap-packs.js`,
  `calculus-engine.js`, and the bundled offline assets from §4.2.
- Set `appId` (e.g. `com.playologyentertainment.skooltoolz`) and `appName`
  ("SkoolToolz"). This bundle ID is **permanent** once published — choose
  carefully.
- Add a small copy script so the canonical `SkoolToolz.html` remains the
  single source of truth for both web and mobile (avoid a forked copy).

### 4.2 Bundle assets for full offline (the main code task)

Pull each runtime CDN dependency into the app bundle and repoint the loaders:

1. **Google Fonts** (Fraunces, JetBrains Mono, Inter Tight): download the
   `woff2` files, host them locally, and replace the `<link>` to
   `fonts.googleapis.com` with a local `@font-face` stylesheet.
2. **KaTeX 0.16.9** (referenced from **four** places in the HTML): vendor
   `katex.min.css`, `katex.min.js`, and the `fonts/` directory locally; change
   each `cdnjs.cloudflare.com/.../KaTeX` loader to the local path.
3. **Pyodide 0.25.1** (Code shelf, `jsdelivr`): this is the heavy one
   (tens of MB incl. the CPython WASM runtime and stdlib). Vendor the Pyodide
   distribution locally and set `indexURL` to the local folder. *This is the
   single biggest driver of app size* — see the size note below.
4. **Lazy modules** (`ap-packs.js`, `calculus-engine.js`): already relative —
   confirm they resolve from the local origin (they will).

**App size note:** Bundling Pyodide will push the app well past the size where
Play/App Store show a "large download" warning and, on Android, past the
150 MB base-APK limit — meaning we'll want **Play Asset Delivery / on-demand
resources** or an install-time asset pack for the Python runtime, *or* a
decision to lazy-download Pyodide on first use of the Code tool only. Flagged
as an open decision in §12.

### 4.3 Handle the one online feature gracefully

The Google Books ISBN lookup must **degrade cleanly** offline: detect no
network, show a friendly "connect to look up by ISBN" message, and keep the
manual-entry path working. (No other tool needs connectivity.)

### 4.4 Native niceties (small, high-polish wins)

Add a minimal set of Capacitor plugins:

- **Splash Screen** + **Status Bar**: branded launch, correct notch/safe-area
  handling (the app already sets `viewport-fit=cover` and a `theme-color`).
- **Share**: upgrade the existing clipboard/export flows to the native share
  sheet where it helps (export JSON/PNG, share a result).
- **Haptics** (optional): subtle feedback on key interactions.
- **App / Back-button** handling on Android (map hardware back to in-app
  navigation instead of closing the app).
- **Filesystem** (optional): make CSV/JSON import/export feel native; the
  existing `<input type=file>` works but native pickers are nicer.
- Keep **GoatCounter** but only fire when online; disclose in privacy policy.

### 4.5 Icons, splash & branding assets

- Produce a **1024×1024 square app icon** (current logo is a wide wordmark and
  the favicon isn't square — a new square mark is required).
- Generate the full icon/splash set for both platforms (Capacitor's asset
  generator handles the many required sizes from one source image).
- Provide adaptive-icon foreground/background for Android and the iOS icon
  set.

### 4.6 Add a web app manifest (low cost, keeps options open)

Add a `manifest.webmanifest` + basic service worker to the *web* build too.
It's not required for Capacitor, but it (a) improves the web experience,
(b) keeps a future Android TWA path open, and (c) is quick given the app is
already self-contained.

---

## 5. Build, tooling & environment setup (from scratch)

Because no accounts or tooling exist yet, the plan includes standing these up.

**Local/CI toolchain**

- **Node.js + Capacitor CLI** (both platforms).
- **Android:** Android Studio + JDK + Android SDK; a keystore for signing
  (created once, backed up securely — losing it blocks future updates).
- **iOS:** **A Mac is mandatory** to build and submit. Options:
  - Own/borrow a Mac with **Xcode**, **or**
  - Use a **cloud Mac / macOS CI** (e.g. GitHub Actions macOS runners,
    Codemagic, EAS-style services) if no physical Mac is available.
- **Fastlane** (optional but recommended) to automate builds and store
  uploads on both platforms.

**Repo/CI**

- Add a mobile build workflow (separate from the existing FTP deploy) that
  produces signed `.aab` (Android) and `.ipa` (iOS) artifacts. iOS steps must
  run on a macOS runner.

---

## 6. Testing

- **Emulator/simulator:** Android emulator + iOS simulator for fast loops.
- **Real devices:** at least one physical Android phone and one iPhone —
  clipboard, file import, share sheet, safe-area/notch, and offline behavior
  should be verified on hardware.
- **Offline test pass:** airplane-mode run confirming every shelf works
  (special attention to KaTeX rendering, the Code/Pyodide tool, and the
  ISBN-lookup fallback).
- **Store pre-submission:** Play **internal testing** track and Apple
  **TestFlight** before public release.

---

## 7. Publishing to Google Play (step-by-step, from zero)

1. **Create a Google account** for the developer identity (or use an existing
   org account).
2. **Register for the Google Play Console** at
   `play.google.com/console` — pay the **one-time $25** fee. New personal
   accounts must complete **identity verification** (government ID) and, per
   current Google policy, **new personal developer accounts must test with
   ≥12 testers for 14 days** before they can publish publicly — plan for this
   lead time.
3. **Create the app** in the console (name, default language, "App", "Free").
4. **Complete the required declarations:**
   - **Privacy policy URL** (host on playologyentertainment.com — see §9).
   - **Data safety form** (SkoolToolz collects essentially nothing;
     disclose GoatCounter analytics honestly — cookieless, no PII).
   - **Content rating** questionnaire (should rate "Everyone").
   - **Target audience & content** — note if the app targets students/kids;
     if under-13 audiences are declared, additional Families policies apply.
   - Ads declaration: **No ads.**
5. **Upload the signed `.aab`** to an **internal testing** track first; roll
   through **closed/open testing** as needed to satisfy the testing
   requirement.
6. **Store listing assets** (see §9): title, short & full description, app
   icon (512×512), feature graphic (1024×500), and phone screenshots.
7. **Submit for review**, then **promote to Production**. First reviews
   typically take a few hours to a few days.

---

## 8. Publishing to the Apple App Store (step-by-step, from zero)

1. **Create an Apple ID**, then **enroll in the Apple Developer Program** at
   `developer.apple.com/programs` — **$99/yr**. Enrollment requires identity
   verification and can take 24–48h (sometimes longer). Enrolling as an
   organization additionally needs a **D-U-N-S number**; enrolling as an
   individual is faster but publishes under your personal name.
2. **App Store Connect:** create the app record (`appstoreconnect.apple.com`),
   set the **bundle ID** (must match Capacitor's `appId`), category
   (Education), and pricing = **Free**.
3. **Signing:** create the App Store distribution certificate and provisioning
   profile (Xcode can manage this automatically, or use Fastlane match).
4. **Build & upload** the `.ipa` from Xcode/Fastlane on a Mac to **TestFlight**.
5. **App Privacy ("nutrition label"):** complete the questionnaire — declare
   the minimal GoatCounter analytics honestly; most categories are "not
   collected."
6. **Store listing assets** (see §9): name, subtitle, promotional text,
   description, keywords, support URL, privacy policy URL, app icon
   (1024×1024), and screenshots for required device sizes (iPhone; iPad if we
   ship an iPad build).
7. **Submit for review.** Apple review is stricter than Google's — the most
   common risks for a wrapped web app are (a) "minimum functionality"
   (mitigated: SkoolToolz is 55 rich tools, not a website shell) and (b)
   broken features offline (mitigated by §4.2 bundling). First review is
   usually ~1–3 days.

---

## 9. Store listing assets & content (needed for both)

Produce once, reuse across stores:

- **App name / title:** "SkoolToolz" (+ optional subtitle, e.g. "55 study
  tools · no account, no tracking").
- **Descriptions:** short (≤80 char) and full — lean on the existing voice
  and the shelf/tool inventory in `ROADMAP.md`.
- **Keywords** (Apple) / discoverability terms.
- **App icon:** 512×512 (Play) and 1024×1024 (Apple) — from the new square
  mark (§4.5).
- **Screenshots:** several per platform/device size, showing representative
  tools across shelves (Numbers, Words, Study, Test Prep, Code, etc.).
- **Feature graphic** (Play, 1024×500).
- **Privacy policy URL:** publish a short policy (no accounts, local-only
  storage, cookieless analytics, one optional online lookup) on
  playologyentertainment.com.
- **Support URL / contact email.**

---

## 10. Free-app considerations

Being free simplifies a lot, but has specifics worth calling out:

- **No monetization = simpler review & privacy:** no IAP, no ad SDKs, no
  payment/subscription disclosures, no revenue reporting. This keeps the
  privacy/data-safety forms almost entirely "not collected."
- **Costs are just the developer fees + assets:** Apple **$99/yr**
  (recurring — the only ongoing cost), Google **$25 once**. Everything else
  (Capacitor, tooling) is free/open-source. A cloud-Mac/CI subscription is an
  optional cost only if there's no physical Mac.
- **Kids/education audience:** if we declare a student/child audience, both
  stores impose stricter data rules (Google Families policy, Apple Kids
  Category). The app's zero-collection design already aligns well — just
  declare accurately and keep GoatCounter honest (or consider dropping
  analytics on mobile to sidestep the question entirely).
- **Keep the "no tracker" promise:** the app's brand is privacy-first; the
  mobile version should preserve that literally in the store privacy labels.

---

## 11. Phased plan & effort estimate

| Phase | Work | Est. |
|---|---|---|
| **0. Setup** | Register Google Play ($25) + Apple ($99/yr); provision Mac/CI; install toolchain | 2–5 days (mostly waiting on verification) |
| **1. Capacitor bring-up** | Project scaffold, load app in WebView on both platforms, back-button/status-bar/splash | 2–4 days |
| **2. Offline bundling** | Vendor fonts + KaTeX + Pyodide; repoint loaders; ISBN offline fallback; decide Pyodide delivery | 3–6 days |
| **3. Native polish + assets** | Share/haptics/filesystem plugins; square icon + icon/splash generation; manifest | 2–4 days |
| **4. Testing** | Emulator + real-device + offline pass; internal testing / TestFlight | 3–5 days |
| **5. Store paperwork + submit** | Listings, screenshots, privacy policy, data-safety/App-Privacy forms, submit both | 3–5 days |

**Realistic total to first submission: ~2–4 focused weeks**, gated partly by
Apple enrollment and Google's new-account testing window (which can run in
parallel with development).

---

## 12. Open decisions (need your input before building)

1. **Bundle ID:** confirm `com.playologyentertainment.skooltoolz` (permanent).
2. **Pyodide delivery:** bundle it in-app (large download, fully offline day
   one) **vs.** lazy-download on first use of the Code tool (smaller app, that
   one tool needs network the first time). This is the main size/UX tradeoff.
3. **iOS build environment:** physical Mac available, or should we budget for
   a cloud-Mac/macOS-CI service?
4. **Analytics on mobile:** keep GoatCounter (honest, cookieless) or drop it
   entirely to make the privacy labels a clean "nothing collected"?
5. **iPad / tablet:** ship a tablet-optimized build, or phone-only first?
6. **Developer account type (Apple):** individual (faster, your name shown) or
   organization (needs D-U-N-S, shows company name)?

---

## 13. Risks & mitigations

- **Apple "minimum functionality" rejection** → SkoolToolz is a deep,
  original tool suite (55 tools), not a website shell; emphasize offline,
  native integration, and the tool breadth in the review notes.
- **Offline breakage at review** → the §4.2 bundling pass + an explicit
  airplane-mode test gate before submission.
- **App size (Pyodide)** → resolve via decision #2 above.
- **Signing-key loss (Android)** → back up the keystore securely; losing it
  prevents future updates.
- **New-account delays** → start Apple enrollment and Google verification on
  day one so they clear while code work proceeds.
