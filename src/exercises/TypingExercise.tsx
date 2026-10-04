import { useEffect, useRef, useState } from 'react'
import { isCorrectFinnish, type Word } from '@/data/vocabulary'
import type { ShellCtx } from './ExerciseShell'
import { speak } from '@/lib/tts'
import { hapticError, hapticSuccess } from '@/lib/haptics'
import { SpeakerIcon } from '@/components/Icons'

type Props = {
  pool: Word[]
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
}

const SPECIAL_KEYS = ['ä', 'ö', 'å']

export default function TypingExercise({ pool, onAnswer, onComplete, ctx }: Props) {
  const word = pool[ctx.index]
  const [input, setInput] = useState('')
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInput('')
    setState('idle')
    inputRef.current?.focus()
  }, [word])

  if (!word) return null

  const submit = () => {
    if (state !== 'idle') return
    // Any Finnish word with this meaning counts (mummo / mummi / isoäiti for "grandma").
    const ok = isCorrectFinnish(input, word)
    setState(ok ? 'correct' : 'wrong')
    onAnswer(word.id, ok)
    if (ok) { ctx.markCorrect(); hapticSuccess() } else { ctx.markWrong(); hapticError() }
    window.setTimeout(() => {
      const isLast = ctx.index + 1 >= ctx.total
      if (isLast) onComplete(ctx.correctCount + (ok ? 1 : 0), ctx.total)
      else ctx.advance()
    }, ok ? 650 : 1400)
  }

  const insertChar = (c: string) => {
    if (state !== 'idle') return
    setInput((s) => s + c)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Type the Finnish for</div>
        <div className="text-3xl font-bold break-words">{word.en}</div>
        {word.notes && <div className="text-xs text-slate-400 mt-2">{word.notes}</div>}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit() }}
        className="space-y-3"
      >
        <div className="relative">
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
            placeholder="Type in Finnish…"
            className={`w-full rounded-xl border-2 px-4 py-4 text-lg font-semibold bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-finnish-400
              ${state === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100' : ''}
              ${state === 'wrong' ? 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100 animate-shake' : ''}
              ${state === 'idle' ? 'border-slate-200 dark:border-slate-800' : ''}
            `}
          />
          <button type="button" onClick={() => speak(word.fi)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-finnish-500">
            <SpeakerIcon size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {SPECIAL_KEYS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => insertChar(c)}
                className="btn-secondary !px-3 !py-1.5 text-base"
                aria-label={`Insert ${c}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button type="submit" disabled={!input.trim() || state !== 'idle'} className="btn-primary disabled:opacity-50">
            Check
          </button>
        </div>

        {state === 'wrong' && (
          <div className="text-sm rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200 px-3 py-2">
            Correct answer: <strong className="font-semibold">{word.fi}</strong>
          </div>
        )}
      </form>
    </div>
  )
}
