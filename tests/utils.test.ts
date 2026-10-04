import { test } from 'node:test'
import assert from 'node:assert/strict'
import { answerMatches, answerVariants, glossKey, shuffle, sampleN, uniqueBy } from '../src/lib/utils.ts'

test('answerMatches: case and punctuation tolerant', () => {
  assert.ok(answerMatches('Puhun', 'puhun'))
  assert.ok(answerMatches('  puhun.  ', 'puhun'))
  assert.ok(!answerMatches('puhumme', 'puhun'))
  assert.ok(answerMatches('hyvää päivää', 'Hyvää päivää'))
})

test('answerMatches: typed hyphen matches an en dash, spacing around it is free', () => {
  assert.ok(answerMatches('ei - eikä', 'ei – eikä'))
  assert.ok(answerMatches('ei-eikä', 'ei – eikä'))
  assert.ok(answerMatches('joko – tai', 'joko – tai'))
})

test('answerMatches: bracketed parts of the target are optional', () => {
  assert.ok(answerMatches('mitä kuuluu', 'mitä (sinulle) kuuluu?'))
  assert.ok(answerMatches('mitä sinulle kuuluu?', 'mitä (sinulle) kuuluu?'))
  assert.ok(!answerMatches('mitä', 'mitä (sinulle) kuuluu?'))
  assert.deepEqual(answerVariants('kiitos'), ['kiitos'])
})

test('glossKey: same meaning collides, different meaning does not', () => {
  assert.equal(glossKey('Grandma'), glossKey("grandma (mother's side)"))
  assert.equal(glossKey('to put'), glossKey('put'))
  assert.notEqual(glossKey('grandma'), glossKey('grandpa'))
})

test('uniqueBy keeps the first item per key', () => {
  assert.deepEqual(uniqueBy([{ k: 'a', v: 1 }, { k: 'a', v: 2 }, { k: 'b', v: 3 }], (x) => x.k).map((x) => x.v), [1, 3])
})

test('shuffle returns same length', () => {
  const arr = [1, 2, 3, 4, 5]
  assert.equal(shuffle(arr).length, arr.length)
})

test('sampleN bounded by array length', () => {
  assert.equal(sampleN([1, 2, 3], 10).length, 3)
  assert.equal(sampleN([1, 2, 3], 2).length, 2)
})
