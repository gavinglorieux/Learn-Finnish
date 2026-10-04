import { Link } from 'react-router-dom'
import { useApp } from '@/state/AppState'
import { FlameIcon, TargetIcon, TrophyIcon, SparklesIcon, DumbbellIcon, BookIcon, ScrollIcon, DownloadIcon } from '@/components/Icons'
import { ACHIEVEMENTS, xpProgressInLevel } from '@/lib/progress'
import { WORDS } from '@/data/vocabulary'
import { LESSONS, formatDate, grammarById, DATA_STATS } from '@/data/content'
import { totalMastery } from '@/lib/srs'
import { useMemo } from 'react'

export default function HomePage() {
  const { progress, srs } = useApp()
  const { current, required } = xpProgressInLevel(progress.totalXp, progress.level)
  const goalPct = Math.min(1, progress.xpToday / progress.dailyGoalXp)
  const mastery = useMemo(() => totalMastery(srs, WORDS.map((w) => w.id)), [srs])
  const greeting = getGreeting()
  // The latest class that has happened (or the next one if it's today/upcoming within a week).
  const today = new Date().toISOString().slice(0, 10)
  const latest = LESSONS.filter((l) => l.date <= today).at(-1) ?? LESSONS.at(-1)
  const upcoming = LESSONS.find((l) => l.date > today)

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{greeting}</p>
        <h1 className="text-3xl font-bold tracking-tight">Terve! Let's learn Finnish 🇫🇮</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Streak" value={`${progress.streak}`} suffix={progress.streak === 1 ? 'day' : 'days'} icon={<FlameIcon className="text-orange-500" />} />
        <StatCard title="Level" value={`${progress.level}`} suffix={`${current}/${required} XP`} icon={<SparklesIcon className="text-finnish-500" />} />
        <StatCard title="Total XP" value={`${progress.totalXp}`} icon={<TrophyIcon className="text-sun-400" />} />
        <StatCard title="Mastery" value={`${Math.round(mastery * 100)}%`} suffix={`${WORDS.length} words`} icon={<TargetIcon className="text-emerald-500" />} />
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="font-semibold">Daily goal</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {progress.xpToday} / {progress.dailyGoalXp} XP today
            </p>
          </div>
          {goalPct >= 1 ? (
            <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Done! 🎉</span>
          ) : (
            <span className="chip">{Math.round(goalPct * 100)}%</span>
          )}
        </div>
        <div className="progress-bar">
          <span style={{ width: `${goalPct * 100}%` }} />
        </div>
      </section>

      {latest && (
        <section className="card p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Latest class · {formatDate(latest.date)}</div>
          <Link to={`/lessons/${latest.id}`} className="block mt-1">
            <div className="font-semibold text-lg">{latest.title}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{latest.summary}</div>
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`/lessons/${latest.id}`} className="btn-primary">Open lesson</Link>
            {latest.topics[0] && grammarById(latest.topics[0]) && (
              <Link to={`/grammar/${latest.topics[0]}`} className="btn-secondary">{grammarById(latest.topics[0])!.emoji} {grammarById(latest.topics[0])!.title}</Link>
            )}
          </div>
          {upcoming && (
            <Link to={`/lessons/${upcoming.id}`} className="block mt-3 text-sm text-finnish-500 dark:text-finnish-200 hover:underline">
              Next: {formatDate(upcoming.date)} — {upcoming.title} →
            </Link>
          )}
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-3">Jump in</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TileLink to="/practice/review" title="Review due words" body="Spaced-repetition review of everything you've learned." icon={<DumbbellIcon />} accent="from-finnish-500 to-finnish-700" />
          <TileLink to="/practice" title="All practice modes" body="Flashcards, typing, listen & match and more." icon={<SparklesIcon />} accent="from-emerald-500 to-emerald-700" />
          <TileLink to="/learn" title="Pick a topic" body="Learn vocabulary by theme — family, food, weather…" icon={<BookIcon />} accent="from-sun-400 to-sun-500" />
          <TileLink to="/lessons" title="Browse by lesson" body={`All ${DATA_STATS.lessons} classes, term by term.`} icon={<ScrollIcon />} accent="from-cyan-400 to-cyan-600" />
          <TileLink to="/texts" title="Reading" body={`${DATA_STATS.texts} texts & dialogues with tap-to-translate.`} icon={<BookIcon />} accent="from-teal-500 to-teal-700" />
          <TileLink to="/practice/course" title="Course exercises" body="Worksheets from class and grammar drills." icon={<TargetIcon />} accent="from-amber-400 to-amber-600" />
          <TileLink to="/grammar" title="Grammar course" body={`${DATA_STATS.grammarTopics} lessons: sounds, cases, verb types, KPT, imperative.`} icon={<ScrollIcon />} accent="from-rose-400 to-rose-600" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Achievements</h2>
          <span className="text-sm text-slate-500">{progress.completedAchievements.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const earned = progress.completedAchievements.includes(a.id)
            return (
              <div
                key={a.id}
                className={`card p-3 text-center ${earned ? '' : 'opacity-40 grayscale'}`}
                title={`${a.title} — ${a.description}`}
              >
                <div className="text-2xl">{a.emoji}</div>
                <div className="text-[11px] mt-1 font-semibold line-clamp-2">{a.title}</div>
              </div>
            )
          })}
        </div>
      </section>

      {progress.totalXp === 0 && (
        <section className="card p-5 border-finnish-200 bg-finnish-50/50 dark:bg-finnish-900/20">
          <h3 className="font-semibold flex items-center gap-2"><DownloadIcon size={18} /> Install as an app</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Install Learn Finnish on your iPhone and Mac for a native-feeling experience that works offline.
          </p>
          <Link to="/install" className="btn-primary mt-3">See how</Link>
        </section>
      )}
    </div>
  )
}

function StatCard({ title, value, suffix, icon }: { title: string; value: string; suffix?: string; icon: React.ReactNode }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-2">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 uppercase tracking-wide">{title}</div>
        <div className="text-lg font-semibold leading-tight truncate">{value}</div>
        {suffix && <div className="text-[11px] text-slate-500 truncate">{suffix}</div>}
      </div>
    </div>
  )
}

function TileLink({
  to,
  title,
  body,
  icon,
  accent
}: {
  to: string
  title: string
  body: string
  icon: React.ReactNode
  accent: string
}) {
  return (
    <Link to={to} className="card p-4 flex gap-3 min-w-0 hover:-translate-y-0.5 transition">
      <div className={`shrink-0 rounded-xl text-white p-3 bg-gradient-to-br ${accent}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{body}</div>
      </div>
    </Link>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 10) return 'Hyvää huomenta'
  if (h < 17) return 'Hyvää päivää'
  if (h < 22) return 'Hyvää iltaa'
  return 'Hyvää yötä'
}
