import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { CATEGORIES, wordsByCategory, type Word } from '@/data/vocabulary'
import { verbByInfinitive, PERSONS } from '@/data/verbs'
import { useApp } from '@/state/AppState'
import { masteryLevel } from '@/lib/srs'
import { ChevronLeftIcon, SpeakerIcon, DumbbellIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'

function VerbTable({ fi }: { fi: string }) {
  const v = verbByInfinitive(fi)
  if (!v) return null
  return (
    <div className="mt-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/70 p-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
      {PERSONS.map((p) => (
        <div key={p}><span className="text-slate-400">{p}</span> {v.forms[p]}</div>
      ))}
      <div className="col-span-2 text-slate-500 mt-1">
        neg. <strong>en {v.negativeStem}</strong> · imperative <strong>{v.imperative.sg}!</strong> / <strong>{v.imperative.pl}!</strong>
      </div>
    </div>
  )
}

export default function CategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { srs } = useApp()
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  const [openVerb, setOpenVerb] = useState<string | null>(null)

  const words = useMemo<Word[]>(
    () => (cat ? wordsByCategory(cat.id).slice().sort((a, b) => a.fi.localeCompare(b.fi, 'fi')) : []),
    [cat]
  )

  if (!cat) {
    return (
      <div className="card p-5 text-center space-y-3">
        <p>Topic not found.</p>
        <Link to="/learn" className="btn-secondary inline-flex">All topics</Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        <ChevronLeftIcon size={16} /> Back
      </button>
      <div className="flex items-start gap-4">
        <div className="text-5xl">{cat.emoji}</div>
        <div>
          <h1 className="text-2xl font-bold">{cat.title}</h1>
          <p className="text-slate-500 dark:text-slate-400">{cat.description} · {words.length} words</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={`/practice/flashcards?category=${cat.id}`} className="btn-primary flex items-center gap-2"><DumbbellIcon size={18} /> Flashcards</Link>
        <Link to={`/practice/multiple-choice?category=${cat.id}`} className="btn-secondary">Multiple choice</Link>
        <Link to={`/practice/listen?category=${cat.id}`} className="btn-secondary">Listen</Link>
        <Link to={`/practice/typing?category=${cat.id}`} className="btn-secondary">Typing</Link>
        {cat.id.startsWith('verbs') && (
          <Link to={`/practice/conjugate${/\d/.test(cat.id) ? `?type=${cat.id.slice(-1) === '5' ? '5,6' : cat.id.slice(-1)}` : ''}`} className="btn-secondary">Conjugate</Link>
        )}
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-800">
        {words.map((w) => {
          const m = masteryLevel(srs[w.id])
          const isOpen = openVerb === w.id
          return (
            <div key={w.id} className="flex items-start gap-3 px-3 sm:px-4 py-3">
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
                {w.isVerb && w.verbType && (
                  <button onClick={() => setOpenVerb(isOpen ? null : w.id)} className="text-xs text-finnish-500 dark:text-finnish-200 mt-0.5">
                    {isOpen ? 'Hide forms' : 'Show forms'}
                  </button>
                )}
                {isOpen && <VerbTable fi={w.fi} />}
              </div>
              <div className="w-12 sm:w-16 shrink-0 mt-3">
                <div className="progress-bar"><span style={{ width: `${m * 100}%` }} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
