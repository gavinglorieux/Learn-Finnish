#!/usr/bin/env python3
"""
Build the app's content/*.json from the reviewed source transcriptions and curated files.

Inputs (all committed):
  content/sources/**/<file>.json   one structured transcription per course file (see scripts/EXTRACTION_SPEC.md)
  content/curated/groups.json      vocabulary sections + groups
  content/curated/lessons.json     terms + per-class metadata (title, summary, topics)
  content/curated/drills.json      hand-written grammar drills (local cases, genitive, …)
  content/curated/word-fixes.json  corrections applied to merged words
  content/grammar/NN-*.json        the grammar course, one file per part

Outputs (generated — don't edit by hand):
  content/vocab.json      { sections, groups, words }
  content/texts.json      reading texts & dialogues with per-text glossary
  content/exercises.json  course exercises (with answers) + drills
  content/grammar.json    { parts, topics } with lesson back-links
  content/course.json     { terms, lessons }
  content/handouts.json   { source path: full transcript } (lazy-loaded)
  content/report.json     counts
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
SOURCES = CONTENT / "sources"
CURATED = CONTENT / "curated"
GRAMMAR_DIR = CONTENT / "grammar"

LESSON_RE = re.compile(r"Lesson (\d+) \((\d+)\.(\d+)\.(\d+)\)")

# Grammar ids used in the extraction spec that map onto a differently named grammar topic.
TOPIC_ALIASES = {
    "colours-adjectives": "adjectives",
    "likes-pitaa": "verb-patterns",
    "verb-infinitive-object": "verb-patterns",
}

POS_LABEL = {
    "noun": "noun", "verb": "verb", "adj": "adjective", "adv": "adverb", "pron": "pronoun",
    "num": "number", "prep": "preposition", "postp": "postposition", "conj": "conjunction",
    "phrase": "phrase", "interj": "interjection", "question": "question word", "proper": "name",
}


def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


def slug(s: str) -> str:
    s = nfc(s).lower()
    s = re.sub(r"[^\w]+", "-", s, flags=re.UNICODE).strip("-")
    return s or "x"


def short_hash(*parts: str) -> str:
    return hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()[:10]


def lesson_id(term: str, number: int) -> str:
    return f"{term}/lesson-{number:02d}"


def lesson_from_path(path: str) -> str | None:
    parts = nfc(path).split("/")
    m = LESSON_RE.search(path)
    if not m:
        return None
    return lesson_id(parts[0], int(m.group(1)))


def norm_en(s: str) -> str:
    s = s.lower().strip().rstrip(".!")
    s = re.sub(r"^(to|a|an|the) ", "", s)
    s = re.sub(r"\s*\(.*?\)\s*", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def clean_fi(s: str) -> str:
    s = nfc(s).strip()
    s = re.sub(r"\s+", " ", s)
    return s.strip(" .,;:")


def load_json(p: Path):
    return json.loads(p.read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- sources

def load_sources() -> list[dict]:
    out = []
    for p in sorted(SOURCES.rglob("*.json")):
        d = load_json(p)
        d["_file"] = str(p.relative_to(SOURCES))
        d["source"] = nfc(d["source"])
        d["also_in"] = [nfc(x) for x in d.get("also_in", [])]
        lessons = []
        for path in [d["source"], *d["also_in"]]:
            lid = lesson_from_path(path)
            if lid and lid not in lessons:
                lessons.append(lid)
        d["_lessons"] = lessons
        out.append(d)
    return out


# --------------------------------------------------------------------------- vocabulary

def build_vocab(sources: list[dict], groups_cfg: dict, fixes: dict) -> dict:
    group_ids = {g["id"] for g in groups_cfg["groups"]}
    aliases = groups_cfg.get("themeAliases", {})
    acc: dict[str, dict] = {}

    for src in sources:
        for w in src.get("words", []):
            fi = clean_fi(w.get("fi") or "")
            en = (w.get("en") or "").strip()
            if not fi or not en or len(fi) > 48:
                continue
            pos = w.get("pos") or "other"
            theme = aliases.get(w.get("theme") or "other", w.get("theme") or "other")
            if theme not in group_ids:
                theme = "other"
            if pos == "proper" and theme not in ("nationalities", "celebrations"):
                continue  # people's names etc.
            key = fi.lower() if pos != "proper" else fi
            a = acc.setdefault(key, {
                "fi": fi, "en": Counter(), "pos": Counter(), "group": Counter(), "verbType": Counter(),
                "forms": {}, "notes": [], "lessons": [], "sources": [], "uncertain": 0, "count": 0,
            })
            a["count"] += 1
            a["en"][en] += 1
            a["pos"][pos] += 1
            a["group"][theme] += 1
            if w.get("verb_type") in (1, 2, 3, 4, 5, 6):
                a["verbType"][w["verb_type"]] += 1
            for k, v in (w.get("forms") or {}).items():
                if isinstance(v, str) and v.strip():
                    a["forms"].setdefault(k, v.strip())
            note = (w.get("note") or "").strip()
            if note and note not in a["notes"] and len(a["notes"]) < 2 and len(note) < 120:
                a["notes"].append(note)
            for lid in src["_lessons"]:
                if lid not in a["lessons"]:
                    a["lessons"].append(lid)
            if src["source"] not in a["sources"]:
                a["sources"].append(src["source"])
            if w.get("uncertain"):
                a["uncertain"] += 1

    words = []
    used_ids: set[str] = set()
    for key, a in acc.items():
        # English: most frequent gloss first, then up to one more that adds a different meaning.
        ens: list[str] = []
        seen_norm: list[str] = []
        for e, _ in a["en"].most_common():
            n = norm_en(e)
            pieces = {norm_en(x) for x in re.split(r"[,;/]", e) if x.strip()}
            if any(n == s or n in s or s in n or any(pc and pc in s for pc in pieces) for s in seen_norm):
                continue
            ens.append(e)
            seen_norm.append(n)
            if len(ens) == 2:
                break
        pos = a["pos"].most_common(1)[0][0]
        group_counts = a["group"].most_common()
        group = group_counts[0][0]
        if group == "other" and len(group_counts) > 1:
            group = group_counts[1][0]
        verb_type = a["verbType"].most_common(1)[0][0] if a["verbType"] else None
        if pos == "verb" and group not in group_ids:
            group = "verbs"
        wid = slug(a["fi"])
        if wid in used_ids:
            wid = f"{wid}-{pos}"
        n = 2
        while wid in used_ids:
            wid = f"{slug(a['fi'])}-{n}"
            n += 1
        used_ids.add(wid)
        word = {
            "id": wid,
            "fi": a["fi"],
            "en": " / ".join(ens),
            "pos": pos,
            "group": group,
            "lessons": sorted(a["lessons"]),
        }
        if verb_type and pos == "verb":
            word["verbType"] = verb_type
        if a["forms"]:
            word["forms"] = a["forms"]
        if a["notes"]:
            word["note"] = "; ".join(a["notes"])
        if a["uncertain"] and a["uncertain"] == a["count"]:
            word["uncertain"] = True
        words.append(word)

    # Apply curated fixes: { "<fi>": { field: value, ... } | null (drop) }
    by_fi = {w["fi"].lower(): w for w in words}
    for fi, patch in fixes.items():
        w = by_fi.get(fi.lower())
        if not w:
            continue
        if patch is None:
            words.remove(w)
        else:
            w.update(patch)

    words.sort(key=lambda w: (w["group"], w["fi"].lower()))
    return {"sections": groups_cfg["sections"], "groups": groups_cfg["groups"], "words": words}


# --------------------------------------------------------------------------- texts

def build_texts(sources: list[dict]) -> list[dict]:
    texts = []
    seen = set()
    for src in sources:
        src_words = src.get("words", [])
        for i, t in enumerate(src.get("texts", [])):
            lines = [
                {k: v for k, v in {
                    "speaker": (ln.get("speaker") or "").strip() or None,
                    "fi": nfc((ln.get("fi") or "").strip()),
                    "en": (ln.get("en") or "").strip(),
                }.items() if v}
                for ln in t.get("lines", [])
                if (ln.get("fi") or "").strip()
            ]
            if len(lines) < 2:
                continue
            title = t.get("title") or {}
            title_fi = nfc((title.get("fi") or src["title"].get("fi") or "Teksti").strip())
            sig = (title_fi.lower(), lines[0]["fi"].lower())
            if sig in seen:
                continue
            seen.add(sig)
            # Only keep glossary entries for word forms that actually occur in this text.
            tokens = {re.sub(r"[^\w-]", "", tok.lower()) for ln in lines for tok in ln["fi"].split()}
            glossary = {}
            for w in src_words:
                fi = clean_fi(w.get("fi") or "")
                en = (w.get("en") or "").strip()
                if not fi or not en:
                    continue
                for form in {fi.lower(), clean_fi(w.get("form_seen") or "").lower()} - {""}:
                    if form in tokens:
                        glossary.setdefault(form, {"fi": fi, "en": en})
            texts.append({
                "id": f"{slug(title_fi)[:40]}-{short_hash(src['source'], str(i))[:6]}",
                "title": {"fi": title_fi, "en": (title.get("en") or src["title"].get("en") or "").strip()},
                "kind": t.get("kind") or "reading",
                "lessons": src["_lessons"],
                "topics": [TOPIC_ALIASES.get(x, x) for x in src.get("topics", [])],
                "source": src["source"],
                "lines": lines,
                "glossary": [{"form": k, **v} for k, v in sorted(glossary.items())],
            })
    return texts


# --------------------------------------------------------------------------- exercises

ENGLISH = re.compile(r"\b(the|is|are|I|you|we|they|do|does|what|where|how|my|your|have|has|an?|in|to|this|it)\b", re.I)
# Guessing games and open questions don't make fair typed exercises.
SKIP_EXERCISE_TITLES = re.compile(r"kuka minä olen|who am i", re.I)

PLACEHOLDER = re.compile(r"(own answer|student|teacher says|depends|vapaa|esim\.|e\.g\.|\.\.\.|…)", re.I)


def build_exercises(sources: list[dict], drills: list[dict], grammar_ids: set[str]) -> list[dict]:
    out = []
    for src in sources:
        for i, ex in enumerate(src.get("exercises", [])):
            if SKIP_EXERCISE_TITLES.search(ex.get("title") or ""):
                continue
            items = []
            for it in ex.get("items", []):
                prompt = nfc((it.get("prompt") or "").strip())
                answer = nfc(str(it.get("answer") or "").strip())
                if not prompt or not answer or len(answer) > 48 or PLACEHOLDER.search(answer):
                    continue
                answer = re.sub(r"\s*\([^)]*\)", "", answer).strip()
                prompt = re.sub(r"_{2,}", "____", prompt)
                prompt = re.sub(r"____(?:\s+____)+", "____", prompt)  # multi-word answer → one gap
                if prompt.count("____") > 1:
                    continue
                # Without a gap the item must be a translation (English prompt) or have a short answer;
                # open comprehension questions ("Kuka pelaa jääkiekkoa?") can't be marked by string match.
                if "____" not in prompt and len(answer.split()) > 3 and not ENGLISH.search(prompt):
                    continue
                item = {"prompt": prompt, "answer": answer}
                if it.get("base"):
                    item["base"] = nfc(str(it["base"]).strip())
                if it.get("en"):
                    item["en"] = str(it["en"]).strip()
                items.append(item)
            if len(items) < 3:
                continue
            topic = TOPIC_ALIASES.get(ex.get("topic") or "", ex.get("topic") or "")
            out.append({
                "id": f"ex-{short_hash(src['source'], str(i))}",
                "title": (ex.get("title") or src["title"].get("en") or src["title"].get("fi") or "Exercise").strip(),
                "instruction": (ex.get("instruction") or "").strip() or None,
                "topic": topic if topic in grammar_ids else None,
                "lessons": src["_lessons"],
                "source": src["source"],
                "answerSource": ex.get("answer_source") or "derived",
                "kind": "course",
                "items": items,
            })
    for d in drills:
        out.append({**d, "kind": "drill", "lessons": [], "answerSource": "curated"})
    for ex in out:
        if ex.get("instruction") is None:
            ex.pop("instruction", None)
        if ex.get("topic") is None:
            ex.pop("topic", None)
    return out


# --------------------------------------------------------------------------- grammar

LINK_RE = re.compile(r"\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]")


def build_grammar(lessons: list[dict]) -> dict:
    parts, topics = [], []
    for p in sorted(GRAMMAR_DIR.glob("*.json")):
        d = load_json(p)
        part = dict(d["part"])
        part["topics"] = [t["id"] for t in d["topics"]]
        parts.append(part)
        for t in d["topics"]:
            topics.append({**t, "part": part["id"]})
    ids = {t["id"] for t in topics}
    errors = []
    for t in topics:
        for k in ("requires", "related"):
            for ref in t.get(k, []):
                if ref not in ids:
                    errors.append(f"{t['id']}.{k} → unknown topic {ref}")
        blob = json.dumps(t["sections"], ensure_ascii=False)
        for ref in LINK_RE.findall(blob):
            if ref not in ids:
                errors.append(f"{t['id']} links to unknown topic {ref}")
        t["lessons"] = [l["id"] for l in lessons if t["id"] in l["topics"]]
    if errors:
        print("grammar link errors:\n  " + "\n  ".join(errors), file=sys.stderr)
        raise SystemExit(1)
    return {"parts": parts, "topics": topics}


# --------------------------------------------------------------------------- course

def build_course(sources, lessons_cfg, texts, exercises, vocab, grammar_ids) -> dict:
    by_lesson_sources = defaultdict(list)
    for s in sources:
        for lid in s["_lessons"]:
            by_lesson_sources[lid].append(s)
    lessons = []
    for l in lessons_cfg["lessons"]:
        lid = lesson_id(l["term"], l["number"])
        srcs = by_lesson_sources.get(lid, [])
        topics = list(l.get("topics", []))
        # Curated topics first; only grammar handouts add more (other sheets' topic tags are too loose).
        for s in srcs:
            if s.get("kind") != "grammar":
                continue
            for t in s.get("topics", []):
                t = TOPIC_ALIASES.get(t, t)
                if t in grammar_ids and t not in topics:
                    topics.append(t)
        words = [w for w in vocab["words"] if lid in w["lessons"]]
        group_counts = Counter(w["group"] for w in words)
        lessons.append({
            "id": lid,
            "term": l["term"],
            "number": l["number"],
            "date": l["date"],
            "title": l["title"],
            "summary": l["summary"],
            "topics": [t for t in topics if t in grammar_ids],
            "groups": [g for g, _ in group_counts.most_common(8)],
            "wordCount": len(words),
            "texts": [t["id"] for t in texts if lid in t["lessons"]],
            "exercises": [e["id"] for e in exercises if lid in e.get("lessons", [])],
            "materials": [
                {"title": s["title"], "kind": s.get("kind"), "summary": s.get("summary"), "source": s["source"]}
                for s in srcs
            ],
            **({"pending": l["gmailOnly"]} if l.get("gmailOnly") else {}),
        })
    known = {l["id"] for l in lessons}
    orphan = sorted({lid for lid in by_lesson_sources if lid not in known})
    if orphan:
        print("warning: lessons with sources but no curated metadata:", orphan, file=sys.stderr)
    return {"terms": lessons_cfg["terms"], "lessons": lessons}


def main() -> int:
    sources = load_sources()
    groups_cfg = load_json(CURATED / "groups.json")
    lessons_cfg = load_json(CURATED / "lessons.json")
    drills = load_json(CURATED / "drills.json") if (CURATED / "drills.json").exists() else []
    fixes = load_json(CURATED / "word-fixes.json") if (CURATED / "word-fixes.json").exists() else {}

    # Lesson ids (needed for grammar back-links)
    lesson_stub = [{"id": lesson_id(l["term"], l["number"]), "topics": l.get("topics", [])} for l in lessons_cfg["lessons"]]
    grammar = build_grammar(lesson_stub)
    grammar_ids = {t["id"] for t in grammar["topics"]}

    vocab = build_vocab(sources, groups_cfg, fixes)
    texts = build_texts(sources)
    exercises = build_exercises(sources, drills, grammar_ids)
    course = build_course(sources, lessons_cfg, texts, exercises, vocab, grammar_ids)

    # Recompute grammar back-links with source-derived topics included.
    for t in grammar["topics"]:
        t["lessons"] = [l["id"] for l in course["lessons"] if t["id"] in l["topics"]]

    def write(name, data):
        (CONTENT / name).write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    write("vocab.json", vocab)
    write("texts.json", texts)
    write("exercises.json", exercises)
    write("grammar.json", grammar)
    write("course.json", course)
    # Full handout transcripts are large; the app lazy-loads them on the lesson page.
    write("handouts.json", {s["source"]: s.get("transcript") or "" for s in sources})
    report = {
        "sources": len(sources),
        "words": len(vocab["words"]),
        "groups": len(vocab["groups"]),
        "grammarTopics": len(grammar["topics"]),
        "lessons": len(course["lessons"]),
        "texts": len(texts),
        "exercises": len(exercises),
        "exerciseItems": sum(len(e["items"]) for e in exercises),
        "wordsByGroup": dict(Counter(w["group"] for w in vocab["words"]).most_common()),
    }
    write("report.json", report)
    for k, v in report.items():
        if k != "wordsByGroup":
            print(f"{k:15s} {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
