import { test } from 'node:test'
import assert from 'node:assert/strict'
import { answerMatches, shuffle, sampleN } from '../src/lib/utils.ts'

test('answerMatches: case and punctuation tolerant', () => {
  assert.ok(answerMatches('Puhun', 'puhun'))
  assert.ok(answerMatches('  puhun.  ', 'puhun'))
  assert.ok(!answerMatches('puhumme', 'puhun'))
  assert.ok(answerMatches('hyvää päivää', 'Hyvää päivää'))
})

test('shuffle returns same length', () => {
  const arr = [1, 2, 3, 4, 5]
  assert.equal(shuffle(arr).length, arr.length)
})

test('sampleN bounded by array length', () => {
  assert.equal(sampleN([1, 2, 3], 10).length, 3)
  assert.equal(sampleN([1, 2, 3], 2).length, 2)
})
