import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { WORDS, CATEGORIES, wordsByCategory, type Word } from '@/data/vocabulary'
type CategoryId = string
import { useApp } from '@/state/AppState'
import { dueWordIds } from '@/lib/srs'
import Flashcards from '@/exercises/Flashcards'
import MultipleChoice from '@/exercises/MultipleChoice'
import TypingExercise from '@/exercises/TypingExercise'
import MatchPairs from '@/exercises/MatchPairs'
import ListenMatch from '@/exercises/ListenMatch'
import Conjugator from '@/exercises/Conjugator'
import FillGap from '@/exercises/FillGap'
import ExerciseShell from '@/exercises/ExerciseShell'
import SessionSummary from '@/exercises/SessionSummary'
import { shuffle } from '@/lib/utils'
import { ChevronLeftIcon } from '@/components/Icons'

const SESSION_LEN = 10

type ExerciseId = 'review' | 'flashcards' | 'multiple-choice' | 'typing' | 'match' | 'listen' | 'conjugate' | 'fill-gap'

const TITLES: Record<ExerciseId, { title: string; sub: string }> = {
  'review': { title: 'Smart review', sub: 'Words due right now.' },
  'flashcards': { title: 'Flashcards', sub: 'Flip the card, rate yourself.' },
  'multiple-choice': { title: 'Multiple choice', sub: 'Pick the correct translation.' },
  'typing': { title: 'Typing', sub: 'Type the Finnish word.' },
  'match': { title: 'Match pairs', sub: 'Tap matching Finnish and English tiles.' },
  'listen': { title: 'Listen & match', sub: 'Hear Finnish, pick the meaning.' },
  'conjugate': { title: 'Verb conjugator', sub: 'Conjugate for the given person.' },
  'fill-gap': { title: 'Fill the gap', sub: 'Complete the sentence.' }
}

export default function ExercisePage() {
  const { exerciseId } = useParams()
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const { srs, award, reviewWord, endSession, settings } = useApp()

  const ex = (exerciseId ?? 'flashcards') as ExerciseId
  const categoryFilter = search.get('category') as CategoryId | null

  const pool = useMemo<Word[]>(() => {
    let list = WORDS
    if (categoryFilter) {
      // wordsByCategory handles synthetic categories (e.g. "verbs") that aren't
      // backed by a single source item — fall back to the simple filter for the rest.
      const scoped = wordsByCategory(categoryFilter)
      list = scoped.length > 0 ? scoped : list.filter((w) => w.category === categoryFilter)
    }
    if (ex === 'review') {
      const dueIds = dueWordIds(srs)
      const dueWords = dueIds.map((id) => WORDS.find((w) => w.id === id)).filter((w): w is Word => !!w)
      // fill with unseen / lowest-mastery if we don't have enough
      const unseen = list.filter((w) => !srs[w.id])
      const combined = [...dueWords, ...unseen]
      if (combined.length < SESSION_LEN) {
        combined.push(...shuffle(list).slice(0, SESSION_LEN - combined.length))
      }
      return combined.slice(0, SESSION_LEN)
    }
    // remove single-token-less-helpful words for match/typing (e.g., super long phrases)
    if (ex === 'match' || ex === 'typing') {
      list = list.filter((w) => w.fi.length <= 18)
    }
    return shuffle(list).slice(0, SESSION_LEN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex, categoryFilter])

  const [results, setResults] = useState<{ correct: number; total: number; xp: number } | null>(null)

  const onAnswer = (wordId: string, correct: boolean, points = correct ? 10 : 0) => {
    reviewWord(wordId, correct)
    if (points > 0) award(points)
  }

  const onComplete = (correct: number, total: number) => {
    endSession()
    const bonus = correct === total ? 20 : 0
    if (bonus) award(bonus)
    setResults({ correct, total, xp: correct * 10 + bonus })
  }

  const onExit = () => navigate(-1)
  const onRestart = () => window.location.reload()

  if (!TITLES[ex]) {
    return (
      <div className="card p-6 text-center">
        <p>Unknown exercise.</p>
        <button className="btn-secondary mt-3" onClick={() => navigate('/practice')}>Back to practice</button>
      </div>
    )
  }

  const categoryLabel = categoryFilter ? CATEGORIES.find((c) => c.id === categoryFilter)?.title : undefined

  if (pool.length === 0) {
    return (
      <div className="card p-6 text-center space-y-3 animate-fade-in">
        <div className="text-4xl">🎉</div>
        <h2 className="text-xl font-semibold">All caught up!</h2>
        <p className="text-slate-500 dark:text-slate-400">No words to review right now. Try a different mode or topic.</p>
        <button className="btn-primary" onClick={() => navigate('/practice')}>Back to practice</button>
      </div>
    )
  }

  if (results) {
    return <SessionSummary correct={results.correct} total={results.total} xp={results.xp} onRestart={onRestart} onExit={onExit} />
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onExit} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ChevronLeftIcon size={16} /> Exit
        </button>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-slate-400">{ex}</div>
          <div className="text-sm font-semibold">
            {TITLES[ex].title}
            {categoryLabel && <span className="text-slate-400"> · {categoryLabel}</span>}
          </div>
        </div>
      </div>
      <ExerciseShell total={ex === 'match' ? 1 : pool.length} exerciseKey={ex}>
        {(ctx) => {
          const shared = { pool, onAnswer, onComplete, ctx, autoSpeak: settings.autoSpeakFinnish }
          switch (ex) {
            case 'review':
              return <MultipleChoice {...shared} />
            case 'flashcards':
              return <Flashcards {...shared} />
            case 'multiple-choice':
              return <MultipleChoice {...shared} />
            case 'typing':
              return <TypingExercise {...shared} />
            case 'match':
              return <MatchPairs {...shared} />
            case 'listen':
              return <ListenMatch {...shared} />
            case 'conjugate':
              return <Conjugator onAnswer={onAnswer} onComplete={onComplete} ctx={ctx} />
            case 'fill-gap':
              return <FillGap onAnswer={onAnswer} onComplete={onComplete} ctx={ctx} />
          }
        }}
      </ExerciseShell>
    </div>
  )
}
