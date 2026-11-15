import { ArrowUpRight, Check, Clock3, FileStack, ListChecks, Plus, Settings2, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PendingBadge, Skeleton } from '../components/ui'
import { useData } from '../context/DataContext'
import { CURRENCIES, formatMoney } from '../lib/model'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function DashboardPage() {
  const { profile, profileLoading, services, servicesLoading, error } = useData()
  const active = services.filter((s) => !s.archived)
  const avg = active.length ? active.reduce((a, s) => a + s.price, 0) / active.length : 0
  const currencyName = CURRENCIES.find((c) => c.code === profile.currency)?.name

  const steps = [
    { done: !!profile.businessName, label: 'Define tu nombre profesional', to: '/preferencias' },
    { done: active.length > 0, label: 'Registra tu primer servicio', to: '/tabulador' },
    { done: false, label: 'Crea tu primer presupuesto', to: '/nuevo', pending: true },
  ]

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <section className="glass relative animate-rise overflow-hidden p-6 sm:p-8">
        <div className="absolute -top-24 -right-16 size-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-sky-300">{greeting()}</p>
            {profileLoading ? (
              <Skeleton className="mt-2 h-9 w-64" />
            ) : (
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {profile.businessName || 'Bienvenido a PresupuestosYA'}
              </h1>
            )}
            <p className="mt-2 max-w-md text-sm leading-relaxed text-mist">
              Mantén tu tabulador al día para cotizar en segundos cuando llegue cada cliente.
            </p>
          </div>
          <Link to="/nuevo" className="btn-primary shrink-0 px-6 py-3.5 text-base">
            <Plus className="size-5" /> Nuevo presupuesto
          </Link>
        </div>
      </section>

      {error && <p className="glass border-rose-400/20 p-4 text-sm text-rose-200">{error}</p>}

      {/* Tarjetas informativas */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat loading={servicesLoading} icon={<ListChecks className="size-4.5" />} label="Servicios activos" value={String(active.length)} delay="60ms" />
        <Stat loading={servicesLoading || profileLoading} icon={<Wallet className="size-4.5" />} label="Precio promedio" value={active.length ? formatMoney(avg, profile.currency) : '—'} delay="120ms" />
        <Stat loading={profileLoading} icon={<Settings2 className="size-4.5" />} label="Moneda" value={profile.currency} hint={currencyName} delay="180ms" />
        <Stat icon={<FileStack className="size-4.5" />} label="Presupuestos" value="—" hint="Disponible próximamente" pending delay="240ms" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Accesos */}
        <section className="grid animate-rise gap-3 sm:grid-cols-2 [animation-delay:120ms]">
          <Shortcut to="/tabulador" icon={<ListChecks className="size-5" />} title="Tabulador" text="Tus servicios, precios y unidades de cobro." />
          <Shortcut to="/preferencias" icon={<Settings2 className="size-5" />} title="Preferencias" text="Nombre del emisor y moneda predeterminada." />
          <Shortcut to="/historial" icon={<Clock3 className="size-5" />} title="Historial" text="Presupuestos enviados y su estado." pending />
          <Shortcut to="/borradores" icon={<FileStack className="size-5" />} title="Borradores" text="Presupuestos que aún no terminas." pending />
        </section>

        {/* Primeros pasos */}
        <section className="glass animate-rise p-6 [animation-delay:180ms]">
          <h2 className="text-base font-semibold text-white">Primeros pasos</h2>
          <p className="mt-1 text-sm text-mist">Deja todo listo para tu primer presupuesto.</p>
          <ol className="mt-5 space-y-2">
            {steps.map((s, i) => (
              <li key={s.label}>
                <Link to={s.to} className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-white/[0.04]">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-semibold ${
                      s.done ? 'bg-emerald-400/15 text-emerald-300' : 'border border-white/10 text-mist'
                    }`}
                  >
                    {s.done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={`flex-1 text-sm ${s.done ? 'text-mist line-through decoration-white/20' : 'text-slate-100'}`}>{s.label}</span>
                  {s.pending && <PendingBadge />}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, hint, loading, pending, delay }: { icon: ReactNode; label: string; value: string; hint?: string; loading?: boolean; pending?: boolean; delay: string }) {
  return (
    <div className="glass animate-rise p-4 sm:p-5" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between">
        <span className={`grid size-9 place-items-center rounded-xl ${pending ? 'bg-amber-300/10 text-amber-200' : 'bg-sky-400/10 text-sky-300'}`}>{icon}</span>
      </div>
      <p className="mt-4 text-xs text-mist">{label}</p>
      {loading ? <Skeleton className="mt-1.5 h-7 w-20" /> : <p className="mt-0.5 truncate text-xl font-semibold text-white sm:text-2xl">{value}</p>}
      {hint && <p className="mt-0.5 truncate text-[11px] text-mist/80">{hint}</p>}
    </div>
  )
}

function Shortcut({ to, icon, title, text, pending }: { to: string; icon: ReactNode; title: string; text: string; pending?: boolean }) {
  return (
    <Link to={to} className="glass group flex flex-col p-5 transition duration-300 hover:-translate-y-0.5 hover:border-sky-400/20 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-navy-700/80 to-navy-900 text-sky-300 shadow-inner">{icon}</span>
        <ArrowUpRight className="size-4.5 text-mist transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-300" />
      </div>
      <div className="mt-5 flex items-center gap-2">
        <h3 className="font-medium text-white">{title}</h3>
        {pending && <PendingBadge />}
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-mist">{text}</p>
    </Link>
  )
}
