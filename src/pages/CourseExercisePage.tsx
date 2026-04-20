import { Link, useNavigate, useParams } from 'react-router-dom'
import { COURSE_EXERCISES } from '@/data/course'
import CourseExerciseRunner from '@/exercises/CourseExerciseRunner'

export default function CourseExercisePage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  if (exerciseId) return <CourseExerciseRunner exerciseId={exerciseId} onExit={() => navigate(-1)} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Course exercises</h1>
        <p className="text-slate-500 dark:text-slate-400">Real fill-in-the-blank exercises from the course with full answer keys.</p>
      </div>
      <div className="space-y-2">
        {COURSE_EXERCISES.map((ex) => (
          <Link key={ex.id} to={`/practice/course/${ex.id}`} className="card p-4 block hover:-translate-y-0.5 transition">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{ex.title}</div>
                <div className="text-xs text-slate-500">{ex.items.length} questions · Lesson {ex.lesson ?? '—'}</div>
                {ex.instruction && <div className="text-xs text-slate-400 truncate">{ex.instruction}</div>}
              </div>
              <span className="btn-primary">Start</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
