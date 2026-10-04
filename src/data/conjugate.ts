// Rule-based Finnish present-tense + imperative conjugation for verb types 1–6,
// including K-P-T consonant gradation (astevaihtelu) in both directions:
//   • type 1: infinitive = strong grade → minä/sinä/me/te/negative are weak (nukkua → nukun)
//   • types 3, 4, 6: infinitive = weak grade → personal forms are strong (tavata → tapaan)
// Kept free of path aliases so node:test can import it directly.

export type Person = 'minä' | 'sinä' | 'hän' | 'me' | 'te' | 'he'
export const PERSONS: Person[] = ['minä', 'sinä', 'hän', 'me', 'te', 'he']
export type VerbType = 1 | 2 | 3 | 4 | 5 | 6

export type Conjugation = {
  infinitive: string
  type: VerbType
  forms: Record<Person, string>
  /** Form used after en/et/ei/emme/ette/eivät. */
  negativeStem: string
  imperative: {
    /** 2nd person singular: Puhu! */
    sg: string
    /** 2nd person plural: Puhukaa! */
    pl: string
    /** Älä puhu! */
    negSg: string
    /** Älkää puhuko! */
    negPl: string
  }
}

const VOWELS = 'aeiouyäö'
const isVowel = (c: string | undefined): boolean => !!c && VOWELS.includes(c)

/** a/ä according to vowel harmony: any back vowel (a, o, u) → back endings. */
export const harmonyA = (word: string): 'a' | 'ä' => {
  // Compounds take the harmony of their last part; looking at the last back/front vowel works for course words.
  for (let i = word.length - 1; i >= 0; i--) {
    const c = word[i]
    if ('aou'.includes(c)) return 'a'
    if ('äöy'.includes(c)) return 'ä'
  }
  return 'ä'
}
const harmonyO = (word: string): 'o' | 'ö' => (harmonyA(word) === 'a' ? 'o' : 'ö')

// ---------- gradation ----------

// Strong → weak. Order matters: longer clusters first.
const WEAKEN: Array<[string, string]> = [
  ['kk', 'k'],
  ['pp', 'p'],
  ['tt', 't'],
  ['nk', 'ng'],
  ['mp', 'mm'],
  ['nt', 'nn'],
  ['lt', 'll'],
  ['rt', 'rr'],
  ['ht', 'hd'],
  ['lp', 'lv'],
  ['rp', 'rv'],
  ['lk', 'lj'],
  ['rk', 'rj'],
  ['k', ''],
  ['p', 'v'],
  ['t', 'd']
]

// Weak → strong. Single k/p/t/d only strengthen when they stand alone between vowels.
// v→p, l→lk, lj→lk and rj→rk are ambiguous (avata → avaan but tavata → tapaan,
// tarjota → tarjoan), so they only apply to verbs listed in STRONG_EXCEPTIONS.
const STRENGTHEN: Record<string, string> = {
  ng: 'nk',
  mm: 'mp',
  nn: 'nt',
  ll: 'lt',
  rr: 'rt',
  hd: 'ht',
  k: 'kk',
  p: 'pp',
  t: 'tt',
  d: 't'
}
const STRENGTHEN_AMBIGUOUS: Record<string, string> = { v: 'p', l: 'lk', lj: 'lk', rj: 'rk' }

// Clusters that never alternate.
const NO_GRADATION = ['st', 'sk', 'sp', 'tk', 'ts', 'kt', 'pt']

type Split = { head: string; cluster: string; tail: string }

/**
 * Split a stem around the consonant cluster that precedes its last vowel group,
 * e.g. "nukku" → { head: "nu", cluster: "kk", tail: "u" }.
 * Gradation only happens word-internally, so a cluster at the start of the word
 * (tulla, mennä) yields an empty cluster.
 */
const splitAtLastCluster = (stem: string): Split => {
  let i = stem.length
  while (i > 0 && isVowel(stem[i - 1])) i--
  const tailStart = i
  while (i > 0 && !isVowel(stem[i - 1])) i--
  const clusterStart = i
  if (clusterStart === 0) return { head: stem.slice(0, tailStart), cluster: '', tail: stem.slice(tailStart) }
  return { head: stem.slice(0, clusterStart), cluster: stem.slice(clusterStart, tailStart), tail: stem.slice(tailStart) }
}

