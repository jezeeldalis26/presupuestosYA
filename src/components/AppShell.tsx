import { Clock3, FileStack, LayoutDashboard, ListChecks, LogOut, Plus, Settings2 } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { OfflineBanner } from './OfflineBanner'
import { Logo } from './ui'

const NAV = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/tabulador', label: 'Tabulador', icon: ListChecks },
  { to: '/historial', label: 'Historial', icon: Clock3, pending: true },
  { to: '/borradores', label: 'Borradores', icon: FileStack, pending: true },
  { to: '/preferencias', label: 'Preferencias', icon: Settings2 },
]

export function AppShell() {
  const { logout, user } = useAuth()
  const { profile } = useData()
  const navigate = useNavigate()
  const name = profile.businessName || user?.email || ''
  const initials = name.trim().slice(0, 2).toUpperCase() || 'YA'

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px]">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col p-4 md:flex">
        <div className="glass flex h-full flex-col p-5">
          <div className="px-1 pb-8 pt-1">
            <Logo />
          </div>
          <NavLink to="/nuevo" className="btn-primary mb-6 w-full px-3 text-sm whitespace-nowrap">
            <Plus className="size-4 shrink-0" /> Nuevo presupuesto
          </NavLink>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon, end, pending }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] transition ${
                    isActive
                      ? 'bg-brand-400/10 text-white shadow-[inset_0_0_0_1px_rgb(96_165_250/0.18)]'
                      : 'text-mist hover:bg-white/[0.04] hover:text-cloud'
                  }`
                }
              >
                <Icon className="size-4.5 transition group-hover:scale-110" />
                <span className="flex-1">{label}</span>
                {pending && <span className="size-1.5 rounded-full bg-amber-300/70" title="Próximamente" />}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-navy-700 to-navy-900 text-xs font-semibold text-brand-300">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white">{profile.businessName || 'Sin nombre'}</p>
              <p className="truncate text-[11px] text-mist">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="rounded-lg p-2 text-mist transition hover:bg-white/5 hover:text-rose-300" aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar móvil */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-night/70 px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:hidden">
          <Logo size="sm" />
          <button onClick={handleLogout} className="rounded-xl p-2 text-mist transition hover:text-rose-300" aria-label="Cerrar sesión">
            <LogOut className="size-5" />
          </button>
        </header>

        <main className="flex-1 px-5 pb-32 pt-6 sm:px-8 md:pb-12 md:pt-10">
          <OfflineBanner />
          <Outlet />
        </main>
      </div>

      {/* Navegación inferior móvil */}
      <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden">
        <div className="glass-strong flex items-center justify-around rounded-[1.75rem] px-2 py-2">
          {NAV.slice(0, 2).map((item) => (
            <MobileLink key={item.to} {...item} />
          ))}
          <NavLink to="/nuevo" aria-label="Nuevo presupuesto" className="-mt-8 grid size-14 place-items-center rounded-2xl bg-linear-to-b from-brand-500 to-brand-600 text-white shadow-[0_12px_30px_-8px_rgb(37_99_235/0.8)] transition active:scale-95">
            <Plus className="size-6" />
          </NavLink>
          {NAV.slice(2, 3).map((item) => (
            <MobileLink key={item.to} {...item} />
          ))}
          {NAV.slice(4).map((item) => (
            <MobileLink key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  )
}

function MobileLink({ to, label, icon: Icon, end }: (typeof NAV)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] transition ${isActive ? 'text-brand-300' : 'text-mist'}`
      }
    >
      <Icon className="size-5" />
      {label}
    </NavLink>
  )
}
