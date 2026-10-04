import { Link } from 'react-router-dom'
import { LESSONS, TERMS, DATA_STATS, formatDate, grammarById, localToday } from '@/data/content'

export default function LessonsPage() {
  const today = localToday()
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Lessons</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Every class with Teija, term by term — {DATA_STATS.lessons} lessons. Newest first.
        </p>
      </div>

      {TERMS.slice().reverse().map((term) => {
        const lessons = LESSONS.filter((l) => l.term === term.id).slice().reverse()
        if (lessons.length === 0) return null
        return (
          <section key={term.id}>
            <h2 className="font-semibold">{term.title}</h2>
            <p className="text-xs text-slate-500 mb-2">{term.subtitle}</p>
            <ol className="space-y-2">
              {lessons.map((l) => {
                const upcoming = l.date > today
                return (
                  <li key={l.id}>
                    <Link to={`/lessons/${l.id}`} className="card block p-4 hover:-translate-y-0.5 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-finnish-500 to-finnish-700 text-white flex flex-col items-center justify-center font-semibold">
                          <span className="text-[10px] uppercase leading-none opacity-80">Lesson</span>
                          <span className="text-lg leading-none">{l.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500">
                            {formatDate(l.date)}
                            {upcoming && <span className="ml-1.5 chip !text-[10px] !py-0">upcoming</span>}
                          </div>
                          <div className="font-semibold break-words">{l.title}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {l.topics.slice(0, 3).map((t) => {
                              const g = grammarById(t)
                              return g ? <span key={t} className="chip !text-[11px]">{g.emoji} {g.title}</span> : null
                            })}
                            {l.wordCount > 0 && <span className="chip !text-[11px]">{l.wordCount} words</span>}
                            {l.texts.length > 0 && <span className="chip !text-[11px]">📖 {l.texts.length}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
