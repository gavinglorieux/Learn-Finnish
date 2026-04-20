import { useEffect, useMemo, useState } from 'react'
import { WORDS, type Word } from '@/data/vocabulary'
import type { ShellCtx } from './ExerciseShell'
import { shuffle, sampleN } from '@/lib/utils'
import { speak } from '@/lib/tts'
import { SpeakerIcon, CheckIcon, XIcon } from '@/components/Icons'
import { hapticError, hapticSuccess } from '@/lib/haptics'

type Props = {
  pool: Word[]
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
  autoSpeak?: boolean
}

export default function MultipleChoice({ pool, onAnswer, onComplete, ctx, autoSpeak }: Props) {
  const word = pool[ctx.index]
  // Randomize direction each question: ~60% FI→EN, 40% EN→FI for variety
  const fiToEn = useMemo(() => Math.random() > 0.4, [word])

  const options = useMemo(() => {
    const sourceKey = fiToEn ? 'en' : 'fi'
    const correct = word[sourceKey]
    // Find distractors from the same category if possible
    const sameCat = WORDS.filter((w) => w.category === word.category && w.id !== word.id)
    const candidates = sameCat.length >= 3 ? sameCat : WORDS.filter((w) => w.id !== word.id)
    const distractors = sampleN(candidates, 3).map((w) => w[sourceKey])
    return shuffle([correct, ...distractors])
  }, [word, fiToEn])

  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    setPicked(null)
    if (autoSpeak && word) speak(word.fi)
  }, [word, autoSpeak])

  if (!word) return null

  const handlePick = (opt: string) => {
    if (picked) return
    const correctText = fiToEn ? word.en : word.fi
    const correct = opt === correctText
    setPicked(opt)
    onAnswer(word.id, correct)
    if (correct) { ctx.markCorrect(); hapticSuccess() } else { ctx.markWrong(); hapticError() }
    const isLast = ctx.index + 1 >= ctx.total
    window.setTimeout(() => {
      if (isLast) onComplete(ctx.correctCount + (correct ? 1 : 0), ctx.total)
      else ctx.advance()
    }, correct ? 550 : 1100)
  }

  const correctText = fiToEn ? word.en : word.fi
  const questionText = fiToEn ? word.fi : word.en

  return (
    <div className="space-y-6">
      <div className="card p-6 text-center">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          {fiToEn ? 'Translate to English' : 'Translate to Finnish'}
        </div>
        <div className="text-3xl font-bold break-words" lang={fiToEn ? 'fi' : 'en'}>{questionText}</div>
        {fiToEn && (
          <button onClick={() => speak(word.fi)} className="mt-3 inline-flex items-center gap-1 text-finnish-500 text-sm font-medium">
            <SpeakerIcon size={16} /> Hear it
          </button>
        )}
      </div>
      <div className="grid gap-2.5">
        {options.map((opt) => {
          const isPicked = picked === opt
          const isCorrect = opt === correctText
          let cls = 'choice'
          if (picked) {
            if (isCorrect) cls += ' choice-correct'
            else if (isPicked && !isCorrect) cls += ' choice-wrong'
          }
          return (
            <button key={opt} onClick={() => handlePick(opt)} className={cls} disabled={!!picked} lang={fiToEn ? 'en' : 'fi'}>
              <div className="flex items-center justify-between">
                <span>{opt}</span>
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
