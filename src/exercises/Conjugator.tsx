import { useEffect, useMemo, useRef, useState } from 'react'
import type { ShellCtx } from './ExerciseShell'
import { VERBS, PERSONS, PERSON_EN, type Person, type Verb } from '@/data/verbs'
import { answerMatches, sample, shuffle } from '@/lib/utils'
import { hapticError, hapticSuccess } from '@/lib/haptics'

type Question = {
  verb: Verb
  person: Person
  negative: boolean
  expected: string
}

type Props = {
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
}

const TOTAL = 10

export default function Conjugator({ onAnswer, onComplete, ctx }: Props) {
  // Build a fixed set of questions at mount
  const questions = useMemo<Question[]>(() => {
    const qs: Question[] = []
    for (let i = 0; i < TOTAL; i++) {
      const verb = sample(VERBS)
      const person = sample(PERSONS)
      // 25% negative; negative form is e.g. "en puhu"
      const negative = Math.random() < 0.25
      const expected = negative ? `${negFor(person)} ${verb.negativeStem}` : verb.forms[person]
      qs.push({ verb, person, negative, expected })
    }
    return qs
  }, [])

  const q = questions[ctx.index]
  const [input, setInput] = useState('')
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInput('')
    setState('idle')
    inputRef.current?.focus()
  }, [q])

  if (!q) return null

  const check = () => {
    if (state !== 'idle') return
    const ok = answerMatches(input, q.expected)
    setState(ok ? 'correct' : 'wrong')
    onAnswer(`verb-${q.verb.infinitive}-${q.person}-${q.negative ? 'n' : 'p'}`, ok)
    if (ok) { ctx.markCorrect(); hapticSuccess() } else { ctx.markWrong(); hapticError() }
    window.setTimeout(() => {
      const isLast = ctx.index + 1 >= TOTAL
      if (isLast) onComplete(ctx.correctCount + (ok ? 1 : 0), TOTAL)
      else ctx.advance()
    }, ok ? 700 : 1500)
  }

  const hints = useMemo(() => shuffle(['ä', 'ö']), [q])

  return (
    <div className="space-y-6">
      <div className="card p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          {q.negative ? 'Conjugate (negative)' : 'Conjugate'}
        </div>
        <div className="text-3xl font-bold">{q.verb.infinitive}</div>
        <div className="text-sm text-slate-500 mt-1">{q.verb.english} · Type {q.verb.type}{q.verb.irregular ? ' (irregular)' : ''}</div>
        <div className="mt-4 text-lg">
          {q.negative ? (
            <>For <strong>{q.person}</strong> ({PERSON_EN[q.person]}) — say <em>{PERSON_EN[q.person]} don't …</em></>
          ) : (
            <>For <strong>{q.person}</strong> ({PERSON_EN[q.person]})</>
          )}
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); check() }} className="space-y-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={state !== 'idle'}
          placeholder={q.negative ? 'e.g. en puhu' : 'e.g. puhun'}
          lang="fi"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`w-full rounded-xl border-2 px-4 py-4 text-lg font-semibold bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-finnish-400
            ${state === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100' : ''}
            ${state === 'wrong' ? 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100 animate-shake' : ''}
            ${state === 'idle' ? 'border-slate-200 dark:border-slate-800' : ''}
          `}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {hints.map((c) => (
              <button key={c} type="button" onClick={() => setInput((s) => s + c)} className="btn-secondary !px-3 !py-1.5">
                {c}
              </button>
            ))}
          </div>
          <button type="submit" disabled={!input.trim() || state !== 'idle'} className="btn-primary disabled:opacity-50">Check</button>
        </div>
        {state === 'wrong' && (
          <div className="text-sm rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200 px-3 py-2">
            Correct answer: <strong className="font-semibold">{q.expected}</strong>
          </div>
        )}
      </form>
    </div>
  )
}

function negFor(p: Person) {
  return { minä: 'en', sinä: 'et', hän: 'ei', me: 'emme', te: 'ette', he: 'eivät' }[p]
}
