import { test } from 'node:test'
import assert from 'node:assert/strict'
import vocab from '../content/vocab.json' with { type: 'json' }
import grammar from '../content/grammar.json' with { type: 'json' }
import texts from '../content/texts.json' with { type: 'json' }
import exercises from '../content/exercises.json' with { type: 'json' }
import course from '../content/course.json' with { type: 'json' }
import { conjugate } from '../src/data/conjugate.ts'

// These tests pin the shape of the generated content (scripts/build-content.py) so a
// rebuild can't silently break the app. Update them if the schema changes on purpose.

const lessonIds = new Set(course.lessons.map((l) => l.id))
const topicIds = new Set(grammar.topics.map((t) => t.id))
const groupIds = new Set(vocab.groups.map((g) => g.id))

test('vocabulary: unique ids, known groups and lessons, non-empty glosses', () => {
  assert.ok(vocab.words.length > 1500, `only ${vocab.words.length} words`)
  const ids = new Set<string>()
  for (const w of vocab.words) {
    assert.ok(!ids.has(w.id), `duplicate word id ${w.id}`)
    ids.add(w.id)
    assert.ok(w.fi.trim() && w.en.trim(), `empty word ${w.id}`)
    assert.ok(groupIds.has(w.group), `${w.fi}: unknown group ${w.group}`)
    for (const l of w.lessons) assert.ok(lessonIds.has(l), `${w.fi}: unknown lesson ${l}`)
  }
  for (const s of vocab.sections) for (const g of s.groups) assert.ok(groupIds.has(g), `section ${s.id}: unknown group ${g}`)
})

test('vocabulary: every course verb has a type that matches the conjugation engine', () => {
  const verbs = vocab.words.filter((w) => w.pos === 'verb' && 'verbType' in w && /^[a-zåäö]+$/i.test(w.fi))
  assert.ok(verbs.length > 150)
  for (const w of verbs) {
    const c = conjugate(w.fi, (w as { verbType: 1 | 2 | 3 | 4 | 5 | 6 }).verbType)
    assert.equal(conjugate(w.fi).type, c.type, `${w.fi}: given type ${c.type}, detected ${conjugate(w.fi).type}`)
    for (const [person, form] of Object.entries((w as { forms?: Record<string, string> }).forms ?? {})) {
      const expected = (c.forms as Record<string, string>)[person]
      if (expected) assert.equal(form.toLowerCase(), expected, `${w.fi} ${person}`)
    }
  }
})

test('grammar: parts reference real topics, cross-links resolve', () => {
  assert.ok(grammar.topics.length >= 40)
  for (const p of grammar.parts) for (const id of p.topics) assert.ok(topicIds.has(id), `part ${p.id}: ${id}`)
  for (const t of grammar.topics) {
    assert.ok(t.summary && t.sections.length > 0, `${t.id} is empty`)
    for (const r of [...(t.requires ?? []), ...(t.related ?? [])]) assert.ok(topicIds.has(r), `${t.id} → ${r}`)
    for (const m of JSON.stringify(t.sections).matchAll(/\[\[([a-z0-9-]+)/g)) assert.ok(topicIds.has(m[1]), `${t.id} links ${m[1]}`)
    for (const l of t.lessons) assert.ok(lessonIds.has(l))
  }
})

test('texts: lines and lessons', () => {
  assert.ok(texts.length > 30)
  for (const t of texts) {
    assert.ok(t.lines.length >= 2, `${t.id} too short`)
    for (const ln of t.lines) assert.ok(ln.fi.trim(), `${t.id} has an empty line`)
    for (const l of t.lessons) assert.ok(lessonIds.has(l), `${t.id}: ${l}`)
  }
})

test('exercises: every item has a prompt and an answer; drills point at grammar', () => {
  assert.ok(exercises.length > 50)
  const ids = new Set<string>()
  for (const ex of exercises) {
    assert.ok(!ids.has(ex.id), `duplicate exercise ${ex.id}`)
    ids.add(ex.id)
    assert.ok(ex.items.length >= 3, `${ex.id} has too few items`)
    if ('topic' in ex && ex.topic) assert.ok(topicIds.has(ex.topic), `${ex.id}: topic ${ex.topic}`)
    for (const it of ex.items) {
      assert.ok(it.prompt.trim() && it.answer.trim(), `${ex.id}: empty item`)
      assert.ok((it.prompt.match(/____/g) ?? []).length <= 1, `${ex.id}: several blanks in "${it.prompt}"`)
      assert.ok(!it.answer.includes('__'), `${ex.id}: answer "${it.answer}" is itself a gap (open question)`)
    }
  }
  assert.ok(exercises.filter((e) => e.kind === 'drill').length >= 10)
})

test('course: lessons are unique, dated and cross-reference real content', () => {
  const textIds = new Set(texts.map((t) => t.id))
  const exIds = new Set(exercises.map((e) => e.id))
  const termIds = new Set(course.terms.map((t) => t.id))
  assert.equal(lessonIds.size, course.lessons.length)
  for (const l of course.lessons) {
    assert.ok(termIds.has(l.term), `${l.id}: term`)
    assert.match(l.date, /^\d{4}-\d{2}-\d{2}$/)
    for (const t of l.topics) assert.ok(topicIds.has(t), `${l.id}: topic ${t}`)
    for (const t of l.texts) assert.ok(textIds.has(t), `${l.id}: text ${t}`)
    for (const e of l.exercises) assert.ok(exIds.has(e), `${l.id}: exercise ${e}`)
  }
})
