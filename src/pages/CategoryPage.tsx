import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { CATEGORIES, wordsByCategory, type Word } from '@/data/vocabulary'
import { useApp } from '@/state/AppState'
import { masteryLevel } from '@/lib/srs'
import { ChevronLeftIcon, SpeakerIcon, DumbbellIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { srs } = useApp()
  const cat = CATEGORIES.find((c) => c.id === categoryId)

  // Merged categories aggregate words from multiple source items, so dedupe on
  // the (fi, en) pair to avoid showing the same word twice on the topic page.
  const words = useMemo<Word[]>(() => {
    if (!cat) return []
    const raw = wordsByCategory(cat.id)
    const seen = new Set<string>()
    const out: Word[] = []
    for (const w of raw) {
      const k = `${w.fi.toLowerCase()}|${w.en.toLowerCase()}`
      if (seen.has(k)) continue
      seen.add(k)
      out.push(w)
    }
    return out
  }, [cat])

  if (!cat) return <div>Not found.</div>

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        <ChevronLeftIcon size={16} /> Back
      </button>
      <div className="flex items-start gap-4">
        <div className="text-5xl">{cat.emoji}</div>
        <div>
          <h1 className="text-2xl font-bold">{cat.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{cat.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={`/practice/flashcards?category=${cat.id}`} className="btn-primary flex items-center gap-2"><DumbbellIcon size={18} /> Practise flashcards</Link>
        <Link to={`/practice/multiple-choice?category=${cat.id}`} className="btn-secondary">Multiple choice</Link>
        <Link to={`/practice/listen?category=${cat.id}`} className="btn-secondary">Listen & match</Link>
        <Link to={`/practice/typing?category=${cat.id}`} className="btn-secondary">Typing</Link>
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-800">
        {words.map((w) => {
          const m = masteryLevel(srs[w.id])
          return (
            <div key={w.id} className="flex items-center gap-3 px-3 sm:px-4 py-3">
              <button
                onClick={() => speak(w.fi)}
                className="shrink-0 rounded-full p-2 bg-finnish-50 text-finnish-500 hover:bg-finnish-100 dark:bg-slate-800 dark:text-finnish-200"
                aria-label={`Pronounce ${w.fi}`}
              >
                <SpeakerIcon size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-semibold break-words">{w.fi}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 break-words">{w.en}</div>
                {w.notes && <div className="text-xs text-slate-400 break-words">{w.notes}</div>}
              </div>
              <div className="w-12 sm:w-16 shrink-0">
                <div className="progress-bar"><span style={{ width: `${m * 100}%` }} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
