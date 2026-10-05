import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '@/state/AppState'
import { HomeIcon, BookIcon, DumbbellIcon, ScrollIcon, ListIcon, CogIcon, FinnishFlag } from './Icons'
import Toasts from './Toasts'
import Confetti from './Confetti'
import PullToRefresh from './PullToRefresh'
import ScrollManager from './ScrollManager'

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/learn', label: 'Learn', icon: BookIcon },
  { to: '/practice', label: 'Practice', icon: DumbbellIcon },
  { to: '/grammar', label: 'Grammar', icon: ScrollIcon },
  { to: '/vocabulary', label: 'Words', icon: ListIcon }
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { toasts, celebrate } = useApp()
  const location = useLocation()
  const isExercise = location.pathname.startsWith('/practice/')
  return (
    <div className="min-h-full flex flex-col">
      <ScrollManager />
      {!isExercise && <PullToRefresh />}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container-app flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-finnish-500">
            <FinnishFlag size={22} />
            <span className="tracking-tight">Learn Finnish</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-finnish-50 text-finnish-500 dark:bg-slate-800 dark:text-finnish-200'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`
                }
              >
                <n.icon size={18} />
                {n.label}
              </NavLink>
            ))}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-finnish-50 text-finnish-500 dark:bg-slate-800 dark:text-finnish-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
              aria-label="Settings"
            >
              <CogIcon size={18} />
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={`flex-1 container-app py-6 ${isExercise ? 'pb-32' : 'pb-28 md:pb-8'}`}>{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-5">
          {navItems.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2.5 text-[11px] font-medium transition ${
                    isActive ? 'text-finnish-500 dark:text-finnish-200' : 'text-slate-500 dark:text-slate-400'
                  }`
                }
              >
                <n.icon size={22} />
                <span className="mt-0.5">{n.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Toasts toasts={toasts} />
      {celebrate && <Confetti />}
    </div>
  )
}
