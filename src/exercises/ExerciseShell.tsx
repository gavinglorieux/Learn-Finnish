import { useState, type ReactNode } from 'react'

export type ShellCtx = {
  index: number
  total: number
  advance: () => void
  markCorrect: () => void
  markWrong: () => void
  correctCount: number
}

export default function ExerciseShell({
  total,
  children,
  exerciseKey
}: {
  total: number
  children: (ctx: ShellCtx) => ReactNode
  exerciseKey: string
}) {
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const advance = () => setIndex((i) => i + 1)
  const markCorrect = () => setCorrectCount((c) => c + 1)
  const markWrong = () => {}

  const pct = total > 0 ? Math.min(1, index / total) : 0

  return (
    <div>
      <div className="progress-bar mb-5">
        <span style={{ width: `${pct * 100}%` }} />
      </div>
      <div key={`${exerciseKey}-${index}`} className="animate-fade-in">
        {children({ index, total, advance, markCorrect, markWrong, correctCount })}
      </div>
    </div>
  )
}
