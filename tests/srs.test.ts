import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ensureEntry, review, dueWordIds, masteryLevel } from '../src/lib/srs.ts'

test('ensureEntry creates a fresh entry', () => {
  const store = {}
  const e = ensureEntry(store, 'w1')
  assert.equal(e.wordId, 'w1')
  assert.equal(e.box, 0)
  assert.equal(store['w1'], e)
})

test('review increments box on correct, decrements on wrong, bounded', () => {
  const store = {}
  for (let i = 0; i < 10; i++) review(store, 'w1', true)
  assert.equal(store['w1'].box, 5) // max box
  review(store, 'w1', false)
  assert.equal(store['w1'].box, 4) // one less
  review(store, 'w1', false)
  review(store, 'w1', false)
  review(store, 'w1', false)
  review(store, 'w1', false)
  review(store, 'w1', false)
  assert.equal(store['w1'].box, 0) // floor
})

test('dueWordIds returns only due words', () => {
  const store = {}
  ensureEntry(store, 'a').nextReview = Date.now() - 1000
  ensureEntry(store, 'b').nextReview = Date.now() + 1_000_000
  const due = dueWordIds(store)
  assert.deepEqual(due, ['a'])
})

test('masteryLevel scales 0-1', () => {
  const store = {}
  const e = ensureEntry(store, 'w')
  assert.equal(masteryLevel(e), 0)
  e.box = 5
  assert.equal(masteryLevel(e), 1)
  e.box = 3
  assert.ok(masteryLevel(e) > 0 && masteryLevel(e) < 1)
})
