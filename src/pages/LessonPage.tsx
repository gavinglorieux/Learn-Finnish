import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  lessonById, termById, formatDate, grammarById, textById, exerciseById, wordsForLesson,
  LESSONS, loadHandouts
} from '@/data/content'
import { getCategory } from '@/data/vocabulary'
import { ChevronLeftIcon, ChevronRightIcon, SpeakerIcon } from '@/components/Icons'
import { speak } from '@/lib/tts'

export default function LessonPage() {
  const params = useParams()
  const navigate = useNavigate()
  // Route is /lessons/* so the splat captures the full id including slashes.
  const lesson = lessonById(decodeURIComponent(params['*'] ?? ''))
  const [handouts, setHandouts] = useState<Record<string, string> | null>(null)
  useEffect(() => {
    let alive = true
    loadHandouts().then((h) => { if (alive) setHandouts(h) }).catch(() => {})
    return () => { alive = false }
  }, [])

  if (!lesson) {
    return (
      <div className="card p-5 text-center space-y-3">
        <p>Lesson not found.</p>
        <Link to="/lessons" className="btn-secondary inline-flex">All lessons</Link>
      </div>
    )
  }

  const term = termById(lesson.term)
  const words = wordsForLesson(lesson.id)
  const texts = lesson.texts.map(textById).filter(Boolean)
  const exercises = lesson.exercises.map(exerciseById).filter(Boolean)
  // Only link groups that actually have words (a group can be empty while its handouts are pending).
  const groups = lesson.groups.map(getCategory).filter(Boolean)
  const idx = LESSONS.findIndex((l) => l.id === lesson.id)
  const prev = LESSONS[idx - 1]
  const next = LESSONS[idx + 1]

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        <ChevronLeftIcon size={16} /> Back
      </button>

      <header>
        <div className="text-xs uppercase text-slate-500 tracking-wide">{term?.title} · Lesson {lesson.number} · {formatDate(lesson.date, 'long')}</div>
        <h1 className="text-2xl font-bold mt-1">{lesson.title}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{lesson.summary}</p>
      </header>

      {lesson.topics.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Grammar</h2>
          <div className="space-y-2">
            {lesson.topics.map((id) => {
              const t = grammarById(id)
              if (!t) return null
              return (
                <Link key={id} to={`/grammar/${id}`} className="card p-3 flex items-center gap-3 hover:-translate-y-0.5 transition">
                  <div className="text-2xl">{t.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{t.summary}</div>
                  </div>
                  <ChevronRightIcon size={18} className="text-slate-300 shrink-0" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {texts.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Reading & dialogues</h2>
          <div className="space-y-2">
            {texts.map((t) => (
              <Link key={t!.id} to={`/texts/${t!.id}`} className="card p-3 block hover:-translate-y-0.5 transition">
                <div className="font-medium">{t!.kind === 'dialogue' ? '💬' : '📖'} {t!.title.fi}</div>
                <div className="text-xs text-slate-500">{t!.title.en} · {t!.lines.length} lines</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {words.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-semibold">Vocabulary · {words.length} words</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <Link to={`/practice/flashcards?lesson=${encodeURIComponent(lesson.id)}`} className="btn-primary">Flashcards</Link>
            <Link to={`/practice/multiple-choice?lesson=${encodeURIComponent(lesson.id)}`} className="btn-secondary">Multiple choice</Link>
            <Link to={`/practice/typing?lesson=${encodeURIComponent(lesson.id)}`} className="btn-secondary">Typing</Link>
          </div>
          {groups.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {groups.map((g) => (
                <Link key={g!.id} to={`/learn/${g!.id}`} className="chip !text-xs !py-1 hover:bg-finnish-50 dark:hover:bg-slate-800">{g!.emoji} {g!.title}</Link>
              ))}
            </div>
          )}
          <details className="card">
            <summary className="cursor-pointer px-4 py-3 text-sm text-finnish-500 dark:text-finnish-200">Show all words</summary>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {words.map((w) => (
                <li key={w.id} className="flex items-center gap-3 px-4 py-2">
                  <button onClick={() => speak(w.fi)} aria-label={`Pronounce ${w.fi}`} className="text-finnish-500 dark:text-finnish-200"><SpeakerIcon size={16} /></button>
                  <div className="min-w-0">
                    <span className="font-medium">{w.fi}</span>
                    <span className="text-slate-500 dark:text-slate-400"> — {w.en}</span>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {exercises.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Exercises from this lesson</h2>
          <div className="space-y-2">
            {exercises.map((ex) => (
              <Link key={ex!.id} to={`/practice/course/${ex!.id}`} className="card p-4 block hover:-translate-y-0.5 transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold break-words">{ex!.title}</div>
                    <div className="text-xs text-slate-500">{ex!.items.length} questions</div>
                  </div>
                  <span className="btn-primary shrink-0">Practise</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lesson.materials.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Handouts</h2>
          <div className="space-y-2">
            {lesson.materials.map((m) => (
              <details key={m.source} className="card">
                <summary className="cursor-pointer px-4 py-3">
                  <span className="font-medium">{m.title.en ?? m.title.fi}</span>
                  {m.title.fi && m.title.en && <span className="text-sm text-slate-500"> · {m.title.fi}</span>}
                  {m.summary && <div className="text-xs text-slate-500 mt-0.5">{m.summary}</div>}
                </summary>
                <pre className="px-4 pb-4 whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300 font-sans">{handouts ? handouts[m.source] : 'Loading…'}</pre>
              </details>
            ))}
          </div>
        </section>
      )}

      {lesson.pending && (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-3 text-sm text-slate-500">
          📎 Handouts for this lesson are still to be added: {lesson.pending.join(', ')}.
        </div>
      )}

      <nav className="grid grid-cols-2 gap-2 pt-2">
        {prev ? (
          <Link to={`/lessons/${prev.id}`} className="card p-3 text-sm hover:-translate-y-0.5 transition">
            <div className="text-xs text-slate-400 flex items-center gap-1"><ChevronLeftIcon size={14} /> Previous</div>
            <div className="font-medium truncate">{prev.title}</div>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/lessons/${next.id}`} className="card p-3 text-sm text-right hover:-translate-y-0.5 transition">
            <div className="text-xs text-slate-400 flex items-center gap-1 justify-end">Next <ChevronRightIcon size={14} /></div>
            <div className="font-medium truncate">{next.title}</div>
          </Link>
        ) : <span />}
      </nav>
    </div>
  )
}
