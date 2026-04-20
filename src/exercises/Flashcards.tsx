import { useEffect, useState } from 'react'
import type { Word } from '@/data/vocabulary'
import type { ShellCtx } from './ExerciseShell'
import { SpeakerIcon, CheckIcon, XIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'
import { hapticError, hapticSuccess } from '@/lib/haptics'

type Props = {
  pool: Word[]
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
  autoSpeak?: boolean
}

export default function Flashcards({ pool, onAnswer, onComplete, ctx, autoSpeak }: Props) {
  const word = pool[ctx.index]
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (autoSpeak && word) speak(word.fi)
  }, [word, autoSpeak])

  const rate = (correct: boolean) => {
    onAnswer(word.id, correct)
    if (correct) {
      ctx.markCorrect()
      hapticSuccess()
    } else {
      ctx.markWrong()
      hapticError()
    }
    const isLast = ctx.index + 1 >= ctx.total
    setFlipped(false)
    if (isLast) {
      onComplete(ctx.correctCount + (correct ? 1 : 0), ctx.total)
    } else {
      ctx.advance()
    }
  }

  if (!word) return null

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-slate-500">
        Card {ctx.index + 1} of {ctx.total}
      </div>
      <div
        className={`flip ${flipped ? 'flipped' : ''} mx-auto`}
        style={{ maxWidth: 420 }}
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setFlipped((f) => !f)}
        aria-label="Tap to flip the card"
      >
        <div className="flip-inner relative h-60 sm:h-72">
          <Face>
            <div className="text-xs uppercase tracking-wide text-finnish-500 mb-2">Finnish</div>
            <div className="text-3xl sm:text-4xl font-bold break-words">{word.fi}</div>
            {word.notes && <div className="text-xs text-slate-500 mt-2">{word.notes}</div>}
            <button
              onClick={(e) => { e.stopPropagation(); speak(word.fi) }}
              className="absolute bottom-4 right-4 rounded-full p-2 bg-finnish-50 text-finnish-500 dark:bg-slate-800"
              aria-label="Pronounce"
            >
              <SpeakerIcon size={18} />
            </button>
          </Face>
          <Face back>
            <div className="text-xs uppercase tracking-wide text-emerald-500 mb-2">English</div>
            <div className="text-2xl sm:text-3xl font-semibold">{word.en}</div>
          </Face>
        </div>
      </div>
      <p className="text-center text-sm text-slate-500">Tap the card to reveal the translation.</p>
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <button onClick={() => rate(false)} className="btn-danger flex items-center justify-center gap-2 py-4">
          <XIcon size={18} /> Didn't know
        </button>
        <button onClick={() => rate(true)} className="btn-success flex items-center justify-center gap-2 py-4">
          <CheckIcon size={18} /> Got it
        </button>
      </div>
    </div>
  )
}

function Face({ children, back = false }: { children: React.ReactNode; back?: boolean }) {
  return (
    <div className={`flip-face ${back ? 'flip-back' : ''} absolute inset-0 card p-6 flex flex-col items-center justify-center text-center`}>
      {children}
    </div>
  )
}
