import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { exerciseById, grammarById, lessonById, lessonLabel, type Exercise } from '@/data/content'
import { useApp } from '@/state/AppState'
import { answerMatches } from '@/lib/utils'
import { speak } from '@/lib/tts'
import { hapticError, hapticSuccess } from '@/lib/haptics'
import { SpeakerIcon, CheckIcon, XIcon } from '@/components/Icons'
import SessionSummary from './SessionSummary'

// Runs one course exercise or grammar drill: a Finnish prompt with a gap (____),
// and the learner types the missing (usually inflected) word.

const BLANK = '____'

export const isCorrectAnswer = (input: string, answer: string, accept: string[] = []): boolean =>
  [answer, ...accept, ...answer.split(/\s*\/\s*/)].some((a) => answerMatches(input, a))

export default function CourseExerciseRunner({ exerciseId, onExit }: { exerciseId: string; onExit: () => void }) {
  const ex: Exercise | undefined = useMemo(() => exerciseById(exerciseId), [exerciseId])
  const { award, reviewWord, endSession } = useApp()

  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [state, setState] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle')
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
    return (
      <SessionSummary
        correct={finished.correct}
        total={finished.total}
        xp={finished.xp}
        onRestart={() => { setIndex(0); setCorrectCount(0); setFinished(null) }}
        onExit={onExit}
      />
    )
  }

  if (!q) return null

  const hasBlank = q.prompt.includes(BLANK)
  const [before, after] = hasBlank ? [q.prompt.slice(0, q.prompt.indexOf(BLANK)), q.prompt.slice(q.prompt.indexOf(BLANK) + BLANK.length)] : [q.prompt, '']
  const full = hasBlank ? `${before}${q.answer}${after}` : q.answer
  const lesson = ex.lessons[0] ? lessonById(ex.lessons[0]) : undefined
  const topic = ex.topic ? grammarById(ex.topic) : undefined

  const next = (ok: boolean) => {
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
    }, ok ? 700 : 2200)
  }

  const submit = () => {
    if (state !== 'idle') return
    const ok = isCorrectAnswer(input, q.answer, q.accept)
    setState(ok ? 'correct' : 'wrong')
    reviewWord(`course-${ex.id}-${index}`, ok)
    if (ok) { award(10); setCorrectCount((c) => c + 1); hapticSuccess() } else { hapticError() }
    next(ok)
  }

  const reveal = () => {
    if (state !== 'idle') return
    setState('revealed')
    reviewWord(`course-${ex.id}-${index}`, false)
    next(false)
  }

  const insert = (c: string) => {
    if (state !== 'idle') return
    setInput((s) => s + c)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="progress-bar"><span style={{ width: `${(index / total) * 100}%` }} /></div>
      <div className="flex items-center justify-between gap-3">
        <button onClick={onExit} className="text-sm text-slate-500 hover:text-slate-700">Exit</button>
        <div className="text-right min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-400 truncate">
            {ex.kind === 'drill' ? 'Grammar drill' : lesson ? lessonLabel(lesson) : 'Course exercise'}
          </div>
          <div className="text-sm font-semibold truncate max-w-[16rem] sm:max-w-md">{ex.title}</div>
        </div>
      </div>
      {ex.instruction && <div className="text-sm text-slate-500 dark:text-slate-400">{ex.instruction}</div>}

      <div className="card p-6">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Question {index + 1} of {total}</div>
        {q.base && <div className="text-sm text-slate-500 mb-2">Word: <strong className="text-slate-700 dark:text-slate-200">{q.base}</strong></div>}
        <div className="text-xl font-medium leading-relaxed break-words">
          {before}
          {hasBlank && (
            <span className={`inline-block mx-1 px-2 rounded-md border-b-2 ${state === 'idle' ? 'border-slate-300 text-slate-300' : state === 'correct' ? 'border-emerald-400 text-emerald-700 dark:text-emerald-300' : 'border-rose-400 text-rose-700 dark:text-rose-300'}`}>
              {state === 'idle' ? '_____' : q.answer}
            </span>
          )}
          {after}
        </div>
        {q.en && <div className="text-sm text-slate-500 mt-2">{q.en}</div>}
        {state !== 'idle' && (
          <button onClick={() => speak(full)} className="mt-3 inline-flex items-center gap-1 text-finnish-500 text-sm font-medium">
            <SpeakerIcon size={16} /> Hear it
          </button>
        )}
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
          placeholder={hasBlank ? 'Type the missing word…' : 'Type your answer…'}
          className={`w-full rounded-xl border-2 px-4 py-4 text-lg font-semibold bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-finnish-400
            ${state === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100' : ''}
            ${state === 'wrong' ? 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100 animate-shake' : ''}
            ${state === 'idle' || state === 'revealed' ? 'border-slate-200 dark:border-slate-800' : ''}
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
              <button type="button" onClick={reveal} className="text-xs text-slate-400 hover:underline">
                Show answer
              </button>
            )}
            <button type="submit" disabled={!input.trim() || state !== 'idle'} className="btn-primary disabled:opacity-50">Check</button>
          </div>
        </div>
        {(state === 'wrong' || state === 'revealed') && (
          <div className="text-sm rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200 px-3 py-2 flex items-center gap-2">
            <XIcon size={16} /> Answer: <strong>{q.answer}</strong>
          </div>
        )}
        {state === 'correct' && (
          <div className="text-sm rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 px-3 py-2 flex items-center gap-2">
            <CheckIcon size={16} /> Oikein!
          </div>
        )}
      </form>

      {topic && (
        <Link to={`/grammar/${topic.id}`} className="block text-sm text-finnish-500 hover:underline">
          {topic.emoji} Review the grammar: {topic.title} →
        </Link>
      )}
      {ex.answerSource === 'derived' && (
        <p className="text-[11px] text-slate-400">The worksheet had no answer key; answers were worked out when it was transcribed.</p>
      )}
    </div>
  )
}