/** Strong-grade stem → weak-grade stem (nukku → nuku, tietä → tiedä, lukе → lue). */
export const weakenStem = (stem: string): string => {
  const { head, cluster, tail } = splitAtLastCluster(stem)
  if (!cluster || NO_GRADATION.includes(cluster.slice(-2))) return stem
  for (const [strong, weak] of WEAKEN) {
    if (cluster.endsWith(strong)) {
      // Single k/p/t only alternate after a vowel or h/l/r/n/m (already handled above).
      const before = cluster.slice(0, cluster.length - strong.length)
      if (strong.length === 1 && before && !'hlrnm'.includes(before)) return stem
      // lk/rk → lj/rj only before e (kulkea → kuljen); otherwise just drop k (jälki → jäljen is rare in verbs).
      if ((strong === 'lk' || strong === 'rk') && !tail.startsWith('e')) return head + before + strong[0] + tail
      return head + before + weak + tail
    }
  }
  return stem
}

/** Weak-grade part → strong-grade part (mita → mitta, ajate → ajatte; tava → tapa only via exceptions). */
export const strengthenStem = (body: string, allowAmbiguous = false): string => {
  const { head, cluster, tail } = splitAtLastCluster(body)
  // ∅ → k (maata → makaa) is not predictable — handled by overrides.
  // Only a consonant before a single final vowel alternates (lakais-ta has a diphthong: no change).
  if (!cluster || tail.length !== 1) return body
  const strong = (allowAmbiguous ? STRENGTHEN_AMBIGUOUS[cluster] : undefined) ?? STRENGTHEN[cluster]
  return strong ? head + strong + tail : body
}

// Verbs whose weak grade is v (→ p) or l (→ lk) in the infinitive.
const STRONG_EXCEPTIONS = new Set(['tavata', 'luvata', 'kaivata', 'levätä', 'pelätä', 'hylätä', 'kavuta', 'kiivetä'])

// Loanwords whose double consonant is not a weak grade (grillata → grillaan, not ✗griltaan).
const NO_GRADATION_VERBS = new Set(['grillata', 'stressata', 'chillata'])

// ---------- type detection ----------

export const detectVerbType = (inf: string): VerbType => {
  const s = inf.toLowerCase()
  if (/(da|dä)$/.test(s)) return 2
  if (/(lla|llä|nna|nnä|rra|rrä|sta|stä)$/.test(s)) return 3
  if (/[aeiouyäö][aä]$/.test(s)) return 1
  if (/(ita|itä)$/.test(s)) return 5
  if (/(eta|etä)$/.test(s)) return 6
  return 4
}

// ---------- irregular / unpredictable verbs ----------

type Override = Partial<Omit<Conjugation, 'imperative'>> & { imperative?: Partial<Conjugation['imperative']> }

const OVERRIDES: Record<string, Override> = {
  olla: {
    forms: { minä: 'olen', sinä: 'olet', hän: 'on', me: 'olemme', te: 'olette', he: 'ovat' },
    negativeStem: 'ole'
  },
  tehdä: {
    forms: { minä: 'teen', sinä: 'teet', hän: 'tekee', me: 'teemme', te: 'teette', he: 'tekevät' },
    negativeStem: 'tee',
    imperative: { sg: 'tee', negSg: 'älä tee' }
  },
  nähdä: {
    forms: { minä: 'näen', sinä: 'näet', hän: 'näkee', me: 'näemme', te: 'näette', he: 'näkevät' },
    negativeStem: 'näe',
    imperative: { sg: 'näe', negSg: 'älä näe' }
  },
  juosta: {
    forms: { minä: 'juoksen', sinä: 'juokset', hän: 'juoksee', me: 'juoksemme', te: 'juoksette', he: 'juoksevat' },
    negativeStem: 'juokse',
    imperative: { sg: 'juokse', negSg: 'älä juokse' }
  },
  maata: {
    forms: { minä: 'makaan', sinä: 'makaat', hän: 'makaa', me: 'makaamme', te: 'makaatte', he: 'makaavat' },
    negativeStem: 'makaa',
    imperative: { sg: 'makaa', negSg: 'älä makaa' }
  },
  hävitä: { type: 4 },
  selvitä: { type: 4 },
  kiivetä: { type: 4 },
  rohjeta: { type: 4 }
}

// ---------- main ----------

const personal = (stem: string, han: string, strongForHe: string, a: 'a' | 'ä'): Record<Person, string> => ({
  minä: stem + 'n',
  sinä: stem + 't',
  hän: han,
  me: stem + 'mme',
  te: stem + 'tte',
  he: strongForHe + 'v' + a + 't'
})

const lengthen = (stem: string): string => {
  const last = stem[stem.length - 1]
  const prev = stem[stem.length - 2]
  if (!isVowel(last)) return stem
  // Already a long vowel (avaa-, saa-) or diphthong ending in i/u/y for type-2 stems (ui-, voi-) → unchanged.
  if (prev === last) return stem
  return stem + last
}

