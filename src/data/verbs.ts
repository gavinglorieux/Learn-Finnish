// Verb conjugation tables for Type 1 and Type 2 verbs. Used by the conjugator exercise.

export type Person = 'minä' | 'sinä' | 'hän' | 'me' | 'te' | 'he'
export const PERSONS: Person[] = ['minä', 'sinä', 'hän', 'me', 'te', 'he']

export type Verb = {
  infinitive: string
  english: string
  type: 1 | 2
  forms: Record<Person, string>
  negativeStem: string // used after en/et/ei/emme/ette/eivät
  irregular?: boolean
}

// Simple consonant gradation: doubled stops kk/pp/tt weaken to k/p/t in closed syllables.
// Happens in minä, sinä, me, te forms and in the negative stem. hän and he keep strong grade.
// The doubled stop sits between the previous syllable and the final vowel of the stem.
// Example: nukku → nuku, odotta → odota, kirjoitta → kirjoita.
const weakenDoubleStop = (stem: string): string =>
  stem.replace(/(kk|pp|tt)([aeiouyäö])$/, (_m, d: string, v: string) => d[0] + v)

// helper for Type 1 verbs: takes infinitive, returns forms
const t1 = (inf: string, stemOverride?: string): Omit<Verb, 'english'> => {
  const strong = stemOverride ?? inf.slice(0, -1)
  const weak = weakenDoubleStop(strong)
  // hän form doubles last vowel unless already doubled (uses strong grade)
  const last = strong[strong.length - 1]
  const secondLast = strong[strong.length - 2]
  const han = secondLast === last ? strong : strong + last
  const vataVat = /[aou]/.test(strong) ? 'vat' : 'vät'
  return {
    infinitive: inf,
    type: 1,
    forms: {
      minä: weak + 'n',
      sinä: weak + 't',
      hän: han,
      me: weak + 'mme',
      te: weak + 'tte',
      he: strong + vataVat
    },
    negativeStem: weak
  }
}

const t2 = (inf: string, override?: Partial<Record<Person, string>>): Omit<Verb, 'english'> => {
  const stem = inf.slice(0, -2) // drop -da/-dä
  const vataVat = /[aou]/.test(stem) ? 'vat' : 'vät'
  const forms: Record<Person, string> = {
    minä: stem + 'n',
    sinä: stem + 't',
    hän: stem,
    me: stem + 'mme',
    te: stem + 'tte',
    he: stem + vataVat,
    ...(override ?? {})
  }
  return { infinitive: inf, type: 2, forms, negativeStem: stem }
}

export const VERBS: Verb[] = [
  { ...t1('asua'), english: 'to live' },
  { ...t1('puhua'), english: 'to speak' },
  { ...t1('kysyä'), english: 'to ask' },
  { ...t1('maksaa'), english: 'to pay / cost' },
  { ...t1('ostaa'), english: 'to buy' },
  { ...t1('istua'), english: 'to sit' },
  { ...t1('katsoa'), english: 'to watch' },
  { ...t1('ajaa'), english: 'to drive' },
  { ...t1('rakastaa'), english: 'to love' },
  { ...t1('laulaa'), english: 'to sing' },
  { ...t1('matkustaa'), english: 'to travel' },
  { ...t1('nukkua'), english: 'to sleep' },
  { ...t1('sanoa'), english: 'to say' },
  { ...t1('odottaa'), english: 'to wait' },
  { ...t1('kirjoittaa'), english: 'to write' },
  { ...t1('tanssia'), english: 'to dance' },

  { ...t2('saada'), english: 'to get / receive' },
  { ...t2('käydä'), english: 'to visit' },
  { ...t2('syödä'), english: 'to eat' },
  { ...t2('juoda'), english: 'to drink' },
  { ...t2('uida'), english: 'to swim' },
  { ...t2('viedä'), english: 'to take (away)' },
  { ...t2('tuoda'), english: 'to bring' },
  { ...t2('voida'), english: 'to be able' },
  { ...t2('myydä'), english: 'to sell' },
  // irregular Type 2
  {
    infinitive: 'tehdä',
    english: 'to do / make',
    type: 2,
    irregular: true,
    negativeStem: 'tee',
    forms: { minä: 'teen', sinä: 'teet', hän: 'tekee', me: 'teemme', te: 'teette', he: 'tekevät' }
  },
  {
    infinitive: 'nähdä',
    english: 'to see',
    type: 2,
    irregular: true,
    negativeStem: 'näe',
    forms: { minä: 'näen', sinä: 'näet', hän: 'näkee', me: 'näemme', te: 'näette', he: 'näkevät' }
  }
]

// olla is handled separately because it's a very special verb
export const OLLA_FORMS: Record<Person, string> = {
  minä: 'olen',
  sinä: 'olet',
  hän: 'on',
  me: 'olemme',
  te: 'olette',
  he: 'ovat'
}

export const NEG_VERB: Record<Person, string> = {
  minä: 'en',
  sinä: 'et',
  hän: 'ei',
  me: 'emme',
  te: 'ette',
  he: 'eivät'
}

export const PERSON_EN: Record<Person, string> = {
  minä: 'I',
  sinä: 'you',
  hän: 'he / she',
  me: 'we',
  te: 'you (pl.)',
  he: 'they'
}
