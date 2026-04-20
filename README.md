# Learn Finnish 🇫🇮

A friendly, game-like web app for learning the Finnish language — built as a Progressive Web App (PWA) that installs natively on iPhone and Mac. Based on the real vocabulary, grammar and exercises from Gavin's in-person Finnish beginner course.

**Live app:** <https://gavinglorieux.github.io/Learn-Finnish/>

Every push to `main` rebuilds and redeploys via the `.github/workflows/deploy.yml` GitHub Actions workflow.

## What's inside

Content is normalised by `scripts/normalize.py` into four JSON files under `content/`:

- `items.json` — 123 unique learning items (vocabulary tables, verb conjugations, grammar rules, exercises, phrase lists, notes, reference documents)
- `lessons.json` — 26 lessons, each pointing to its items
- `topics.json` — 163 topic slugs, each mapping to the items that touch that topic
- `report.json` — summary of the last parser run

The app in `src/` treats these as the **single source of truth** and builds everything from them.

- **1,089 word pairs** extracted from the course, browsable and searchable
- **35 vocabulary categories** derived from real course tables
- **21 grammar topics** — a concise primer plus the course's own grammar rules
- **26 lessons** you can browse chronologically
- **4 real course exercises** (with answer keys) turned into interactive fill-the-blank rounds
- **9 practice modes**, each exercising different skills:
  - **Smart review** — spaced-repetition queue (Leitner boxes) that surfaces words right before you'd forget them
  - **Flashcards** — classic flip cards with self-assessment
  - **Multiple choice** — both directions, with category-based distractors
  - **Typing** — active recall with ä/ö/å keyboard helpers
  - **Match pairs** — memory-style Finnish↔English pair matching
  - **Listen & match** — hear the Finnish (Web Speech fi-FI), pick the meaning
  - **Verb conjugator** — Type 1 & Type 2 verbs (with consonant gradation), all 6 persons, negatives
  - **Fill the gap** — complete sentences with the correct word or case form
  - **Course exercises** — real fill-in-the-blank rounds straight from the course, with full answer keys
- **Gamification** — XP, levels, streaks, daily goals, 11 achievements, confetti on milestones
- **Full reference** — searchable vocabulary and grammar browsers

## Get started

```bash
pnpm install     # one-off
pnpm dev         # http://localhost:5173
pnpm build       # produces dist/
pnpm preview     # serve dist/ at http://localhost:4173
pnpm typecheck
pnpm test        # runs unit tests (verbs, SRS, progress, utils)
```

## Install as a native app

Open the deployed site (or `pnpm preview` URL) in your browser:

### iPhone

1. Open in **Safari** (Chrome does not support Home-Screen install).
2. Tap the **Share** button.
3. Scroll down → **Add to Home Screen** → **Add**.
4. Launch from the Home Screen — fullscreen, offline-capable.

### Mac, Safari 17+

1. Open in Safari.
2. **File → Add to Dock…** → **Add**.
3. Now lives in Dock and Launchpad in its own window.

### Mac, Chrome / Edge

1. Look for the install icon on the right side of the address bar.
2. Or use the browser menu → **Install Learn Finnish**.

The in-app `/install` page has the same guide for end users.

## Architecture

- **Vite + React 18 + TypeScript**, no framework-heavy state library — a small `AppProvider` context holds progress/SRS/settings.
- **vite-plugin-pwa** generates the manifest and service worker. Offline-first precache of all assets.
- **Tailwind CSS** for styling, with a Finnish-flag blue (`#003580`) and sun-yellow accent.
- **LocalStorage** for persistence (progress, SRS boxes, settings). Falls back to in-memory when unavailable (Safari private mode).
- **Web Speech API** (`fi-FI`) for pronunciation — zero server round-trips. Gracefully no-ops when unavailable.
- **Leitner box SRS** with 5 boxes and intervals of 10 min → 1d → 3d → 7d → 21d.
- **Consonant gradation** is built into the Type 1 verb conjugator so forms like `nukkua → nukun` are correct.

## Extending the content

The app is designed for the course to keep growing. When new source material (PDFs, docx, JPEGs) becomes available:

1. **Put the new files under `raw/`** (git-ignored).
2. **Run the parsing pipeline**:
   ```bash
   bash scripts/sync-from-drive.sh       # mirror source files from Google Drive (optional)
   bash scripts/parse-docs.sh            # extract structured data into parsed/
   python scripts/normalize.py           # merge, dedupe, emit content/*.json
   ```
3. **Re-run the app** — `pnpm build` or `pnpm dev`. The UI automatically picks up the new items, lessons, topics, grammar rules, exercises and words. No code changes needed.

All UI views derive from `src/data/course.ts` which consumes the `content/*.json` files. The old hand-curated `grammar.ts` and `verbs.ts` remain as a beginner primer and a conjugation engine (for the interactive verb drill); they do not need to be edited when new lessons are added.

## Directory layout

```
content/         normalised JSON from the parser (source of truth)
scripts/         parsing + icon-generation scripts
src/
  data/          course adapter + grammar/verb primers
  lib/           storage, SRS, progress/XP, TTS, utils
  state/         settings & app context
  components/    shared UI (Layout, Toasts, Confetti, Icons)
  exercises/     one file per practice mode + shell + summary
  pages/         routed pages (Home, Learn, Lessons, Practice, Grammar, Vocabulary, …)
tests/           unit tests (verbs, SRS, progress, utils, course adapter)
```

## Tests

- `tests/verbs.test.ts` — verb conjugation correctness including gradation and irregulars
- `tests/srs.test.ts` — Leitner box progression and due-queue logic
- `tests/progress.test.ts` — XP → level curve
- `tests/utils.test.ts` — answer-matching, shuffle, sampleN
- `tests/course.test.ts` — content pipeline shape: item schema, lesson/topic cross-references

Run `pnpm test`.

## Icon generation

PNG icons are generated from `public/favicon.svg` via `scripts/generate-icons.mjs` (uses `@resvg/resvg-js`):

```bash
node scripts/generate-icons.mjs
```

Outputs into `public/icons/`.

## Credits

- Course content summarised from the in-person Finnish beginner course (Lessons 1–14) as processed by Claude from PDF/JPEG/Word source material.
- Built with love for Gavin's journey into Finnish. Onnea matkaan! 🎉