export const conjugate = (infinitive: string, typeHint?: VerbType): Conjugation => {
  const inf = infinitive.trim().toLowerCase()
  const ov = OVERRIDES[inf]
  const type: VerbType = typeHint ?? ov?.type ?? detectVerbType(inf)
  const a = harmonyA(inf)
  const o = harmonyO(inf)
  const kaa = `k${a}${a}`

  let forms: Record<Person, string>
  let negativeStem: string
  let impSg: string
  let impPl: string
  let impNegPl: string

  switch (type) {
    case 1: {
      const strong = inf.slice(0, -1) // puhu-, nukku-, tietä-
      const weak = weakenStem(strong)
      forms = personal(weak, lengthen(strong), strong, a)
      negativeStem = weak
      impSg = weak
      impPl = strong + kaa
      impNegPl = strong + 'k' + o
      break
    }
    case 2: {
      const stem = inf.slice(0, -2) // syö-, juo-, tupakoi-
      // hän form keeps the stem as-is (syö, juo, voi, käy, saa).
      forms = personal(stem, stem, stem, a)
      negativeStem = stem
      impSg = stem
      impPl = stem + kaa
      impNegPl = stem + 'k' + o
      break
    }
    case 3: {
      // tulla → tul + e, mennä → men + e, nousta → nous + e, ajatella → ajattel + e
      const cons = inf.slice(0, -2) // tul, men, nous, ajatel
      const finalC = cons.slice(-1)
      const body = cons.slice(0, -1) // ajate
      // -sta/-stä verbs (nousta, kutista, pestä) never alternate.
      const strongBody = /st[aä]$/.test(inf) || NO_GRADATION_VERBS.has(inf) ? body : strengthenStem(body, STRONG_EXCEPTIONS.has(inf))
      const stem = strongBody + finalC + 'e'
      forms = personal(stem, stem + 'e', stem, a)
      negativeStem = stem
      impSg = stem
      impPl = cons + kaa // weak, consonant stem: tulkaa, ajatelkaa
      impNegPl = cons + 'k' + o
      break
    }
    case 4: {
      // haluta → halua-, avata → avaa-, tavata → tapaa-
      const body = inf.slice(0, -2) // halu, ava, tava
      const stem = (NO_GRADATION_VERBS.has(inf) ? body : strengthenStem(body, STRONG_EXCEPTIONS.has(inf))) + a
      forms = personal(stem, lengthen(stem), stem, a)
      negativeStem = stem
      impSg = stem
      impPl = inf.slice(0, -1) + kaa // halutkaa
      impNegPl = inf.slice(0, -1) + 'k' + o // halutko
      break
    }
    case 5: {
      // tarvita → tarvitse-
      const stem = inf.slice(0, -1) + 'se'
      forms = personal(stem, stem + 'e', stem, a)
      negativeStem = stem
      impSg = stem
      impPl = inf.slice(0, -1) + kaa // tarvitkaa
      impNegPl = inf.slice(0, -1) + 'k' + o
      break
    }
    case 6: {
      // vanheta → vanhene-, lämmetä → lämpene-
      const body = inf.slice(0, -2) // vanhe
      const stem = strengthenStem(body, STRONG_EXCEPTIONS.has(inf)) + 'ne'
      forms = personal(stem, stem + 'e', stem, a)
      negativeStem = stem
      impSg = stem
      impPl = inf.slice(0, -1) + kaa
      impNegPl = inf.slice(0, -1) + 'k' + o
      break
    }
  }

  const base: Conjugation = {
    infinitive: inf,
    type,
    forms,
    negativeStem,
    imperative: {
      sg: impSg,
      pl: impPl,
      negSg: `älä ${impSg}`,
      negPl: `älkää ${impNegPl}`
    }
  }
  if (!ov) return base
  const negativeFromOv = ov.negativeStem ?? base.negativeStem
  return {
    ...base,
    forms: ov.forms ?? base.forms,
    negativeStem: negativeFromOv,
    imperative: {
      ...base.imperative,
      sg: ov.imperative?.sg ?? (ov.negativeStem ? negativeFromOv : base.imperative.sg),
      negSg: ov.imperative?.negSg ?? (ov.negativeStem ? `älä ${negativeFromOv}` : base.imperative.negSg),
      pl: ov.imperative?.pl ?? base.imperative.pl,
      negPl: ov.imperative?.negPl ?? base.imperative.negPl
    }
  }
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

export const negativeForm = (c: Conjugation, p: Person): string => `${NEG_VERB[p]} ${c.negativeStem}`
