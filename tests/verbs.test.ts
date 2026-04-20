import { test } from 'node:test'
import assert from 'node:assert/strict'
import { VERBS, OLLA_FORMS, NEG_VERB } from '../src/data/verbs.ts'

const verb = (inf: string) => {
  const v = VERBS.find((x) => x.infinitive === inf)
  if (!v) throw new Error(`verb not found: ${inf}`)
  return v
}

test('Type 1 verbs without gradation', () => {
  assert.equal(verb('puhua').forms.minä, 'puhun')
  assert.equal(verb('puhua').forms.hän, 'puhuu')
  assert.equal(verb('puhua').forms.he, 'puhuvat')
  assert.equal(verb('asua').forms.me, 'asumme')
  assert.equal(verb('kysyä').forms.he, 'kysyvät')
})

test('Type 1 verbs WITH consonant gradation', () => {
  // nukkua: kk → k in weak forms
  const nukkua = verb('nukkua').forms
  assert.equal(nukkua.minä, 'nukun')
  assert.equal(nukkua.sinä, 'nukut')
  assert.equal(nukkua.hän, 'nukkuu') // strong
  assert.equal(nukkua.me, 'nukumme')
  assert.equal(nukkua.te, 'nukutte')
  assert.equal(nukkua.he, 'nukkuvat') // strong

  // odottaa: tt → t
  assert.equal(verb('odottaa').forms.minä, 'odotan')
  assert.equal(verb('odottaa').forms.hän, 'odottaa')

  // kirjoittaa: tt → t
  assert.equal(verb('kirjoittaa').forms.minä, 'kirjoitan')
  assert.equal(verb('kirjoittaa').forms.he, 'kirjoittavat')
})

test('Type 2 verbs', () => {
  assert.equal(verb('syödä').forms.minä, 'syön')
  assert.equal(verb('syödä').forms.hän, 'syö')
  assert.equal(verb('syödä').forms.he, 'syövät')
  assert.equal(verb('juoda').forms.me, 'juomme')
})

test('Irregular Type 2 verbs (tehdä, nähdä)', () => {
  assert.equal(verb('tehdä').forms.hän, 'tekee')
  assert.equal(verb('tehdä').forms.minä, 'teen')
  assert.equal(verb('nähdä').forms.hän, 'näkee')
  assert.equal(verb('nähdä').negativeStem, 'näe')
})

test('OLLA and negative verbs', () => {
  assert.equal(OLLA_FORMS.minä, 'olen')
  assert.equal(OLLA_FORMS.he, 'ovat')
  assert.equal(NEG_VERB.minä, 'en')
  assert.equal(NEG_VERB.he, 'eivät')
})
