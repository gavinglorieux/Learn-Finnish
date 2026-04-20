import { useMemo, useState } from 'react'
import { GRAMMAR } from '@/data/grammar'
import { COURSE_GRAMMAR } from '@/data/course'
import { SearchIcon } from '@/components/Icons'

// Combine the curated primer (GRAMMAR) with the course grammar_rule items.
type UnifiedTopic = {
  id: string
  title: string
  emoji: string
  summary: string
  source: 'primer' | 'course'
  lesson?: number
  sections: Array<{
    heading?: string
    body?: string
    note?: string
    bullets?: string[]
    table?: { headers: string[]; rows: string[][] }
    examples?: Array<{ fi: string; en: string }>
  }>
}

const ALL_TOPICS: UnifiedTopic[] = [
  ...GRAMMAR.map((t) => ({
    id: `primer-${t.id}`,
    title: t.title,
    emoji: t.emoji,
    summary: t.summary,
    source: 'primer' as const,
    sections: t.sections.map((s) => ({
      heading: s.heading,
      body: s.body,
      bullets: s.bullets,
      table: s.table,
      examples: s.examples
    }))
  })),
  ...COURSE_GRAMMAR.map((t) => ({
    id: `course-${t.id}`,
    title: t.title,
    emoji: t.emoji,
    summary: t.summary,
    source: 'course' as const,
    lesson: t.lesson,
    sections: t.sections
  }))
]

export default function GrammarPage() {
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'primer' | 'course'>('all')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return ALL_TOPICS.filter((t) => {
      if (filter !== 'all' && t.source !== filter) return false
      if (!s) return true
      const hay = [
        t.title,
        t.summary,
        ...t.sections.map((x) => [x.heading, x.body, x.note, x.bullets?.join(' '), x.examples?.map((e) => `${e.fi} ${e.en}`).join(' '), x.table?.rows.flat().join(' ')].filter(Boolean).join(' '))
      ].join(' ').toLowerCase()
      return hay.includes(s)
    })
  }, [q, filter])

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Grammar reference</h1>
        <p className="text-slate-500 dark:text-slate-400">{ALL_TOPICS.length} grammar topics — a concise primer plus the real course rules.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <label className="relative block flex-1">
          <span className="sr-only">Search grammar</span>
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search — partitive, verb type, weather…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finnish-400"
          />
        </label>
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-sm bg-white dark:bg-slate-900">
          {(['all', 'primer', 'course'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 font-medium transition ${filter === f ? 'bg-finnish-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {f === 'all' ? 'All' : f === 'primer' ? 'Primer' : 'From course'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((topic) => {
          const open = openId === topic.id
          return (
            <article key={topic.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : topic.id)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50"
                aria-expanded={open}
              >
                <div className="text-2xl">{topic.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold break-words">{topic.title}</div>
                    <span className="chip !text-[10px] shrink-0">{topic.source === 'course' ? (topic.lesson ? `Lesson ${topic.lesson}` : 'Course') : 'Primer'}</span>
                  </div>
                  <div className={`text-sm text-slate-500 dark:text-slate-400 break-words ${open ? '' : 'line-clamp-2 sm:line-clamp-none'}`}>
                    {topic.summary}
                  </div>
                </div>
                <div className="text-slate-400 text-sm">{open ? '−' : '+'}</div>
              </button>
              {open && (
                <div className="px-4 pb-5 space-y-4">
                  {topic.sections.map((s, i) => (
                    <section key={i} className="space-y-2">
                      {s.heading && <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">{s.heading}</h3>}
                      {s.body && <p className="text-sm text-slate-700 dark:text-slate-300">{s.body}</p>}
                      {s.note && <p className="text-xs italic text-slate-500 dark:text-slate-400">{s.note}</p>}
                      {s.bullets && (
                        <ul className="list-disc list-inside text-sm space-y-1 text-slate-700 dark:text-slate-300">
                          {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      )}
                      {s.table && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                {s.table.headers.map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {s.table.rows.map((r, j) => (
                                <tr key={j} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                                  {r.map((c, k) => <td key={k} className="py-2 pr-4 align-top">{c}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {s.examples && (
                        <ul className="space-y-2">
                          {s.examples.map((ex, j) => (
                            <li key={j} className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2">
                              <div className="font-medium">{ex.fi}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">{ex.en}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
