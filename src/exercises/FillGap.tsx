import { useEffect, useMemo, useState } from 'react'
import type { ShellCtx } from './ExerciseShell'
import { SENTENCES } from '@/data/sentences'
import { sampleN, shuffle } from '@/lib/utils'
import { CheckIcon, XIcon, SpeakerIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'
import { hapticError, hapticSuccess } from '@/lib/haptics'

type Props = {
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
}

const TOTAL = 8

export default function FillGap({ onAnswer, onComplete, ctx }: Props) {
  const questions = useMemo(() => shuffle(SENTENCES.filter((s) => s.gap)).slice(0, TOTAL), [])
  const q = questions[ctx.index]
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => { setPicked(null) }, [q])

  if (!q || !q.gap) return null

  const options = useMemo(() => {
    const ds = q.gap!.distractors
    // Deduplicate (some entries may have repeats)
    const uniq = Array.from(new Set([q.gap!.word, ...ds]))
    // If too few, add a generic distractor
    while (uniq.length < 4) uniq.push(`—`)
    return shuffle(sampleN(uniq, 4))
  }, [q])

  const before = q.fi.split(q.gap.word)[0]
  const after = q.fi.substring(before.length + q.gap.word.length)

  const pick = (opt: string) => {
    if (picked) return
    const correct = opt === q.gap!.word
    setPicked(opt)
    onAnswer(`sentence-${q.id}`, correct)
    if (correct) { ctx.markCorrect(); hapticSuccess() } else { ctx.markWrong(); hapticError() }
    window.setTimeout(() => {
      const isLast = ctx.index + 1 >= TOTAL
      if (isLast) onComplete(ctx.correctCount + (correct ? 1 : 0), TOTAL)
      else ctx.advance()
    }, correct ? 700 : 1500)
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Fill in the gap</div>
        <div className="text-2xl leading-relaxed font-medium">
          <span>{before}</span>
          <span className={`inline-block align-baseline mx-1 px-2 py-0.5 rounded-lg border-2 border-dashed ${
            picked
              ? picked === q.gap.word
                ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                : 'border-rose-400 bg-rose-50 text-rose-900'
              : 'border-slate-300 text-slate-400'
          }`}>
            {picked ? (picked === q.gap.word ? q.gap.word : `${picked} → ${q.gap.word}`) : '______'}
          </span>
          <span>{after}</span>
        </div>
        <div className="text-sm text-slate-500 mt-3">{q.en}</div>
        <button onClick={() => speak(q.fi.replace(q.gap!.word, q.gap!.word))} className="mt-3 inline-flex items-center gap-1 text-finnish-500 text-sm font-medium">
          <SpeakerIcon size={16} /> Hear full sentence
        </button>
      </div>

      <div className="grid gap-2.5">
        {options.map((opt) => {
          const isPicked = picked === opt
          const isCorrect = opt === q.gap!.word
          let cls = 'choice'
          if (picked) {
            if (isCorrect) cls += ' choice-correct'
            else if (isPicked && !isCorrect) cls += ' choice-wrong'
          }
          return (
            <button key={opt} onClick={() => pick(opt)} className={cls} disabled={!!picked}>
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {picked && isCorrect && <CheckIcon size={18} className="text-emerald-600" />}
                {picked && isPicked && !isCorrect && <XIcon size={18} className="text-rose-600" />}
              </div>
            </button>
          )
        })}
      </div>

      {picked && q.gap.explain && (
        <div className="rounded-lg bg-sun-50 text-sun-500 dark:bg-sun-500/10 dark:text-sun-200 text-sm px-3 py-2">
          💡 {q.gap.explain}
        </div>
      )}
    </div>
  )
}
