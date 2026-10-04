// Every verb from the course vocabulary, conjugated by the rule engine in conjugate.ts.
// Used by the verb conjugator drill and the verb tables on word pages.

import { VOCAB_WORDS } from './content'
import { conjugate, NEG_VERB, PERSON_EN, PERSONS, type Conjugation, type Person, type VerbType } from './conjugate'

export { NEG_VERB, PERSON_EN, PERSONS }
export type { Person }

export type Verb = Conjugation & {
  english: string
  /** True when the infinitive and personal forms differ in K-P-T grade. */
  kpt: boolean
  irregular?: boolean
}

const IRREGULAR = new Set(['olla', 'tehdä', 'nähdä', 'juosta', 'maata'])

export const hasGradation = (c: Conjugation): boolean => {
  const inf = c.infinitive
  if (c.type === 1) return c.forms.minä.slice(0, -1) !== inf.slice(0, -1)
  // Types 3/4/6: the weak infinitive body no longer appears in the (strong) stem: tavata → tapaa-, ajatella → ajattele-.
  if (c.type === 3) return !c.negativeStem.startsWith(inf.slice(0, -3))
  if (c.type === 4 || c.type === 6) return !c.negativeStem.startsWith(inf.slice(0, -2))
  return false
}

const toVerb = (fi: string, english: string, type?: number): Verb => {
  const c = conjugate(fi, type as VerbType | undefined)
  return { ...c, english, kpt: hasGradation(c), irregular: IRREGULAR.has(c.infinitive) || undefined }
}

// Single-word infinitives only (skip phrases like "käydä kaupassa").
const fromVocab: Verb[] = VOCAB_WORDS
  .filter((w) => w.pos === 'verb' && w.verbType && /^[a-zåäö]+$/i.test(w.fi) && /([aeiouyäö]|d|l|n|r|t)[aä]$/i.test(w.fi))
  .map((w) => toVerb(w.fi.toLowerCase(), w.en, w.verbType))

const seen = new Set(fromVocab.map((v) => v.infinitive))
const ensure = (fi: string, en: string) => (seen.has(fi) ? [] : [toVerb(fi, en)])

export const VERBS: Verb[] = [...fromVocab, ...ensure('olla', 'to be'), ...ensure('tehdä', 'to do, make'), ...ensure('nähdä', 'to see')]
  .sort((a, b) => a.infinitive.localeCompare(b.infinitive, 'fi'))

export const verbByInfinitive = (fi: string): Verb | undefined => VERBS.find((v) => v.infinitive === fi.toLowerCase())

export const OLLA_FORMS = conjugate('olla').forms
