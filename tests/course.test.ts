import { test } from 'node:test'
import assert from 'node:assert/strict'
import itemsJson from '../content/items.json' with { type: 'json' }
import lessonsJson from '../content/lessons.json' with { type: 'json' }
import topicsJson from '../content/topics.json' with { type: 'json' }

// These tests pin the shape of the content pipeline so future parser runs can't
// silently break the app. Re-run the parser and regenerate the content/ files,
// then update these assertions if the schema intentionally changes.

test('items.json has expected shape', () => {
  assert.ok(Array.isArray(itemsJson))
  assert.ok(itemsJson.length > 50)
  const sample = itemsJson[0] as Record<string, unknown>
  assert.ok('id' in sample)
  assert.ok('title' in sample)
  assert.ok('type' in sample)
  assert.ok('topics' in sample)
  assert.ok('content' in sample)
  assert.ok('lessons' in sample)
})

test('every item has a stable hex id', () => {
  for (const it of itemsJson as Array<{ id: string }>) {
    assert.ok(/^[0-9a-f]{8,}$/i.test(it.id), `bad id ${it.id}`)
  }
})

test('lessons.json references real item ids', () => {
  const itemIds = new Set((itemsJson as Array<{ id: string }>).map((i) => i.id))
  for (const lesson of lessonsJson as Array<{ item_ids: string[] }>) {
    for (const id of lesson.item_ids) {
      assert.ok(itemIds.has(id), `lesson references missing item ${id}`)
    }
  }
})

test('topics.json keys all reference real item ids', () => {
  const itemIds = new Set((itemsJson as Array<{ id: string }>).map((i) => i.id))
  for (const [slug, ids] of Object.entries(topicsJson as Record<string, string[]>)) {
    assert.ok(ids.length > 0, `topic ${slug} has no items`)
    for (const id of ids) assert.ok(itemIds.has(id), `topic ${slug} references missing item ${id}`)
  }
})
