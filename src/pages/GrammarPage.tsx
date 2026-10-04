import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GRAMMAR_PARTS, GRAMMAR_TOPICS, grammarById, grammarNumber, type GrammarTopic } from '@/data/content'
import { SearchIcon, ChevronRightIcon } from '@/components/Icons'

const haystack = (t: GrammarTopic): string =>
  [
    t.title,
    t.fi,
    t.summary,
    ...t.sections.flatMap((s) => [s.heading, s.body, s.tip, s.note, s.bullets?.join(' '), s.examples?.map((e) => `${e.fi} ${e.en}`).join(' '), s.table?.rows.flat().join(' ')])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const INDEX = GRAMMAR_TOPICS.map((t) => ({ id: t.id, hay: haystack(t) }))

function TopicRow({ topic }: { topic: GrammarTopic }) {
  return (
    <Link to={`/grammar/${topic.id}`} className="card p-3.5 flex items-center gap-3 hover:-translate-y-0.5 transition">
      <div className="w-8 h-8 shrink-0 rounded-lg bg-finnish-50 dark:bg-slate-800 text-finnish-500 dark:text-finnish-200 text-sm font-semibold flex items-center justify-center">
        {grammarNumber(topic.id)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold break-words">{topic.emoji} {topic.title}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{topic.summary}</div>
      </div>
      <ChevronRightIcon size={18} className="text-slate-300 shrink-0" />
    </Link>
  )
}

export default function GrammarPage() {
  const [q, setQ] = useState('')

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return null
    return INDEX.filter((x) => x.hay.includes(s)).map((x) => grammarById(x.id)!).filter(Boolean)
  }, [q])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Grammar</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {GRAMMAR_TOPICS.length} lessons in learning order — from sounds and spelling to cases, verb types and the imperative.
        </p>
      </div>

      <label className="relative block">
        <span className="sr-only">Search grammar</span>
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search — partitive, KPT, kello, -ssa…"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finnish-400"
        />
      </label>

      {matches ? (
        <div className="space-y-2">
          {matches.length === 0 && <div className="card p-6 text-center text-slate-500">No grammar topic mentions “{q}”.</div>}
          {matches.map((t) => <TopicRow key={t.id} topic={t} />)}
        </div>
      ) : (
        GRAMMAR_PARTS.map((part, i) => (
          <section key={part.id}>
            <div className="mb-2">
              <h2 className="font-semibold">
                <span className="text-slate-400 mr-1">Part {i + 1}</span> {part.emoji} {part.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{part.description}</p>
            </div>
            <div className="space-y-2">
              {part.topics.map((id) => {
                const t = grammarById(id)
                return t ? <TopicRow key={id} topic={t} /> : null
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
