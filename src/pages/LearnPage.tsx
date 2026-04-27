import { Link } from 'react-router-dom'
import { CATEGORIES, WORDS_ALL, wordsByCategory, type Category } from '@/data/vocabulary'
import { useApp } from '@/state/AppState'
import { masteryLevel } from '@/lib/srs'

export default function LearnPage() {
  const { srs } = useApp()

  const catMastery = (cat: Category) => {
    const words = cat.virtual ? wordsByCategory(cat.id) : WORDS_ALL.filter((w) => w.category === cat.id)
    if (words.length === 0) return 0
    return words.reduce((a, w) => a + masteryLevel(srs[w.id]), 0) / words.length
  }

  const realCategories = CATEGORIES.filter((c) => !c.virtual)
  const themedCategories = CATEGORIES.filter((c) => c.virtual)

  const byLesson: Record<number, Category[]> = {}
  realCategories.forEach((c) => {
    const l = c.lessons[0]
    byLesson[l] ||= []
    byLesson[l].push(c)
  })
  const lessons = Object.keys(byLesson).map(Number).sort((a, b) => a - b)

  const renderCard = (c: Category) => {
    const count = c.wordCount
    const m = catMastery(c)
    return (
      <Link key={c.id} to={`/learn/${c.id}`} className="card p-4 flex items-center gap-3 min-w-0 hover:-translate-y-0.5 transition">
        <div className="text-3xl" aria-hidden>{c.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{c.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.description}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="progress-bar flex-1"><span style={{ width: `${m * 100}%` }} /></div>
            <div className="text-[11px] text-slate-500 whitespace-nowrap">{count} words</div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="text-slate-500 dark:text-slate-400">Browse topics from the course. Tap a topic to study the words and start a practice session.</p>
      </div>

      {themedCategories.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">Themed collections</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {themedCategories.map(renderCard)}
          </div>
        </section>
      )}

      {lessons.map((lesson) => (
        <section key={lesson}>
          <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">Lesson {lesson}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {byLesson[lesson].map(renderCard)}
          </div>
        </section>
      ))}
    </div>
  )
}
