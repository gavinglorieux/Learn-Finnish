import { Link, useNavigate, useParams } from 'react-router-dom'
import { LESSONS, itemById, type CourseItem, COURSE_EXERCISES } from '@/data/course'
import { ChevronLeftIcon, SpeakerIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'

export default function LessonPage() {
  const params = useParams()
  const navigate = useNavigate()
  // Route is /lessons/* so the splat captures the full id including slashes.
  const targetId = decodeURIComponent(params['*'] ?? '')
  const lesson = LESSONS.find((l) => l.id === targetId)

  if (!lesson) {
    return (
      <div className="card p-5 text-center">
        <p>Lesson not found.</p>
        <Link to="/lessons" className="btn-secondary mt-3 inline-flex">All lessons</Link>
      </div>
    )
  }

  const items = lesson.item_ids.map(itemById).filter((x): x is CourseItem => !!x)
  const exercisesForLesson = COURSE_EXERCISES.filter((e) => e.lesson === lesson.number)

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        <ChevronLeftIcon size={16} /> Back
      </button>

      <div>
        <div className="text-sm uppercase text-slate-500 tracking-wide">Lesson {lesson.number} · {formatDate(lesson.date)}</div>
        <h1 className="text-2xl font-bold">Lesson {lesson.number}</h1>
      </div>

      <section className="space-y-3">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} />
        ))}
      </section>

      {exercisesForLesson.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Course exercises in this lesson</h2>
          <div className="space-y-2">
            {exercisesForLesson.map((ex) => (
              <Link key={ex.id} to={`/practice/course/${ex.id}`} className="card p-4 block hover:-translate-y-0.5 transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{ex.title}</div>
                    <div className="text-xs text-slate-500">{ex.items.length} question{ex.items.length === 1 ? '' : 's'}</div>
                  </div>
                  <span className="btn-primary">Practise</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ItemCard({ item }: { item: CourseItem }) {
  const title = item.title.en ?? item.title.fi ?? '—'
  const subtitle = item.title.fi && item.title.en ? item.title.fi : undefined
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500">{humaniseType(item.type)}</div>
          <h3 className="font-semibold truncate">{title}</h3>
          {subtitle && <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle}</div>}
        </div>
        {(item.type === 'vocabulary_table' || item.type === 'phrase_list') && (
          <Link to={`/learn/${item.id}`} className="btn-primary">Study</Link>
        )}
      </div>

      {item.content.format === 'structured' && (
        <div className="mt-3 space-y-3">
          {item.content.sections.slice(0, 3).map((sec, i) => (
            <SectionBlock key={i} heading={sec.heading?.en ?? sec.heading?.fi} note={sec.note} rows={sec.items ?? []} />
          ))}
          {item.content.sections.length > 3 && (
            <div className="text-xs text-slate-400">+ {item.content.sections.length - 3} more sections</div>
          )}
        </div>
      )}

      {item.content.format === 'markdown' && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-finnish-500">Show reference document</summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{item.content.body}</pre>
        </details>
      )}

      {item.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.topics.slice(0, 6).map((t) => (
            <span key={t} className="chip">#{t.replace(/_/g, ' ')}</span>
          ))}
        </div>
      )}
    </article>
  )
}

function SectionBlock({ heading, note, rows }: { heading?: string; note?: string; rows: Array<Record<string, unknown>> }) {
  if (rows.length === 0 && !heading) return null
  return (
    <div>
      {heading && <div className="font-medium text-sm text-slate-700 dark:text-slate-300">{heading}</div>}
      {note && <p className="text-xs text-slate-500 italic">{note}</p>}
      <ul className="mt-1 space-y-1 text-sm">
        {rows.slice(0, 6).map((r, i) => {
          const fi = (r['fi'] ?? r['sentence_fi'] ?? r['example_fi'] ?? r['pronoun_fi'] ?? r['form']) as string | undefined
          const en = (r['en'] ?? r['sentence_en'] ?? r['example_en'] ?? r['pronoun_en']) as string | undefined
          if (fi) {
            return (
              <li key={i} className="flex items-start gap-2">
                <button
                  onClick={() => speak(fi)}
                  className="text-finnish-500 dark:text-finnish-200 mt-0.5"
                  aria-label="Pronounce"
                >
                  <SpeakerIcon size={14} />
                </button>
                <div className="min-w-0">
                  <span className="font-medium">{fi}</span>
                  {en && <span className="text-slate-500 dark:text-slate-400"> — {en}</span>}
                </div>
              </li>
            )
          }
          return null
        })}
        {rows.length > 6 && <li className="text-xs text-slate-400">+ {rows.length - 6} more</li>}
      </ul>
    </div>
  )
}

function humaniseType(t: string) {
  switch (t) {
    case 'vocabulary_table': return 'Vocabulary'
    case 'verb_conjugation': return 'Verb conjugation'
    case 'grammar_rule': return 'Grammar rule'
    case 'exercise': return 'Exercise'
    case 'phrase_list': return 'Phrases'
    case 'notes': return 'Reading / notes'
    case 'document': return 'Reference document'
    case 'alphabet_chart': return 'Alphabet'
    case 'number_list': return 'Numbers'
    default: return t
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
