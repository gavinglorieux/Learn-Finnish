import { useEffect, useMemo, useRef, useState } from 'react'
import type { ShellCtx } from './ExerciseShell'
import { VERBS, PERSONS, PERSON_EN, NEG_VERB, type Person, type Verb } from '@/data/verbs'
import { answerMatches, sample } from '@/lib/utils'
import { hapticError, hapticSuccess } from '@/lib/haptics'
import { speak } from '@/lib/tts'

export type ConjugatorMode = 'mixed' | 'present' | 'negative' | 'kpt' | 'imperative'

export type ConjugatorOptions = {
  mode?: ConjugatorMode
  /** Restrict to these verb types (1–6). */
  types?: number[]
  /** Drill one verb only (e.g. olla). */
  verb?: string
}

type ImperativeKey = 'sg' | 'pl' | 'negSg' | 'negPl'
const IMPERATIVE_LABEL: Record<ImperativeKey, string> = {
  sg: 'Imperative — to one person (sinä)',
  pl: 'Imperative — to several people (te)',
  negSg: "Negative imperative — don't! (sinä)",
  negPl: "Negative imperative — don't! (te)"
}

type Question = {
  key: string
  verb: Verb
  label: string
  person?: Person
  expected: string
  hint: string
}

type Props = {
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
  options?: ConjugatorOptions
}

export const CONJUGATOR_TOTAL = 10

export const conjugatorPool = (options: ConjugatorOptions = {}): Verb[] => {
  let pool = VERBS
  if (options.verb) pool = pool.filter((v) => v.infinitive === options.verb)
  if (options.types?.length) pool = pool.filter((v) => options.types!.includes(v.type) || (options.types!.includes(5) && v.type === 6))
  if (options.mode === 'kpt') pool = pool.filter((v) => v.kpt)
  return pool.length ? pool : VERBS
}

const makeQuestion = (verb: Verb, mode: ConjugatorMode): Question => {
  const m: ConjugatorMode = mode === 'mixed' ? sample(['present', 'present', 'negative', 'imperative'] as const) : mode
  if (m === 'imperative') {
    const k = sample(['sg', 'sg', 'pl', 'negSg', 'negPl'] as ImperativeKey[])
    return { key: `imp-${verb.infinitive}-${k}`, verb, label: IMPERATIVE_LABEL[k], expected: verb.imperative[k], hint: k.startsWith('neg') ? 'e.g. älä puhu' : 'e.g. puhu!' }
  }
  const person = sample(PERSONS)
  // KPT mode: favour the persons where the grade differs from the infinitive.
  const negative = m === 'negative' || (m === 'kpt' && Math.random() < 0.25)
  const expected = negative ? `${NEG_VERB[person]} ${verb.negativeStem}` : verb.forms[person]
  return {
    key: `verb-${verb.infinitive}-${person}-${negative ? 'n' : 'p'}`,
    verb,
    person,
    label: negative ? `Negative — ${PERSON_EN[person]} don't…` : `${person} (${PERSON_EN[person]})`,
    expected,
    hint: negative ? 'e.g. en puhu' : 'e.g. puhun'
  }
}

export default function Conjugator({ onAnswer, onComplete, ctx, options = {} }: Props) {
  const mode = options.mode ?? 'mixed'
  const questions = useMemo<Question[]>(() => {
    const pool = conjugatorPool(options)
    return Array.from({ length: CONJUGATOR_TOTAL }, () => makeQuestion(sample(pool), mode))
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    onAnswer(q.key, ok)
    if (ok) { ctx.markCorrect(); hapticSuccess() } else { ctx.markWrong(); hapticError() }
    window.setTimeout(() => {
      const isLast = ctx.index + 1 >= CONJUGATOR_TOTAL
      if (isLast) onComplete(ctx.correctCount + (ok ? 1 : 0), CONJUGATOR_TOTAL)
      else ctx.advance()
    }, ok ? 700 : 1800)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Conjugate</div>
        <div className="text-3xl font-bold">{q.verb.infinitive}</div>
        <div className="text-sm text-slate-500 mt-1">
          {q.verb.english} · type {q.verb.type}
          {q.verb.irregular ? ' (irregular)' : ''}
          {q.verb.kpt ? ' · K-P-T' : ''}
        </div>
        <div className="mt-4 text-lg font-medium">{q.label}</div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); check() }} className="space-y-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={state !== 'idle'}
          placeholder={q.hint}
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
            {['ä', 'ö'].map((c) => (
              <button key={c} type="button" onClick={() => { setInput((s) => s + c); inputRef.current?.focus() }} className="btn-secondary !px-3 !py-1.5">
                {c}
              </button>
            ))}
          </div>
          <button type="submit" disabled={!input.trim() || state !== 'idle'} className="btn-primary disabled:opacity-50">Check</button>
        </div>
        {state === 'wrong' && (
          <div className="text-sm rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200 px-3 py-2">
            Correct answer: <strong className="font-semibold">{q.expected}</strong>
            <button type="button" onClick={() => speak(q.expected)} className="ml-2 underline">hear it</button>
          </div>
        )}
      </form>
    </div>
  )
}
