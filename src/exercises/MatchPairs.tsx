import { useEffect, useMemo, useState } from 'react'
import type { Word } from '@/data/vocabulary'
import type { ShellCtx } from './ExerciseShell'
import { glossKey, shuffle, uniqueBy } from '@/lib/utils'
import { hapticError, hapticSuccess } from '@/lib/haptics'

type Tile = { id: string; wordId: string; lang: 'fi' | 'en'; text: string; matched?: boolean; wrong?: boolean }

type Props = {
  pool: Word[]
  onAnswer: (wordId: string, correct: boolean) => void
  onComplete: (correct: number, total: number) => void
  ctx: ShellCtx
}

export default function MatchPairs({ pool, onAnswer, onComplete }: Props) {
  // Up to 8 words per round; two tiles with the same English (or Finnish) would make a pair unguessable.
  const subset = useMemo(() => uniqueBy(uniqueBy(pool, (w) => glossKey(w.en)), (w) => glossKey(w.fi)).slice(0, 8), [pool])
  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(subset))
  const [selected, setSelected] = useState<Tile | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [pairs, setPairs] = useState(0)

  useEffect(() => {
    setTiles(buildTiles(subset))
    setSelected(null)
    setMistakes(0)
    setPairs(0)
  }, [subset])

  useEffect(() => {
    if (pairs === subset.length && subset.length > 0) {
      const correctCount = subset.length - mistakes
      // Ensure non-negative
      onComplete(Math.max(0, correctCount), subset.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs])

  const tap = (tile: Tile) => {
    if (tile.matched) return
    if (selected && selected.id === tile.id) { setSelected(null); return }
    if (!selected) { setSelected(tile); return }

    if (selected.wordId === tile.wordId && selected.lang !== tile.lang) {
      // match
      setTiles((prev) => prev.map((t) => (t.wordId === tile.wordId ? { ...t, matched: true } : t)))
      setSelected(null)
      setPairs((p) => p + 1)
      onAnswer(tile.wordId, true)
      hapticSuccess()
    } else {
      setTiles((prev) => prev.map((t) => (t.id === selected.id || t.id === tile.id ? { ...t, wrong: true } : t)))
      setMistakes((m) => m + 1)
      onAnswer(selected.wordId, false)
      hapticError()
      window.setTimeout(() => {
        setTiles((prev) => prev.map((t) => ({ ...t, wrong: false })))
        setSelected(null)
      }, 600)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div>Pairs: <strong>{pairs}/{subset.length}</strong></div>
        <div>Mistakes: <strong>{mistakes}</strong></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tiles.map((t) => {
          let cls = 'choice text-center'
          if (t.matched) cls += ' opacity-30 pointer-events-none'
          if (selected?.id === t.id) cls += ' ring-2 ring-finnish-400 border-finnish-300'
          if (t.wrong) cls += ' choice-wrong animate-shake'
          return (
            <button key={t.id} onClick={() => tap(t)} className={cls} lang={t.lang}>
              <div className="text-xs uppercase tracking-wide text-slate-400 mb-0.5">{t.lang === 'fi' ? 'FI' : 'EN'}</div>
              <div className="font-semibold break-words">{t.text}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function buildTiles(words: Word[]): Tile[] {
  const tiles: Tile[] = []
  for (const w of words) {
    tiles.push({ id: `${w.id}-fi`, wordId: w.id, lang: 'fi', text: w.fi })
    tiles.push({ id: `${w.id}-en`, wordId: w.id, lang: 'en', text: w.en })
  }
  return shuffle(tiles)
}
