import { Link, useNavigate, useParams } from 'react-router-dom'
import { GRAMMAR_TOPICS, grammarById, grammarNumber, lessonById, lessonLabel, DRILLS, TEXTS, type GrammarSection } from '@/data/content'
import RichText from '@/components/RichText'
import { ChevronLeftIcon, ChevronRightIcon, SpeakerIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'

function Section({ s }: { s: GrammarSection }) {
  return (
    <section className="space-y-3">
      {s.heading && <h2 className="text-lg font-semibold">{s.heading}</h2>}
      {s.body && <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"><RichText text={s.body} /></p>}
      {s.bullets && (
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-slate-700 dark:text-slate-300">
          {s.bullets.map((b, j) => <li key={j}><RichText text={b} /></li>)}
        </ul>
      )}
      {s.table && (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                {s.table.headers.map((h, k) => <th key={k} className="py-2 pr-4 font-medium whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, j) => (
                <tr key={j} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                  {r.map((c, k) => (
                    <td key={k} className={`py-2 pr-4 align-top ${k === 0 ? 'font-medium' : ''}`}><RichText text={c} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.examples && (
        <ul className="space-y-2">
          {s.examples.map((ex, j) => (
            <li key={j}>
              <button onClick={() => speak(ex.fi)} className="w-full text-left rounded-lg bg-slate-50 dark:bg-slate-800/70 px-3 py-2 flex gap-2 items-start hover:bg-slate-100 dark:hover:bg-slate-800">
                <SpeakerIcon size={15} className="mt-1 shrink-0 text-finnish-500 dark:text-finnish-200" />
                <span className="min-w-0">
                  <span className="block font-medium">{ex.fi}</span>
                  <span className="block text-sm text-slate-500 dark:text-slate-400">{ex.en}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {s.tip && (
        <div className="rounded-lg bg-sun-50 dark:bg-sun-500/10 text-slate-800 dark:text-sun-100 text-sm px-3 py-2">
          💡 <RichText text={s.tip} />
        </div>
      )}
      {s.note && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm px-3 py-2">
          <RichText text={s.note} />
        </div>
      )}
    </section>
  )
}

export default function GrammarTopicPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const topic = topicId ? grammarById(topicId) : undefined

  if (!topic) {
    return (
      <div className="card p-5 text-center space-y-3">
        <p>Grammar topic not found.</p>
        <Link to="/grammar" className="btn-secondary inline-flex">All grammar</Link>
      </div>
    )
  }

  const n = grammarNumber(topic.id)
  const prev = GRAMMAR_TOPICS[n - 2]
  const next = GRAMMAR_TOPICS[n]
  const requires = (topic.requires ?? []).map(grammarById).filter(Boolean)
  const related = (topic.related ?? []).map(grammarById).filter(Boolean)
  const lessons = topic.lessons.map(lessonById).filter(Boolean)
  const drills = DRILLS.filter((d) => d.topic === topic.id && !(topic.practice ?? []).some((p) => p.to.endsWith(d.id)))
  const texts = TEXTS.filter((t) => t.topics.includes(topic.id)).slice(0, 4)

  return (
    <article className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        <ChevronLeftIcon size={16} /> Back
      </button>

      <header>
        <div className="text-xs uppercase tracking-wide text-slate-500">Grammar · {n} of {GRAMMAR_TOPICS.length}</div>
        <h1 className="text-2xl font-bold mt-1">{topic.emoji} {topic.title}</h1>
        {topic.fi && <div className="text-slate-500 dark:text-slate-400">{topic.fi}</div>}
        <p className="mt-2 text-[15px] text-slate-700 dark:text-slate-300">{topic.summary}</p>
      </header>

      {requires.length > 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Builds on:{' '}
          {requires.map((r, i) => (
            <span key={r!.id}>
              {i > 0 && ', '}
              <Link to={`/grammar/${r!.id}`} className="text-finnish-500 dark:text-finnish-200 hover:underline">{r!.title}</Link>
            </span>
          ))}
        </div>
      )}

      <div className="card p-4 sm:p-5 space-y-6">
        {topic.sections.map((s, i) => <Section key={i} s={s} />)}
      </div>

      {((topic.practice?.length ?? 0) > 0 || drills.length > 0) && (
        <section>
          <h2 className="font-semibold mb-2">Practise</h2>
          <div className="flex flex-wrap gap-2">
            {topic.practice?.map((p) => <Link key={p.to} to={p.to} className="btn-primary">{p.label}</Link>)}
            {drills.map((d) => <Link key={d.id} to={`/practice/course/${d.id}`} className="btn-secondary">{d.title}</Link>)}
          </div>
        </section>
      )}

      {texts.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Read it in context</h2>
          <div className="space-y-2">
            {texts.map((t) => (
              <Link key={t.id} to={`/texts/${t.id}`} className="card p-3 block hover:-translate-y-0.5 transition">
                <div className="font-medium">📖 {t.title.fi}</div>
                {t.title.en && <div className="text-sm text-slate-500">{t.title.en}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {lessons.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Covered in class</h2>
          <div className="flex flex-wrap gap-2">
            {lessons.map((l) => (
              <Link key={l!.id} to={`/lessons/${l!.id}`} className="chip !text-xs !py-1 hover:bg-finnish-50 dark:hover:bg-slate-800">
                {lessonLabel(l!)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Related</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r!.id} to={`/grammar/${r!.id}`} className="chip !text-xs !py-1 hover:bg-finnish-50 dark:hover:bg-slate-800">
                {r!.emoji} {r!.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="grid grid-cols-2 gap-2 pt-2">
        {prev ? (
          <Link to={`/grammar/${prev.id}`} className="card p-3 text-sm hover:-translate-y-0.5 transition">
            <div className="text-xs text-slate-400 flex items-center gap-1"><ChevronLeftIcon size={14} /> Previous</div>
            <div className="font-medium truncate">{prev.title}</div>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/grammar/${next.id}`} className="card p-3 text-sm text-right hover:-translate-y-0.5 transition">
            <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">Next <ChevronRightIcon size={14} /></div>
            <div className="font-medium truncate">{next.title}</div>
          </Link>
        ) : <span />}
      </nav>
    </article>
  )
}
