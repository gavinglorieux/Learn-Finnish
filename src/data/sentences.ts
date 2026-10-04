// Example sentences used by the fill-the-gap and sentence-builder exercises.
// Each sentence has a Finnish form, an English translation, and an optional "gap" — a word to remove
// and ask the learner to restore, plus distractors for multiple-choice gap-fill.

export type Sentence = {
  id: string
  fi: string
  en: string
  topic: string
  gap?: { word: string; distractors: string[]; explain?: string }
}

export const SENTENCES: Sentence[] = [
  {
    id: 'greet-1',
    fi: 'Hyvää huomenta! Mitä sinulle kuuluu?',
    en: 'Good morning! How are you?',
    topic: 'greetings',
    gap: { word: 'huomenta', distractors: ['iltaa', 'päivää', 'yötä'] }
  },
  {
    id: 'intro-1',
    fi: 'Minä olen Gavin ja olen Englannista.',
    en: 'I am Gavin and I am from England.',
    topic: 'olla',
    gap: { word: 'olen', distractors: ['on', 'olet', 'olemme'], explain: 'First person singular of olla.' }
  },
  {
    id: 'intro-2',
    fi: 'Hän on opettaja ja asuu Helsingissä.',
    en: 'He/she is a teacher and lives in Helsinki.',
    topic: 'olla',
    gap: { word: 'on', distractors: ['olen', 'olet', 'ovat'] }
  },
  {
    id: 'intro-3',
    fi: 'Me olemme suomalaisia.',
    en: 'We are Finnish.',
    topic: 'olla',
    gap: { word: 'olemme', distractors: ['olette', 'ovat', 'olen'] }
  },
  {
    id: 'neg-1',
    fi: 'Minä en ole suomalainen.',
    en: 'I am not Finnish.',
    topic: 'olla-negative',
    gap: { word: 'en ole', distractors: ['et ole', 'ei ole', 'emme ole'] }
  },
  {
    id: 'q-1',
    fi: 'Oletko sinä suomalainen?',
    en: 'Are you Finnish?',
    topic: 'questions',
    gap: { word: 'Oletko', distractors: ['Onko', 'Olenko', 'Olemmeko'] }
  },
  {
    id: 'have-1',
    fi: 'Minulla on kaksi koiraa.',
    en: 'I have two dogs.',
    topic: 'minulla-on',
    gap: { word: 'Minulla', distractors: ['Sinulla', 'Hänellä', 'Meillä'], explain: 'Adessive of minä.' }
  },
  {
    id: 'have-2',
    fi: 'Hänellä ei ole aikaa.',
    en: "He/she doesn't have time.",
    topic: 'minulla-on-neg',
    gap: { word: 'ei ole', distractors: ['en ole', 'et ole', 'emme ole'] }
  },
  {
    id: 'shop-1',
    fi: 'Kuinka paljon tämä maksaa?',
    en: 'How much does this cost?',
    topic: 'shopping',
    gap: { word: 'maksaa', distractors: ['maksan', 'maksat', 'maksamme'] }
  },
  {
    id: 'shop-2',
    fi: 'Minä maksan kortilla.',
    en: 'I pay by card.',
    topic: 'shopping',
    gap: { word: 'maksan', distractors: ['maksaa', 'maksamme', 'maksat'] }
  },
  {
    id: 'cafe-1',
    fi: 'Yksi kahvi ja kaksi pullaa, kiitos.',
    en: 'One coffee and two buns, please.',
    topic: 'cafe',
    gap: { word: 'pullaa', distractors: ['pulla', 'pullia', 'pullat'], explain: 'Partitive after numbers ≥ 2.' }
  },
  {
    id: 'cafe-2',
    fi: 'Saanko kupin teetä?',
    en: 'May I have a cup of tea?',
    topic: 'cafe',
    gap: { word: 'Saanko', distractors: ['Saan', 'Saat', 'Saamme'] }
  },
  {
    id: 'verb-1',
    fi: 'Me puhumme vähän suomea.',
    en: 'We speak a little Finnish.',
    topic: 'verb_type_1',
    gap: { word: 'puhumme', distractors: ['puhun', 'puhut', 'puhuvat'] }
  },
  {
    id: 'verb-2',
    fi: 'He asuvat Turussa.',
    en: 'They live in Turku.',
    topic: 'verb_type_1',
    gap: { word: 'asuvat', distractors: ['asun', 'asumme', 'asutte'] }
  },
  {
    id: 'verb-3',
    fi: 'Sinä syöt lettuja.',
    en: 'You eat pancakes.',
    topic: 'verb_type_2',
    gap: { word: 'syöt', distractors: ['syön', 'syö', 'syövät'] }
  },
  {
    id: 'weather-1',
    fi: 'Ulkona on aurinkoista.',
    en: 'It is sunny outside.',
    topic: 'weather',
    gap: { word: 'aurinkoista', distractors: ['aurinkoinen', 'aurinko', 'pilvistä'] }
  },
  {
    id: 'weather-2',
    fi: 'Huomenna sataa lunta.',
    en: 'Tomorrow it snows.',
    topic: 'weather',
    gap: { word: 'sataa lunta', distractors: ['sataa räntää', 'tuulee', 'ukkostaa'] }
  },
  {
    id: 'weather-3',
    fi: 'On kaksikymmentä astetta lämmintä.',
    en: 'It is twenty degrees warm.',
    topic: 'weather',
    gap: { word: 'astetta', distractors: ['aste', 'asteita', 'asteessa'], explain: 'Partitive with numbers.' }
  },
  {
    id: 'loc-1',
    fi: 'Olen kahvilassa.',
    en: 'I am in the café.',
    topic: 'inessive',
    gap: { word: 'kahvilassa', distractors: ['kahvilalla', 'kahvilasta', 'kahvila'] }
  },
  {
    id: 'loc-2',
    fi: 'Hän on torilla.',
    en: 'He/she is at the market.',
    topic: 'adessive',
    gap: { word: 'torilla', distractors: ['torissa', 'tori', 'torista'] }
  },
  {
    id: 'fam-1',
    fi: 'Meillä on kolme lasta.',
    en: 'We have three children.',
    topic: 'partitive',
    gap: { word: 'lasta', distractors: ['lapsi', 'lapset', 'lapsessa'], explain: 'Partitive after "kolme".' }
  },
  {
    id: 'days-1',
    fi: 'Maanantaina menen töihin.',
    en: 'On Monday I go to work.',
    topic: 'days',
    gap: { word: 'Maanantaina', distractors: ['Maanantai', 'Maanantaissa', 'Maanantailla'] }
  },
  {
    id: 'nat-1',
    fi: 'Hän on ruotsalainen.',
    en: 'He/she is Swedish.',
    topic: 'nationalities',
    gap: { word: 'ruotsalainen', distractors: ['ruotsi', 'ruotsista', 'ruotsalainenta'] }
  },
  {
    id: 'home-1',
    fi: 'Asunnossani on kolme huonetta.',
    en: 'My flat has three rooms.',
    topic: 'rooms',
    gap: { word: 'huonetta', distractors: ['huone', 'huoneet', 'huoneessa'], explain: '-e word → -tta/-ttä in partitive.' }
  },
  {
    id: 'adj-1',
    fi: 'Tämä on iso ja kaunis talo.',
    en: 'This is a big and beautiful house.',
    topic: 'adjectives',
    gap: { word: 'iso', distractors: ['isoa', 'isot', 'isossa'] }
  }
]
