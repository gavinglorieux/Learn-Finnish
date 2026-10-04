import { Link } from 'react-router-dom'
import { useApp } from '@/state/AppState'
import { dueWordIds } from '@/lib/srs'
import { WORDS, CATEGORIES, wordById } from '@/data/vocabulary'
import { DRILLS } from '@/data/content'
import { useMemo } from 'react'

type Mode = {
  id: string
  title: string
  body: string
  emoji: string
  accent: string
  path: string
}

const MODES: Mode[] = [
  { id: 'review', title: 'Smart review', emoji: '🧠', accent: 'from-finnish-500 to-finnish-700', body: 'Spaced repetition on words that are due. The core of long-term memory.', path: '/practice/review' },
  { id: 'flashcards', title: 'Flashcards', emoji: '🃏', accent: 'from-finnish-400 to-finnish-600', body: 'Classic flip cards with self-assessment.', path: '/practice/flashcards' },
  { id: 'multiple-choice', title: 'Multiple choice', emoji: '🔘', accent: 'from-emerald-400 to-emerald-600', body: 'Quick-fire: pick the right translation.', path: '/practice/multiple-choice' },
  { id: 'typing', title: 'Typing', emoji: '⌨️', accent: 'from-sun-400 to-sun-500', body: 'Type the Finnish — active recall at its best.', path: '/practice/typing' },
  { id: 'match', title: 'Match pairs', emoji: '🎴', accent: 'from-violet-400 to-violet-600', body: 'Memory-style pair game. Fast-paced and fun.', path: '/practice/match' },
  { id: 'listen', title: 'Listen & match', emoji: '👂', accent: 'from-rose-400 to-rose-600', body: 'Hear Finnish spoken, pick the meaning.', path: '/practice/listen' },
  { id: 'conjugate', title: 'Verb conjugator', emoji: '⚙️', accent: 'from-cyan-500 to-cyan-700', body: 'All course verbs, types 1–6: present, negative and imperative.', path: '/practice/conjugate' },
  { id: 'fill-gap', title: 'Fill the gap', emoji: '📝', accent: 'from-amber-500 to-amber-700', body: 'Complete sentences with the right word or form.', path: '/practice/fill-gap' },
  { id: 'course', title: 'Course exercises', emoji: '🎓', accent: 'from-finnish-600 to-finnish-700', body: 'Real class worksheets and grammar drills — type the missing word.', path: '/practice/course' },
  { id: 'reading', title: 'Reading', emoji: '📖', accent: 'from-teal-500 to-teal-700', body: 'Texts and dialogues from class with tap-to-translate.', path: '/texts' }
]

// Hand-picked shortlist of high-value topics for one-tap focused practice.
// Verbs is pinned first because it's the user's biggest pain point.
const TOPIC_PICK_IDS = [
  'verbs',
  'family',
  'food-meals',
  'home',
  'weather',
  'months-seasons',
  'places-town',
  'clothes',
  'illness',
  'farm-animals',
  'postpositions',
  'question-words'
] as const

const VERB_DRILLS = [
  { label: 'All verb types', to: '/practice/conjugate' },
  { label: 'K-P-T: type 1', to: '/practice/conjugate?mode=kpt&type=1' },
  { label: 'K-P-T: types 3 & 4', to: '/practice/conjugate?mode=kpt&type=3,4' },
  { label: 'Negative', to: '/practice/conjugate?mode=negative' },
  { label: 'Imperative', to: '/practice/conjugate?mode=imperative' },
  { label: 'Type 1', to: '/practice/conjugate?type=1&mode=present' },
  { label: 'Type 2', to: '/practice/conjugate?type=2&mode=present' },
  { label: 'Type 3', to: '/practice/conjugate?type=3&mode=present' },
  { label: 'Type 4', to: '/practice/conjugate?type=4&mode=present' },
  { label: 'Types 5 & 6', to: '/practice/conjugate?type=5,6&mode=present' },
  { label: 'olla', to: '/practice/conjugate?verb=olla' }
]

export default function PracticePage() {
  const { srs } = useApp()
  // The SRS store also holds verb-drill and exercise keys; only count real words.
  const due = useMemo(() => dueWordIds(srs).filter((id) => wordById(id)).length, [srs])
  const seen = useMemo(() => Object.keys(srs).filter((id) => wordById(id)).length, [srs])
  const unseen = WORDS.length - seen

  const topicPicks = useMemo(() => {
    return TOPIC_PICK_IDS
      .map((id) => CATEGORIES.find((c) => c.id === id))
      .filter((c): c is (typeof CATEGORIES)[number] => Boolean(c))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="text-slate-500 dark:text-slate-400">Mix up exercise types — variety keeps memory sticky.</p>
      </div>

      <div className="card p-4 flex items-center gap-4">
        <div className="text-3xl">🧠</div>
        <div className="flex-1">
          <div className="font-semibold">Smart review queue</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {due > 0 ? `${due} word${due === 1 ? '' : 's'} due now` : `You're all caught up. ${unseen} words still to discover.`}
          </div>
        </div>
        <Link to="/practice/review" className="btn-primary">Start</Link>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-semibold">Practice a topic</h2>
          <Link to="/learn" className="text-xs text-finnish-500 hover:underline">All topics →</Link>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drill one theme at a time. Tap a topic for a multiple-choice round.</p>
        <div className="flex flex-wrap gap-2">
          {topicPicks.map((c) => (
            <Link
              key={c.id}
              to={`/practice/multiple-choice?category=${c.id}`}
              className="chip !text-sm !py-1.5 !px-3 hover:bg-finnish-50 dark:hover:bg-slate-800"
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.title}
              <span className="ml-1.5 text-slate-400">· {c.wordCount}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Verb drills</h2>
        <div className="flex flex-wrap gap-2">
          {VERB_DRILLS.map((d) => (
            <Link key={d.to} to={d.to} className="chip !text-sm !py-1.5 !px-3 hover:bg-finnish-50 dark:hover:bg-slate-800">⚙️ {d.label}</Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-semibold">Grammar drills</h2>
          <Link to="/practice/course" className="text-xs text-finnish-500 hover:underline">All exercises →</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {DRILLS.map((d) => (
            <Link key={d.id} to={`/practice/course/${d.id}`} className="chip !text-sm !py-1.5 !px-3 hover:bg-finnish-50 dark:hover:bg-slate-800">🎯 {d.title}</Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">All exercise modes</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODES.filter((m) => m.id !== 'review').map((m) => (
            <Link key={m.id} to={m.path} className="card p-4 flex gap-3 min-w-0 hover:-translate-y-0.5 transition">
              <div className={`shrink-0 rounded-xl text-white text-2xl w-12 h-12 flex items-center justify-center bg-gradient-to-br ${m.accent}`}>{m.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{m.title}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{m.body}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
