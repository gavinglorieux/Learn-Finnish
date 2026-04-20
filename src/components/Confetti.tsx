import { useMemo } from 'react'

const COLORS = ['#003580', '#ffcc00', '#f9a826', '#10b981', '#ec4899', '#6366f1']

export default function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 300,
        color: COLORS[i % COLORS.length],
        duration: 1200 + Math.random() * 800
      })),
    []
  )
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`
          }}
        />
      ))}
    </div>
  )
}
