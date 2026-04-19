#!/usr/bin/env python3
"""
Normalize ./parsed/ into ./content/ — the canonical dataset the app consumes.

Inputs:
  parsed/<term>/<Lesson N (D.M.YYYY)>/<name>.jpg.json    (vision output)
  parsed/<term>/<Lesson N (D.M.YYYY)>/<name>.docx.md     (pandoc output)
  parsed/<term>/<Lesson N (D.M.YYYY)>/<name>.odt.md      (pandoc output)
  parsed/<term>/<Lesson N (D.M.YYYY)>/<name>.pdf.txt     (pdftotext output)

Outputs:
  content/lessons.json — ordered list of lessons, each referencing item IDs
  content/items.json   — all content items (structured + doc bodies)
  content/topics.json  — { canonical_topic: [item_ids, ...] }
  content/report.json  — pipeline stats (counts, dedup, tag aliases applied)

Items are identified by a 12-char content hash so re-runs are stable and
duplicates (the same sheet re-used across two lessons) collapse to one item
with multiple `lessons` entries.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARSED = ROOT / "parsed"
CONTENT = ROOT / "content"

# --- Topic canonicalization ------------------------------------------------
# Merge near-duplicates into a single canonical form.
TOPIC_ALIASES: dict[str, str] = {
    # Cases — collapse "X" and "X_case" → "X_case"
    "nominative": "nominative_case",
    "genitive": "genitive_case",
    "partitive": "partitive_case",
    "inessive": "inessive_case",
    "elative": "elative_case",
    "illative": "illative_case",
    "adessive": "adessive_case",
    "ablative": "ablative_case",
    "allative": "allative_case",
    "essive": "essive_case",
    "translative": "translative_case",
    "abessive": "abessive_case",
    "comitative": "comitative_case",
    "instructive": "instructive_case",
    # Verb types
    "verb_type_1": "verb_type_1",
    "verb_type_2": "verb_type_2",
    "verb_type_3": "verb_type_3",
    "verb_type_4": "verb_type_4",
    "verb_type_5": "verb_type_5",
    "verbityyppi_1": "verb_type_1",
    "verbityyppi_2": "verb_type_2",
    "verbityyppi_3": "verb_type_3",
    "verbityyppi_4": "verb_type_4",
    "verbityyppi_5": "verb_type_5",
    # Common synonyms
    "days_of_week": "days_of_the_week",
    "months_of_year": "months",
    "telling_time": "time",
    "kpt_gradation": "consonant_gradation",
    "k_p_t_gradation": "consonant_gradation",
    "astevaihtelu": "consonant_gradation",
    # Health/illness
    "sickness": "illness",
    "sairastaminen": "illness",
    "symptoms": "symptoms",
    # Weather
    "sää": "weather",
    "saa": "weather",
    # Housing
    "asunto": "housing",
    "home": "housing",
    # Food
    "foods": "food",
    "drinks": "beverages",
    # Clothing
    "clothes": "clothing",
    "clothing_items": "clothing",
    # Colours
    "colors": "colours",
    "värit": "colours",
}


def canonical_topic(tag: str) -> str:
    tag = tag.strip().lower().replace(" ", "_").replace("-", "_")
    return TOPIC_ALIASES.get(tag, tag)


# --- Lesson path parsing ---------------------------------------------------
LESSON_RE = re.compile(r"^Lesson (\d+) \((\d+)\.(\d+)\.(\d+)\)$")


def parse_lesson_ref(rel_path: Path) -> dict | None:
    """Extract lesson metadata from a path like term-2025-autumn/Lesson 1 (1.9.2025)/..."""
    parts = rel_path.parts
    if len(parts) < 2:
        return None
    term = parts[0]
    # Lesson folder may be parts[1], but some files nest deeper (e.g. Lesson 2/Ammatit/foo.jpg)
    lesson_folder = None
    for p in parts[1:]:
        m = LESSON_RE.match(p)
        if m:
            lesson_folder = p
            num = int(m.group(1))
            day = int(m.group(2))
            month = int(m.group(3))
            year = int(m.group(4))
            return {
                "term": term,
                "number": num,
                "date": f"{year:04d}-{month:02d}-{day:02d}",
                "folder": lesson_folder,
            }
    return None


# --- Content hashing -------------------------------------------------------
def stable_hash(obj) -> str:
    """12-char SHA-256 prefix, stable across runs."""
    if isinstance(obj, (dict, list)):
        s = json.dumps(obj, sort_keys=True, ensure_ascii=False)
    else:
        s = str(obj)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:12]


# --- Item construction -----------------------------------------------------
def build_image_item(json_path: Path) -> dict:
    rel = json_path.relative_to(PARSED)
    data = json.loads(json_path.read_text(encoding="utf-8"))
    lesson = parse_lesson_ref(rel)

    # Canonicalize topics
    raw_topics = data.get("topics", []) or []
    topics = sorted({canonical_topic(t) for t in raw_topics})

    # Hash the semantic content (sections); fall back to the whole doc
    content_for_hash = data.get("sections") or data
    content_hash = stable_hash(content_for_hash)

    return {
        "id": content_hash,
        "title": data.get("title", {}),
        "type": data.get("type", "notes"),
        "topics": topics,
        "content": {
            "format": "structured",
            "sections": data.get("sections", []),
            **{k: v for k, v in data.items() if k not in {"source", "title", "type", "topics", "sections"}},
        },
        "_lesson": lesson,
        "_source_path": str(rel).removesuffix(".json"),  # underlying jpg
        "_source_kind": "image",
    }


def build_doc_item(doc_path: Path) -> dict:
    rel = doc_path.relative_to(PARSED)
    text = doc_path.read_text(encoding="utf-8")
    lesson = parse_lesson_ref(rel)

    name = rel.name
    # Strip double extension: foo.docx.md → foo   /   foo.pdf.txt → foo
    base = re.sub(r"\.(docx|odt|pdf)\.(md|txt)$", "", name)
    if name.endswith(".md"):
        fmt, source_kind = "markdown", "docx" if name.endswith(".docx.md") else "odt"
    else:
        fmt, source_kind = "plaintext", "pdf"

    content_hash = stable_hash(text)

    # Source path is the raw file (not the parsed one)
    source_path = str(rel).removesuffix(".md").removesuffix(".txt")

    return {
        "id": content_hash,
        "title": {"fi": base, "en": None},
        "type": "document",
        "topics": [],
        "content": {
            "format": fmt,
            "body": text,
        },
        "_lesson": lesson,
        "_source_path": source_path,
        "_source_kind": source_kind,
    }


# --- Main ------------------------------------------------------------------
def main() -> int:
    if not PARSED.exists():
        print(f"error: {PARSED} does not exist. Run parse-docs.sh first.")
        return 1

    CONTENT.mkdir(exist_ok=True)

    raw_items: list[dict] = []
    for p in sorted(PARSED.rglob("*.jpg.json")):
        raw_items.append(build_image_item(p))
    for p in sorted(PARSED.rglob("*.docx.md")):
        raw_items.append(build_doc_item(p))
    for p in sorted(PARSED.rglob("*.odt.md")):
        raw_items.append(build_doc_item(p))
    for p in sorted(PARSED.rglob("*.pdf.txt")):
        raw_items.append(build_doc_item(p))

    # Dedupe by id (content hash). Merge lesson & source references.
    merged: dict[str, dict] = {}
    for it in raw_items:
        iid = it["id"]
        if iid not in merged:
            # Extract _lesson/_source into lists
            first_lesson = it.pop("_lesson")
            first_source = {"path": it.pop("_source_path"), "kind": it.pop("_source_kind")}
            it["lessons"] = [first_lesson] if first_lesson else []
            it["sources"] = [first_source]
            merged[iid] = it
        else:
            target = merged[iid]
            lesson = it.get("_lesson")
            if lesson and lesson not in target["lessons"]:
                target["lessons"].append(lesson)
            src = {"path": it.get("_source_path"), "kind": it.get("_source_kind")}
            if src not in target["sources"]:
                target["sources"].append(src)

    items = list(merged.values())

    # Sort lesson lists within each item for deterministic output
    for it in items:
        it["lessons"].sort(key=lambda l: (l["term"], l["number"]))
        it["sources"].sort(key=lambda s: s["path"])

    # Build lessons.json — group items by lesson (term, number)
    lessons_map: dict[tuple, dict] = {}
    for it in items:
        for lesson in it["lessons"]:
            key = (lesson["term"], lesson["number"])
            if key not in lessons_map:
                lessons_map[key] = {
                    "id": f"{lesson['term']}/lesson-{lesson['number']:02d}",
                    "term": lesson["term"],
                    "number": lesson["number"],
                    "date": lesson["date"],
                    "item_ids": [],
                }
            if it["id"] not in lessons_map[key]["item_ids"]:
                lessons_map[key]["item_ids"].append(it["id"])

    lessons = sorted(lessons_map.values(), key=lambda l: (l["term"], l["number"]))

    # Build topics.json — map of topic → item ids
    topics_index: dict[str, list[str]] = defaultdict(list)
    for it in items:
        for t in it["topics"]:
            topics_index[t].append(it["id"])
    topics = {t: sorted(ids) for t, ids in sorted(topics_index.items())}

    # Type breakdown (for report)
    type_counts = Counter(it["type"] for it in items)
    dedupe_saved = len(raw_items) - len(items)
    aliased_topics_used = sorted({
        v for k, v in TOPIC_ALIASES.items() if v != k and v in topics_index
    })

    # Write outputs
    (CONTENT / "items.json").write_text(
        json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (CONTENT / "lessons.json").write_text(
        json.dumps(lessons, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (CONTENT / "topics.json").write_text(
        json.dumps(topics, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    report = {
        "source_files": len(raw_items),
        "unique_items": len(items),
        "duplicates_merged": dedupe_saved,
        "lessons": len(lessons),
        "topics": len(topics),
        "types": dict(type_counts),
        "topic_aliases_applied": aliased_topics_used,
    }
    (CONTENT / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Console summary
    print(f"source files      : {len(raw_items)}")
    print(f"unique items      : {len(items)}  (merged {dedupe_saved} duplicates)")
    print(f"lessons           : {len(lessons)}")
    print(f"topics            : {len(topics)}")
    print(f"types             :")
    for t, n in type_counts.most_common():
        print(f"  {n:3d}  {t}")
    print(f"output            : {CONTENT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
