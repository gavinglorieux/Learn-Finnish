# Learn Finnish 🇫🇮

A friendly, game-like web app for learning the Finnish language — built as a Progressive Web App (PWA) that installs natively on iPhone and Mac. Based on the real vocabulary, grammar and exercises from Gavin's in-person Finnish beginner course.

**Live app:** <https://gavinglorieux.github.io/Learn-Finnish/>

Every push to `main` rebuilds and redeploys via the `.github/workflows/deploy.yml` GitHub Actions workflow.

## What's inside

All content comes from Gavin's Monday Finnish course with **Teija Perttilä** (Finnish Institute, London): every worksheet, photo, text and dialogue handed out from autumn 2025 to autumn 2026, checked and filled out with web references (Wiktionary, uusikielemme.fi, Wikipedia's Finnish grammar).

- **2,333 words** in **54 groups** across 10 sections (basics, people, time, home, food, out & about, nature, health, free time, word types), each with English, word class, verb type and notes
- **44 grammar lessons** in 6 parts, in learning order: sounds & spelling → first steps → nouns & cases → verbs (types 1–6, K-P-T, imperative) → places & movement (local cases, postpositions) → time & everyday life. Each has rules, full tables, course examples, exceptions, cross-links and practice links
- **37 lessons** (every class across Autumn 2025, Spring 2026, Summer 2026 and Autumn 2026), each linking its grammar, vocabulary, texts, exercises and the full handout transcripts
- **61 reading texts & dialogues** with line-by-line translations and tap-to-translate
- **112 exercises (1,475 questions)**: 101 real course worksheets and 11 grammar drills
- **Practice modes**:
  - **Smart review**: spaced repetition (Leitner boxes)
  - **Flashcards**, **Multiple choice**, **Typing**, **Match pairs**, **Listen & match**: by group or by lesson
  - **Verb conjugator**: all ~255 course verbs, types 1–6, with K-P-T, negative and imperative modes
  - **Fill the gap**
  - **Course exercises & grammar drills**: local cases, illative, genitive, partitive, plural, K-P-T in nouns, postpositions, minulla on, question words, clock, days/months/seasons
- **Gamification**: XP, levels, streaks, daily goals, achievements

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
- **Conjugation engine** (`src/data/conjugate.ts`) covers verb types 1–6 with K-P-T in both directions (`nukkua → nukun`, `tavata → tapaan`), negatives and the imperative.

## Content pipeline

`content/` is the single source of truth. It has three layers:

| Layer | Files | Written by |
|---|---|---|
| Source transcriptions | `content/sources/<term>/<Lesson N (D.M.YYYY)>/<file>.json`, one per course file | vision/pandoc transcription, reviewed; shape in `scripts/EXTRACTION_SPEC.md` |
| Curated | `content/grammar/NN-*.json` (grammar course), `content/curated/groups.json` (vocab sections), `content/curated/lessons.json` (per-class titles/topics), `content/curated/drills.json`, `content/curated/word-fixes.json` | by hand |
| Generated | `content/vocab.json`, `grammar.json`, `texts.json`, `exercises.json`, `course.json`, `handouts.json`, `report.json` | `scripts/build-content.py` |

To add new class material:

1. **Get the files into `raw/`** (git-ignored), under `raw/<term>/Lesson N (D.M.YYYY)/`:
   ```bash
   bash scripts/sync-from-drive.sh   # mirrors the Drive folders in scripts/drive-sources.conf
   ```
   Teija also emails material (`from:taniperttila@gmail.com`). Anything that's only in Gmail has to be downloaded from the email and saved into the matching lesson folder; add a new term folder to `drive-sources.conf` once it's on Drive.
2. **Extract text**: `bash scripts/parse-docs.sh` (docx/odt via pandoc, pdf via pdftotext → `parsed/`).
3. **Transcribe** each new file into `content/sources/…/<file>.json` following `scripts/EXTRACTION_SPEC.md` (photos are read with Claude vision). Add or adjust the lesson in `content/curated/lessons.json`.
4. **Build**: `python3 scripts/build-content.py`, then `pnpm test` (the content-shape tests catch broken links, unknown groups and verb-type mismatches).

Lesson pages list handouts that are still missing under "still to be added" (the `gmailOnly` field in `lessons.json`).

## Directory layout

```
content/         course content (sources → curated → generated JSON)
scripts/         Drive sync, doc parsing, content build, icon generation
src/
  data/          content.ts (typed content), conjugate.ts (verb engine), vocabulary/verbs adapters
  lib/           storage, SRS, progress/XP, TTS, utils
  state/         settings & app context
  components/    shared UI (Layout, Toasts, Confetti, Icons)
  exercises/     one file per practice mode + shell + summary
  pages/         routed pages (Home, Learn, Lessons, Reading, Practice, Grammar, Vocabulary, …)
tests/           unit tests (verbs, SRS, progress, utils, course adapter)
```

## Tests

- `tests/conjugate.test.ts`: verb types 1–6, K-P-T both ways, irregulars, imperative
- `tests/srs.test.ts` — Leitner box progression and due-queue logic
- `tests/progress.test.ts` — XP → level curve
- `tests/utils.test.ts` — answer-matching, shuffle, sampleN
- `tests/course.test.ts`: content shape and cross-references (words, grammar links, texts, exercises, lessons), plus every course verb checked against the conjugation engine

Run `pnpm test`.

## Icon generation

PNG icons are generated from `public/favicon.svg` via `scripts/generate-icons.mjs` (uses `@resvg/resvg-js`):

```bash
node scripts/generate-icons.mjs
```

Outputs into `public/icons/`.

## Credits

- Course material by Teija Perttilä (Finnish Institute, London), transcribed and organised by Claude from the Word, PDF and photo handouts.
- Built with love for Gavin's journey into Finnish. Onnea matkaan! 🎉
