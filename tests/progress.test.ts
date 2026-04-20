import { test } from 'node:test'
import assert from 'node:assert/strict'
import { levelFromTotal, xpForNextLevel, xpProgressInLevel } from '../src/lib/progress.ts'

test('levelFromTotal monotonic increase', () => {
  assert.equal(levelFromTotal(0), 1)
  assert.ok(levelFromTotal(100) >= 2)
  assert.ok(levelFromTotal(10_000) >= 15)
})

test('xpForNextLevel is positive', () => {
  for (let lvl = 1; lvl < 20; lvl++) assert.ok(xpForNextLevel(lvl) > 0)
})

test('xpProgressInLevel: current <= required', () => {
  const { current, required } = xpProgressInLevel(120, levelFromTotal(120))
  assert.ok(current >= 0)
  assert.ok(current < required)
})
