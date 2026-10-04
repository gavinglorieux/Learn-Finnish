import { Link } from 'react-router-dom'
import { TEXTS, TERMS, LESSONS, lessonById } from '@/data/content'

export default function TextsPage() {
  // Order texts by the lesson they were first handed out in, newest term first.
  const lessonOrder = new Map(LESSONS.map((l, i) => [l.id, i]))
  const sorted = TEXTS.slice().sort((a, b) => (lessonOrder.get(b.lessons[0]) ?? -1) - (lessonOrder.get(a.lessons[0]) ?? -1))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Reading</h1>
        <p className="text-slate-500 dark:text-slate-400">
          {TEXTS.length} texts and dialogues from class. Tap any word to translate it.
        </p>
      </div>
      {TERMS.slice().reverse().map((term) => {
        const items = sorted.filter((t) => lessonById(t.lessons[0])?.term === term.id)
        if (items.length === 0) return null
        return (
          <section key={term.id}>
            <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">{term.title}</h2>
            <div className="space-y-2">
              {items.map((t) => {
                const l = lessonById(t.lessons[0])
                return (
                  <Link key={t.id} to={`/texts/${t.id}`} className="card p-4 block hover:-translate-y-0.5 transition">
                    <div className="font-semibold break-words">{t.kind === 'dialogue' ? '💬' : '📖'} {t.title.fi}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 break-words">{t.title.en}</div>
                    <div className="text-xs text-slate-400 mt-1">{l ? `Lesson ${l.number} · ` : ''}{t.lines.length} lines</div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
