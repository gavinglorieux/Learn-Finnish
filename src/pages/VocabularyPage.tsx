import { useMemo, useState } from 'react'
import { WORDS, CATEGORIES, wordsByCategory } from '@/data/vocabulary'
type CategoryId = string
import { speak } from '@/lib/tts'
import { SearchIcon, SpeakerIcon, XIcon } from '@/components/Icons'
import { useApp } from '@/state/AppState'
import { masteryLevel } from '@/lib/srs'

export default function VocabularyPage() {
  const { srs } = useApp()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<CategoryId | 'all' | 'verbs'>('all')

  // The category dropdown lists categories alphabetically by title.
  // The synthetic "Verbs" entry is pinned so it's easy to find.
  const sortedCategories = useMemo(() => {
    const verbs = CATEGORIES.find((c) => c.id === 'verbs')
    const rest = CATEGORIES.filter((c) => c.id !== 'verbs').slice().sort((a, b) => a.title.localeCompare(b.title))
    return verbs ? [verbs, ...rest] : rest
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    const pool = cat === 'verbs'
      ? wordsByCategory('verbs')
      : cat === 'all'
        ? WORDS
        : WORDS.filter((w) => w.category === cat)

    if (!s) return pool
    return pool.filter((w) => w.fi.toLowerCase().includes(s) || w.en.toLowerCase().includes(s))
  }, [q, cat])

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary</h1>
          <p className="text-slate-500 dark:text-slate-400">{WORDS.length} words — tap the speaker to hear it.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <label className="relative block flex-1">
          <span className="sr-only">Search words</span>
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Finnish or English"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finnish-400"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <XIcon size={16} />
            </button>
          )}
        </label>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as CategoryId | 'all' | 'verbs')}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finnish-400"
        >
          <option value="all">All categories</option>
          {sortedCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>
          ))}
        </select>
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 && <div className="p-6 text-center text-slate-500">No matches.</div>}
        {filtered.map((w) => {
          const m = masteryLevel(srs[w.id])
          const c = CATEGORIES.find((x) => x.id === w.category)
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
                {c && (
                  <div className="mt-1 sm:hidden">
                    <span className="chip !text-[10px]">{c.emoji} {c.title}</span>
                  </div>
                )}
              </div>
              {c && <span className="chip hidden sm:inline-flex shrink-0">{c.emoji} {c.title}</span>}
              <div className="w-10 sm:w-12 shrink-0"><div className="progress-bar"><span style={{ width: `${m * 100}%` }} /></div></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
