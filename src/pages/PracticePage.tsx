import { Link } from 'react-router-dom'
import { useApp } from '@/state/AppState'
import { dueWordIds } from '@/lib/srs'
import { WORDS } from '@/data/vocabulary'
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
  { id: 'conjugate', title: 'Verb conjugator', emoji: '⚙️', accent: 'from-cyan-500 to-cyan-700', body: 'Conjugate Type 1 & Type 2 verbs for every person.', path: '/practice/conjugate' },
  { id: 'fill-gap', title: 'Fill the gap', emoji: '📝', accent: 'from-amber-500 to-amber-700', body: 'Complete sentences with the right word or form.', path: '/practice/fill-gap' },
  { id: 'course', title: 'Course exercises', emoji: '🎓', accent: 'from-finnish-600 to-finnish-700', body: 'Real class exercises — type the missing word in inflected form.', path: '/practice/course' }
]

export default function PracticePage() {
  const { srs } = useApp()
  const due = useMemo(() => dueWordIds(srs).length, [srs])
  const seen = useMemo(() => Object.keys(srs).length, [srs])
  const unseen = WORDS.length - seen
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
    </div>
  )
}
