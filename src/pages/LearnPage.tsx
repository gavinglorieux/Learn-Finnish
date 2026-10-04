import { Link } from 'react-router-dom'
import { CATEGORIES, wordsByCategory, type Category } from '@/data/vocabulary'
import { VOCAB_SECTIONS, DATA_STATS } from '@/data/content'
import { useApp } from '@/state/AppState'
import { masteryLevel } from '@/lib/srs'

export default function LearnPage() {
  const { srs } = useApp()

  const catMastery = (cat: Category) => {
    const words = wordsByCategory(cat.id)
    if (words.length === 0) return 0
    return words.reduce((a, w) => a + masteryLevel(srs[w.id]), 0) / words.length
  }

  const renderCard = (c: Category) => {
    const m = catMastery(c)
    return (
      <Link key={c.id} to={`/learn/${c.id}`} className="card p-4 flex items-center gap-3 min-w-0 hover:-translate-y-0.5 transition">
        <div className="text-3xl" aria-hidden>{c.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{c.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.description}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="progress-bar flex-1"><span style={{ width: `${m * 100}%` }} /></div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap">{c.wordCount} words</div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {DATA_STATS.words} words from the course in themed groups. Tap a group to study and practise it.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Link to="/lessons" className="card p-3 text-center hover:-translate-y-0.5 transition">
          <div className="text-2xl">🗓️</div>
          <div className="text-sm font-semibold">Lessons</div>
          <div className="text-[11px] text-slate-500">{DATA_STATS.lessons} classes</div>
        </Link>
        <Link to="/texts" className="card p-3 text-center hover:-translate-y-0.5 transition">
          <div className="text-2xl">📖</div>
          <div className="text-sm font-semibold">Reading</div>
          <div className="text-[11px] text-slate-500">{DATA_STATS.texts} texts</div>
        </Link>
        <Link to="/grammar" className="card p-3 text-center hover:-translate-y-0.5 transition">
          <div className="text-2xl">📐</div>
          <div className="text-sm font-semibold">Grammar</div>
          <div className="text-[11px] text-slate-500">{DATA_STATS.grammarTopics} topics</div>
        </Link>
      </div>

      {VOCAB_SECTIONS.map((section) => {
        const cats = section.groups.map((id) => CATEGORIES.find((c) => c.id === id)).filter((c): c is Category => !!c)
        if (cats.length === 0) return null
        return (
          <section key={section.id}>
            <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">{section.title}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{cats.map(renderCard)}</div>
          </section>
        )
      })}
    </div>
  )
}
