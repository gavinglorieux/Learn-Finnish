type Toast = { id: string; title: string; emoji?: string; body?: string }

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 z-40 flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto card px-4 py-3 w-full max-w-sm flex items-start gap-3 animate-slide-up"
          role="status"
        >
          <div className="text-2xl">{t.emoji ?? '✨'}</div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{t.title}</div>
            {t.body && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
