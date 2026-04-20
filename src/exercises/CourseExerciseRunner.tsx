import { useEffect, useMemo, useRef, useState } from 'react'
import { COURSE_EXERCISES, type CourseExercise } from '@/data/course'
import { useApp } from '@/state/AppState'
import { answerMatches } from '@/lib/utils'
import { speak } from '@/lib/tts'
import { hapticError, hapticSuccess } from '@/lib/haptics'
import { SpeakerIcon, CheckIcon, XIcon } from '@/components/Icons'
import SessionSummary from './SessionSummary'

// Renders one official course exercise: real sentences with a specific word blanked out.
// Learner types the inflected answer (e.g. the correct adessive form).

export default function CourseExerciseRunner({ exerciseId, onExit }: { exerciseId: string; onExit: () => void }) {
  const ex: CourseExercise | undefined = useMemo(() => COURSE_EXERCISES.find((e) => e.id === exerciseId), [exerciseId])
  const { award, reviewWord, endSession } = useApp()

  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState<{ correct: number; total: number; xp: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInput('')
    setState('idle')
    inputRef.current?.focus()
  }, [index])

  if (!ex) {
    return <div className="card p-5 text-center">Exercise not found.</div>
  }

  const q = ex.items[index]
  const total = ex.items.length

  if (finished) {
    return <SessionSummary correct={finished.correct} total={finished.total} xp={finished.xp} onRestart={() => { setIndex(0); setCorrectCount(0); setFinished(null) }} onExit={onExit} />
  }

  if (!q) return null

  const blanked = q.sentenceFi.replace(new RegExp(escapeRegex(q.answer), 'i'), '_____')

  const submit = () => {
    if (state !== 'idle') return
    const ok = answerMatches(input, q.answer)
    setState(ok ? 'correct' : 'wrong')
    const wordKey = `course-${ex.id}-${index}`
    reviewWord(wordKey, ok)
    if (ok) { award(10); setCorrectCount((c) => c + 1); hapticSuccess() } else { hapticError() }
    window.setTimeout(() => {
      if (index + 1 >= total) {
        const c = correctCount + (ok ? 1 : 0)
        const bonus = c === total ? 20 : 0
        if (bonus) award(bonus)
        endSession()
        setFinished({ correct: c, total, xp: c * 10 + bonus })
      } else {
        setIndex((i) => i + 1)
      }
    }, ok ? 650 : 1400)
  }

  const insert = (c: string) => {
    if (state !== 'idle') return
    setInput((s) => s + c)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="progress-bar"><span style={{ width: `${(index / total) * 100}%` }} /></div>
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="text-sm text-slate-500 hover:text-slate-700">Exit</button>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-slate-400">Course exercise · L{ex.lesson ?? '—'}</div>
          <div className="text-sm font-semibold truncate max-w-[18rem]">{ex.title}</div>
        </div>
      </div>
      {ex.instruction && <div className="text-sm text-slate-500 dark:text-slate-400">{ex.instruction}</div>}

      <div className="card p-6">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Question {q.number ?? index + 1} of {total}</div>
        {q.promptNoun && (
          <div className="text-xs text-slate-400 mb-1">Base word: <strong>{q.promptNoun}</strong></div>
        )}
        <div className="text-xl font-medium leading-relaxed">{blanked}</div>
        {q.sentenceEn && <div className="text-sm text-slate-500 mt-1">{q.sentenceEn}</div>}
        <button onClick={() => speak(q.sentenceFi)} className="mt-3 inline-flex items-center gap-1 text-finnish-500 text-sm font-medium">
          <SpeakerIcon size={16} /> Hear full sentence
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={state !== 'idle'}
          lang="fi"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type the missing word…"
          className={`w-full rounded-xl border-2 px-4 py-4 text-lg font-semibold bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-finnish-400
            ${state === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100' : ''}
            ${state === 'wrong' ? 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100 animate-shake' : ''}
            ${state === 'idle' ? 'border-slate-200 dark:border-slate-800' : ''}
          `}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {['ä', 'ö', 'å'].map((c) => (
              <button key={c} type="button" onClick={() => insert(c)} className="btn-secondary !px-3 !py-1.5 text-base">{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {state === 'idle' && (
              <button type="button" onClick={() => setInput(q.answer)} className="text-xs text-slate-400 hover:underline">
                Reveal
              </button>
            )}
            <button type="submit" disabled={!input.trim() || state !== 'idle'} className="btn-primary disabled:opacity-50">Check</button>
          </div>
        </div>
        {state === 'wrong' && (
          <div className="text-sm rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200 px-3 py-2 flex items-center gap-2">
            <XIcon size={16} /> Answer: <strong>{q.answer}</strong>
          </div>
        )}
        {state === 'correct' && (
          <div className="text-sm rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 px-3 py-2 flex items-center gap-2">
            <CheckIcon size={16} /> Nice!
          </div>
        )}
      </form>
    </div>
  )
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
