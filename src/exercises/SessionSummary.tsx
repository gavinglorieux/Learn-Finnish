import { Link } from 'react-router-dom'
import { TrophyIcon, ShuffleIcon, HomeIcon } from '@/components/Icons'

export default function SessionSummary({
  correct,
  total,
  xp,
  onRestart,
  onExit
}: {
  correct: number
  total: number
  xp: number
  onRestart: () => void
  onExit: () => void
}) {
  const pct = total > 0 ? correct / total : 0
  const title =
    pct === 1 ? 'Täydellinen! Perfect!' : pct >= 0.8 ? 'Hienoa — great job!' : pct >= 0.5 ? 'Hyvä — keep practising' : 'Keep going — you will get there'
  const emoji = pct === 1 ? '🏆' : pct >= 0.8 ? '🌟' : pct >= 0.5 ? '💪' : '🌱'

  return (
    <div className="animate-fade-in max-w-md mx-auto space-y-5 text-center">
      <div className="text-6xl mt-6">{emoji}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="card p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Correct</span>
          <strong>{correct} / {total}</strong>
        </div>
        <div className="progress-bar"><span style={{ width: `${pct * 100}%` }} /></div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-slate-500 flex items-center gap-1"><TrophyIcon size={16} /> XP earned</span>
          <strong className="text-finnish-500">+{xp}</strong>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onRestart} className="btn-primary flex items-center justify-center gap-2"><ShuffleIcon size={18} /> Again</button>
        <button onClick={onExit} className="btn-secondary flex items-center justify-center gap-2"><HomeIcon size={18} /> Done</button>
      </div>
      <Link to="/practice" className="text-sm text-finnish-500 hover:underline inline-block pt-1">Try a different mode →</Link>
    </div>
  )
}
