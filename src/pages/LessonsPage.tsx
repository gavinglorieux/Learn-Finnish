import { Link } from 'react-router-dom'
import { LESSONS, itemById, DATA_STATS } from '@/data/course'

export default function LessonsPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Lessons</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Browse each lesson from the course. {DATA_STATS.totalLessons} lessons · {DATA_STATS.totalItems} items.
        </p>
      </div>

      <ol className="space-y-3">
        {LESSONS.map((l) => {
          const items = l.item_ids.map(itemById).filter(Boolean)
          const typeCounts = items.reduce<Record<string, number>>((acc, it) => {
            if (!it) return acc
            acc[it.type] = (acc[it.type] ?? 0) + 1
            return acc
          }, {})
          return (
            <li key={l.id}>
              <Link to={`/lessons/${l.id}`} className="card block p-4 hover:-translate-y-0.5 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-finnish-500 to-finnish-700 text-white flex flex-col items-center justify-center font-semibold">
                    <span className="text-[10px] uppercase leading-none opacity-80">Lesson</span>
                    <span className="text-lg leading-none">{l.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">
                      {formatDate(l.date)} · {items.length} item{items.length === 1 ? '' : 's'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {items
                        .map((i) => i?.title.en ?? i?.title.fi)
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(' · ') || '—'}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {Object.entries(typeCounts).map(([t, n]) => (
                        <span key={t} className="chip">{prettyType(t)} · {n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function prettyType(t: string) {
  switch (t) {
    case 'vocabulary_table': return 'vocab'
    case 'verb_conjugation': return 'verb'
    case 'grammar_rule': return 'grammar'
    case 'exercise': return 'exercise'
    case 'phrase_list': return 'phrases'
    case 'notes': return 'notes'
    case 'document': return 'doc'
    case 'alphabet_chart': return 'alphabet'
    case 'number_list': return 'numbers'
    default: return t
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
