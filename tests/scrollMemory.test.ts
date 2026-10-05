import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createScrollMemory } from '../src/lib/scrollMemory.ts'

test('scrollMemory: a new screen starts at the top', () => {
  const m = createScrollMemory()
  m.save('a', 900)
  assert.equal(m.target({ key: 'a', pathname: '/grammar', type: 'POP' }, { key: 'b', pathname: '/grammar/weather', type: 'PUSH' }), 0)
  assert.equal(m.target(null, { key: 'c', pathname: '/', type: 'REPLACE' }), 0)
})

test('scrollMemory: back/forward restores the saved position', () => {
  const m = createScrollMemory()
  m.save('a', 900)
  assert.equal(m.target({ key: 'b', pathname: '/grammar/weather', type: 'PUSH' }, { key: 'a', pathname: '/grammar', type: 'POP' }), 900)
})

test('scrollMemory: deep link / unknown entry starts at the top', () => {
  const m = createScrollMemory()
  assert.equal(m.target(null, { key: 'default', pathname: '/grammar/weather', type: 'POP' }), 0)
})

test('scrollMemory: same pathname (query/state only) does not jump', () => {
  const m = createScrollMemory()
  assert.equal(m.target({ key: 'a', pathname: '/practice/x', type: 'PUSH' }, { key: 'b', pathname: '/practice/x', type: 'REPLACE' }), null)
})

test('scrollMemory: evicts oldest entries past the limit', () => {
  const m = createScrollMemory(2)
  m.save('a', 1); m.save('b', 2); m.save('c', 3)
  const pop = (key: string) => m.target(null, { key, pathname: '/', type: 'POP' })
  assert.equal(pop('a'), 0)
  assert.equal(pop('b'), 2)
  assert.equal(pop('c'), 3)
})
