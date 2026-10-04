import { Link, useNavigate, useParams } from 'react-router-dom'
import { COURSE_EXERCISES, DRILLS, LESSONS, TERMS, grammarById, type Exercise } from '@/data/content'
import CourseExerciseRunner from '@/exercises/CourseExerciseRunner'

function ExerciseRow({ ex, subtitle }: { ex: Exercise; subtitle?: string }) {
  return (
    <Link to={`/practice/course/${ex.id}`} className="card p-4 block hover:-translate-y-0.5 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold break-words">{ex.title}</div>
          <div className="text-xs text-slate-500">
            {ex.items.length} questions{subtitle ? ` · ${subtitle}` : ''}
          </div>
        </div>
        <span className="btn-primary shrink-0">Start</span>
      </div>
    </Link>
  )
}

export default function CourseExercisePage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  if (exerciseId) return <CourseExerciseRunner exerciseId={exerciseId} onExit={() => navigate(-1)} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Exercises</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Grammar drills plus {COURSE_EXERCISES.length} exercises from the course worksheets. Type the missing word.
        </p>
      </div>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">Grammar drills</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {DRILLS.map((d) => {
            const t = d.topic ? grammarById(d.topic) : undefined
            return <ExerciseRow key={d.id} ex={d} subtitle={t ? `${t.emoji} ${t.title}` : undefined} />
          })}
        </div>
      </section>

      {TERMS.slice().reverse().map((term) => {
        const lessons = LESSONS.filter((l) => l.term === term.id).slice().reverse()
        const rows = lessons.flatMap((l) => COURSE_EXERCISES.filter((e) => e.lessons[0] === l.id).map((e) => ({ e, l })))
        if (rows.length === 0) return null
        return (
          <section key={term.id}>
            <h2 className="text-sm uppercase tracking-wide text-slate-500 mb-2">{term.title}</h2>
            <div className="space-y-2">
              {rows.map(({ e, l }) => (
                <ExerciseRow key={e.id} ex={e} subtitle={`Lesson ${l.number}: ${l.title}`} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
