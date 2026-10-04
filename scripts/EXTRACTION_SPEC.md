# Source extraction spec

Every course source file (worksheet photo, .docx, .pdf, .odt) gets one faithful,
structured transcription in `content/sources/<term>/<Lesson N (D.M.YYYY)>/<file name>.json`.
These files are the reviewed, committed bridge between `raw/` (not committed) and the
app content; `scripts/build-content.py` merges them into `content/*.json`.

Images are transcribed by reading them (Claude vision); documents start from the
pandoc/pdftotext output in `parsed/` (`scripts/parse-docs.sh`).

## Shape

```jsonc
{
  "source": "term-2026-winter/Lesson 3 (26.1.2026)/1769362934610.jpg",  // path under raw/
  "md5": "…",                                   // optional
  "lesson": { "term": "term-2026-winter", "number": 3, "date": "2026-01-26" },
  "kind": "vocab_list | text | dialogue | grammar | exercise | worksheet | picture_vocab | other",
  "title": { "fi": "VERBITYYPPI 3", "en": "Verb type 3" },
  "topics": ["verb-type-3", "kpt-verbs"],       // GRAMMAR IDS below (only ones genuinely present)
  "summary": "One or two English sentences: what is on this sheet.",

  // Faithful transcription of all Finnish text on the page, line by line, exact diacritics.
  // Blanks in exercises as ____ . Keep numbering. No English unless the sheet has it.
  "transcript": "…",

  // EVERY content word that appears (lists, picture labels, reading texts, dialogues,
  // exercise sentences). Base/dictionary form in "fi" (nominative singular / infinitive);
  // "form_seen" = the inflected form when different. English gloss for the meaning used here.
  "words": [
    {
      "fi": "nukkua", "en": "to sleep",
      "pos": "noun | verb | adj | adv | pron | num | prep | postp | conj | phrase | interj | question | proper",
      "verb_type": 1,                    // verbs only (1–6)
      "forms": { "minä": "nukun", "hän": "nukkuu" },   // optional, only if shown/useful (KPT!)
      "form_seen": "nukun",              // optional
      "theme": "daily-routine",          // one THEME id below (best fit)
      "note": "kk → k"                   // optional short note (gradation, irregular, plural only…)
    }
  ],

  // Reading texts and dialogues, split into sentences/lines, each with an English translation.
  "texts": [
    {
      "title": { "fi": "Syksyllä mökillä on paljon töitä", "en": "In autumn there's lots of work at the cottage" },
      "kind": "reading | dialogue",
      "lines": [ { "speaker": "A", "fi": "Hei! Mitä kuuluu?", "en": "Hi! How are you?" } ]
    }
  ],

  // Exercises. One item per gap. "prompt" is the Finnish sentence with ____ where the answer goes;
  // "base" is the word given in brackets (if any); "answer" is the correct fill (from the key if
  // there is one; otherwise your own correct answer, and set "answer_source": "derived").
  "exercises": [
    {
      "title": "Exercise 20. K-p-t — write the verbs",
      "instruction": "Write the correct form of the verb.",
      "topic": "kpt-verbs",
      "answer_source": "key | derived",
      "items": [ { "prompt": "Minä ____ kirjaa.", "base": "lukea", "answer": "luen", "en": "I am reading a book." } ]
    }
  ],

  // Grammar rules / tables exactly as the sheet presents them (for the grammar writers).
  "grammar_notes": [ { "topic": "verb-type-3", "heading": "…", "text": "…", "table": [["minä", "tulen"]] } ]
}
```

Rules:
- Exact Finnish orthography (ä ö å, double letters). If a handwritten word is unclear, give your
  best reading and add `"uncertain": true` to that word / line.
- Translations: natural English. Check unusual words against Wiktionary if unsure.
- Don't invent content that isn't on the page — except English glosses and derived answers.
- Drop names of people/places from `words` unless they're useful vocabulary (Suomi, Helsinki OK).

## GRAMMAR IDS

pronunciation, long-short, vowel-harmony, pronouns, olla, negation, questions-ko, question-words,
numbers, nationalities, greetings, genitive, possessive, have-adessive, partitive, partitive-plural,
plural, adjectives, colours-adjectives, verb-types, verb-type-1, verb-type-2, verb-type-3,
verb-type-4, verb-type-5, verb-type-6, kpt-verbs, kpt-verbs-3-4, kpt-nouns, imperative,
local-cases, inner-local-cases, outer-local-cases, illative, locative-verbs, place-names,
postpositions, clock, days-dates, months-seasons, weather, likes-pitaa, verb-infinitive-object,
object-case, past-tense, other

## THEMES

greetings, classroom, numbers, question-words, little-words, people, family, body, professions,
nationalities, appearance, feelings, days-time, months-seasons, clock, celebrations, home,
furniture, household, garden, cottage, food-fruit-veg, food-meals, drinks, tableware, cafe-shop,
shopping-money, weather, nature, farm-animals, animals, places-town, transport, travel, directions,
illness, health, hobbies-sport, winter, yoga, clothes, colours, school-work, daily-routine,
common-verbs, adjectives, adverbs, postpositions, other
