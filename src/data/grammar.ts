// Grammar reference content organised by topic.

export type GrammarTopic = {
  id: string
  title: string
  emoji: string
  summary: string
  sections: GrammarSection[]
}

export type GrammarSection = {
  heading: string
  body?: string
  table?: { headers: string[]; rows: string[][] }
  bullets?: string[]
  examples?: Array<{ fi: string; en: string }>
}

export const GRAMMAR: GrammarTopic[] = [
  {
    id: 'pronunciation',
    title: 'Pronunciation & alphabet',
    emoji: '🔤',
    summary: 'Every letter is pronounced. Double letters held longer. r is rolled.',
    sections: [
      {
        heading: 'Vowel harmony',
        body: 'Finnish words follow vowel harmony — back vowels (a, o, u) and front vowels (ä, ö, y) do not mix within native Finnish words. Neutral vowels e and i can appear with either group.',
        bullets: [
          'Back vowels → take -a endings (talo → taloa)',
          'Front vowels → take -ä endings (tyttö → tyttöä)'
        ]
      },
      {
        heading: 'Key sounds',
        bullets: [
          'ä = like the "a" in cat',
          'ö = like the "ur" in burn',
          'y = like the German ü',
          'r is always rolled',
          'Double letters are held noticeably longer (kk, pp, aa, ii)'
        ]
      },
      { heading: 'Vowel pairs to practise', body: 'yö (night), öy, äy, eu — each pair is one sound glide, not two separate vowels.' }
    ]
  },
  {
    id: 'pronouns',
    title: 'Personal pronouns',
    emoji: '🙋',
    summary: 'minä, sinä, hän, me, te, he. No grammatical gender.',
    sections: [
      {
        heading: 'Personal pronouns',
        table: {
          headers: ['Finnish', 'English'],
          rows: [
            ['minä', 'I'],
            ['sinä', 'you (singular)'],
            ['hän', 'he / she'],
            ['me', 'we'],
            ['te', 'you (plural / formal)'],
            ['he', 'they (people)'],
            ['se', 'it'],
            ['ne', 'they (things)']
          ]
        }
      },
      {
        heading: 'Possessive pronouns',
        table: {
          headers: ['Finnish', 'English'],
          rows: [
            ['minun', 'my'],
            ['sinun', 'your'],
            ['hänen', 'his / her'],
            ['meidän', 'our'],
            ['teidän', 'your (plural)'],
            ['heidän', 'their']
          ]
        }
      },
      { heading: 'Note', body: 'hän means both he and she — Finnish has no grammatical gender.' }
    ]
  },
  {
    id: 'olla',
    title: 'To be (olla)',
    emoji: '🧠',
    summary: 'The verb olla is irregular and essential for every Finnish conversation.',
    sections: [
      {
        heading: 'Positive',
        table: {
          headers: ['Person', 'Form', 'Meaning'],
          rows: [
            ['minä', 'olen', 'I am'],
            ['sinä', 'olet', 'you are'],
            ['hän', 'on', 'he / she is'],
            ['me', 'olemme', 'we are'],
            ['te', 'olette', 'you are'],
            ['he', 'ovat', 'they are']
          ]
        }
      },
      {
        heading: 'Negative',
        body: 'The negative verb (en, et, ei, emme, ette, eivät) takes the person ending; the main verb drops to a bare stem.',
        table: {
          headers: ['Person', 'Form', 'Meaning'],
          rows: [
            ['minä', 'en ole', 'I am not'],
            ['sinä', 'et ole', 'you are not'],
            ['hän', 'ei ole', 'he / she is not'],
            ['me', 'emme ole', 'we are not'],
            ['te', 'ette ole', 'you are not'],
            ['he', 'eivät ole', 'they are not']
          ]
        }
      },
      {
        heading: 'Questions',
        body: 'Add -ko/-kö to the verb and bring it to the start.',
        examples: [
          { fi: 'Oletko sinä suomalainen?', en: 'Are you Finnish?' },
          { fi: 'Onko hän opiskelija?', en: 'Is he/she a student?' },
          { fi: 'Eikö hän ole täällä?', en: 'Is he/she not here?' }
        ]
      }
    ]
  },
  {
    id: 'verb_types',
    title: 'Verb types',
    emoji: '⚙️',
    summary: 'Finnish verbs divide into 5 types. This course covers Types 1 and 2.',
    sections: [
      {
        heading: 'Type 1 — ends in two vowels',
        body: 'Remove the final -a / -ä, add the personal ending. The hän form doubles the remaining vowel.',
        table: {
          headers: ['Person', 'Ending', 'puhua → speak'],
          rows: [
            ['minä', '-n', 'puhun'],
            ['sinä', '-t', 'puhut'],
            ['hän', 'double vowel', 'puhuu'],
            ['me', '-mme', 'puhumme'],
            ['te', '-tte', 'puhutte'],
            ['he', '-vat / -vät', 'puhuvat']
          ]
        }
      },
      {
        heading: 'Type 2 — ends in -da / -dä',
        body: 'Remove -da / -dä, add the personal ending. The hän form has no ending (just the stem).',
        table: {
          headers: ['Person', 'syödä → eat'],
          rows: [
            ['minä', 'syön'],
            ['sinä', 'syöt'],
            ['hän', 'syö'],
            ['me', 'syömme'],
            ['te', 'syötte'],
            ['he', 'syövät']
          ]
        }
      },
      {
        heading: 'Negation & questions',
        bullets: [
          'Negative: take the minä form, drop the -n → this is the "negative stem". Pair with en / et / ei / emme / ette / eivät.',
          'Example: puhua → minä en puhu, hän ei puhu.',
          'Questions: add -ko / -kö to the conjugated verb → Puhutko sinä suomea?'
        ]
      },
      {
        heading: 'Irregular Type 2',
        examples: [
          { fi: 'tehdä → teen, teet, tekee, teemme, teette, tekevät', en: 'to do / make' },
          { fi: 'nähdä → näen, näet, näkee, näemme, näette, näkevät', en: 'to see' }
        ]
      }
    ]
  },
  {
    id: 'have',
    title: 'To have (minulla on)',
    emoji: '🤝',
    summary: 'Finnish uses the adessive case + on for possession.',
    sections: [
      {
        heading: 'Forms',
        table: {
          headers: ['Finnish', 'English'],
          rows: [
            ['Minulla on', 'I have'],
            ['Sinulla on', 'You have'],
            ['Hänellä on', 'He / she has'],
            ['Meillä on', 'We have'],
            ['Teillä on', 'You have'],
            ['Heillä on', 'They have']
          ]
        }
      },
      {
        heading: 'Negative & question',
        examples: [
          { fi: 'Minulla ei ole aikaa.', en: "I don't have time." },
          { fi: 'Onko sinulla koira?', en: 'Do you have a dog?' },
          { fi: 'Heillä on uusi auto.', en: 'They have a new car.' }
        ]
      }
    ]
  },
  {
    id: 'partitive',
    title: 'Partitive case',
    emoji: '🧪',
    summary: 'Used after numbers, with amounts, and for incomplete / uncountable things.',
    sections: [
      {
        heading: 'When to use',
        bullets: [
          'After numbers 2 and above (kaksi koiraa)',
          'After indefinite amounts (paljon vettä)',
          'After pari, monta, paljon, vähän',
          'With minulla on for uncountable things (vettä, aikaa)'
        ]
      },
      {
        heading: 'Endings',
        table: {
          headers: ['Ending', 'Rule', 'Example'],
          rows: [
            ['-a / -ä', 'single vowel, not -e', 'kahvi → kahvia'],
            ['-tta / -ttä', 'ends in -e', 'huone → huonetta'],
            ['-ta / -tä', 'two vowels or consonant', 'puu → puuta, olut → olutta'],
            ['-sta / -stä', '-nen → -sta / -stä', 'nainen → naista']
          ]
        }
      },
      {
        heading: 'Adjective agreement',
        body: 'Adjectives take the same case as the noun.',
        examples: [
          { fi: 'kaksi valkoista koiraa', en: 'two white dogs' },
          { fi: 'kolme isoa huonetta', en: 'three big rooms' }
        ]
      }
    ]
  },
  {
    id: 'genitive',
    title: 'Genitive case (possession)',
    emoji: '🔑',
    summary: 'Shows possession. Add -n to a vowel-ending word.',
    sections: [
      {
        heading: 'Formation',
        bullets: [
          'Vowel ending: add -n (auto → auton)',
          'Consonant ending: add -in with possible stem changes'
        ]
      },
      {
        heading: 'Possessive suffixes',
        table: {
          headers: ['Person', 'Suffix', 'Example'],
          rows: [
            ['minun', '-ni', 'minun autoni (my car)'],
            ['sinun', '-si', 'sinun autosi (your car)'],
            ['hänen', '-nsa / -nsä', 'hänen autonsa'],
            ['meidän', '-mme', 'meidän automme'],
            ['teidän', '-nne', 'teidän autonne'],
            ['heidän', '-nsa / -nsä', 'heidän autonsa']
          ]
        }
      }
    ]
  },
  {
    id: 'locations',
    title: 'Location cases',
    emoji: '📍',
    summary: 'Inessive (-ssa / -ssä) for "inside"; adessive (-lla / -llä) for "on / at".',
    sections: [
      {
        heading: 'Inessive — inside something',
        examples: [
          { fi: 'kaupassa', en: 'in the shop' },
          { fi: 'toimistossa', en: 'in the office' },
          { fi: 'Suomessa', en: 'in Finland' }
        ]
      },
      {
        heading: 'Adessive — on / at something',
        examples: [
          { fi: 'torilla', en: 'at the market' },
          { fi: 'kassalla', en: 'at the till' },
          { fi: 'lentoasemalla', en: 'at the airport' }
        ]
      }
    ]
  },
  {
    id: 'weather',
    title: 'Weather expressions',
    emoji: '🌦️',
    summary: 'Finnish weather uses time/place + on + (partitive) adjective — no dummy "it".',
    sections: [
      {
        heading: 'Abstract form (partitive)',
        examples: [
          { fi: 'Huomenna on pilvistä.', en: 'Tomorrow it will be cloudy.' },
          { fi: 'Ulkona on aurinkoista.', en: 'It is sunny outside.' },
          { fi: 'Siellä on kylmää.', en: 'It is cold there.' }
        ]
      },
      {
        heading: 'Concrete form (noun)',
        examples: [
          { fi: 'Huomenna on pilvinen päivä.', en: 'Tomorrow is a cloudy day.' },
          { fi: 'Ulkona on aurinkoinen ilma.', en: 'The weather outside is sunny.' }
        ]
      },
      {
        heading: 'Temperature',
        examples: [
          { fi: 'On +20 astetta lämmintä.', en: 'It is +20 degrees (warm).' },
          { fi: 'On -5 astetta pakkasta.', en: 'It is -5 degrees (freezing).' },
          { fi: 'Kuinka monta astetta ulkona on?', en: 'How many degrees is it outside?' }
        ]
      }
    ]
  },
  {
    id: 'questions',
    title: 'Question words',
    emoji: '❓',
    summary: 'Kuka, mikä, missä, milloin, miksi, miten…',
    sections: [
      {
        heading: 'Essentials',
        table: {
          headers: ['Finnish', 'English', 'Example'],
          rows: [
            ['mikä', 'what (with "on")', 'Mikä tämä on?'],
            ['mitä', 'what (doing)', 'Mitä sinä teet?'],
            ['kuka', 'who', 'Kuka hän on?'],
            ['kenen', 'whose', 'Kenen auto?'],
            ['missä', 'where (at)', 'Missä asut?'],
            ['mistä', 'where from', 'Mistä olet?'],
            ['mihin / minne', 'where to', 'Minne menet?'],
            ['milloin', 'when', 'Milloin tulet?'],
            ['miksi', 'why', 'Miksi?'],
            ['miten / kuinka', 'how', 'Miten menee?'],
            ['millainen', 'what … like', 'Millainen sää on?']
          ]
        }
      }
    ]
  },
  {
    id: 'nationalities',
    title: 'Nationalities',
    emoji: '🌍',
    summary: 'Country stem + -lainen / -läinen.',
    sections: [
      {
        heading: 'Examples',
        table: {
          headers: ['Country', 'Nationality'],
          rows: [
            ['Suomi', 'suomalainen'],
            ['Ruotsi', 'ruotsalainen'],
            ['Englanti', 'englantilainen'],
            ['Amerikka', 'amerikkalainen'],
            ['Ranska', 'ranskalainen'],
            ['Saksa', 'saksalainen']
          ]
        }
      },
      {
        heading: 'Rule of thumb',
        bullets: [
          'Front-vowel countries → -läinen (Englanti → englantilainen)',
          'Back-vowel countries → -lainen (Ranska → ranskalainen)',
          'Drop the final -i in many cases before adding -lainen / -läinen'
        ]
      }
    ]
  },
  {
    id: 'key_points',
    title: 'Quick reminders',
    emoji: '⭐',
    summary: 'Seven things to keep in mind as you speak.',
    sections: [
      {
        heading: 'Top 7',
        bullets: [
          'No articles — there is no "a / an" or "the".',
          'No grammatical gender — hän covers he and she.',
          'Vowel harmony — keep a / o / u away from ä / ö / y.',
          'Word order is flexible, but S-V-O is the default.',
          'The subject can be dropped when the verb ending makes it clear.',
          'Questions: -ko / -kö on the verb, or use a question word.',
          'Negation: use the negative verb + the bare verb stem.'
        ]
      }
    ]
  }
]
