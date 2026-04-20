import { useEffect, useMemo, useState } from 'react'
import { WORDS, type Word } from '@/data/vocabulary'
import type { ShellCtx } from './ExerciseShell'
import { sampleN, shuffle } from '@/lib/utils'
import { speak, ttsAvailable } from '@/lib/tts'
import { SpeakerIcon, CheckIcon, XIcon } from '@/components/Icons'
import { hapticError, hapticSuccess } from '@/lib/haptics'

type Props = {
  pool: Word[]
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
}

export default function ListenMatch({ pool, onAnswer, onComplete, ctx }: Props) {
  const word = pool[ctx.index]
  const options = useMemo(() => {
    const distractors = sampleN(WORDS.filter((w) => w.id !== word.id && w.category === word.category), 3)
    const extra = distractors.length < 3 ? sampleN(WORDS.filter((w) => w.id !== word.id), 3 - distractors.length) : []
    return shuffle([word, ...distractors, ...extra].slice(0, 4))
  }, [word])
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    setPicked(null)
    // speak immediately on question entry
    const t = window.setTimeout(() => speak(word.fi), 150)
    return () => window.clearTimeout(t)
  }, [word])

  if (!word) return null

  const pick = (id: string) => {
    if (picked) return
    const correct = id === word.id
    setPicked(id)
    onAnswer(word.id, correct)
    if (correct) { ctx.markCorrect(); hapticSuccess() } else { ctx.markWrong(); hapticError() }
    window.setTimeout(() => {
      const isLast = ctx.index + 1 >= ctx.total
      if (isLast) onComplete(ctx.correctCount + (correct ? 1 : 0), ctx.total)
      else ctx.advance()
    }, correct ? 650 : 1300)
  }

  return (
    <div className="space-y-6">
      <div className="card p-8 text-center">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-4">Listen and pick the meaning</div>
        <button
          onClick={() => speak(word.fi)}
          className="mx-auto rounded-full p-6 bg-finnish-500 text-white shadow-card hover:bg-finnish-600 active:scale-95 transition"
          aria-label="Play"
        >
          <SpeakerIcon size={36} />
        </button>
        {!ttsAvailable() && (
          <div className="mt-3 text-xs text-rose-500">
            Speech not available — showing word: <strong>{word.fi}</strong>
          </div>
        )}
        {picked && (
          <div className="mt-4 text-sm text-slate-500">Finnish: <strong className="text-slate-700 dark:text-slate-200">{word.fi}</strong></div>
        )}
      </div>
      <div className="grid gap-2.5">
        {options.map((o) => {
          const isPicked = picked === o.id
          const isCorrect = o.id === word.id
          let cls = 'choice'
          if (picked) {
            if (isCorrect) cls += ' choice-correct'
            else if (isPicked && !isCorrect) cls += ' choice-wrong'
          }
          return (
            <button key={o.id} onClick={() => pick(o.id)} className={cls} disabled={!!picked}>
              <div className="flex items-center justify-between">
                <span>{o.en}</span>
                {picked && isCorrect && <CheckIcon size={18} className="text-emerald-600" />}
                {picked && isPicked && !isCorrect && <XIcon size={18} className="text-rose-600" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
