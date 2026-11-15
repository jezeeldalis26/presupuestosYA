import {
  Activity,
  Archive,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock3,
  FilePlus2,
  FileStack,
  Hourglass,
  ListChecks,
  Pencil,
  Plus,
  Settings2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PendingBadge, Skeleton } from '../components/ui'
import { useData } from '../context/DataContext'
import { formatMoney, UNIT_LABEL, type Service } from '../lib/model'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
function timeAgo(d: Date | null) {
  if (!d) return 'ahora'
  const s = Math.round((d.getTime() - Date.now()) / 1000)
  const abs = Math.abs(s)
  if (abs < 60) return 'hace un momento'
  if (abs < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  return rtf.format(Math.round(s / 86400), 'day')
}

/** Actividad real derivada de los servicios del usuario (sin consultas extra). */
function activityOf(s: Service) {
  const created = s.createdAt?.getTime() ?? 0
  const updated = s.updatedAt?.getTime() ?? created
  const edited = updated - created > 2000
  if (edited && s.archived) return { icon: <Archive className="size-4" />, verb: 'Archivaste' }
  if (edited) return { icon: <Pencil className="size-4" />, verb: 'Actualizaste' }
  return { icon: <FilePlus2 className="size-4" />, verb: 'Registraste' }
}

export function DashboardPage() {
  const { profile, profileLoading, services, servicesLoading, error } = useData()
  const active = services.filter((s) => !s.archived)
  const recent = [...services]
    .sort((a, b) => (b.updatedAt?.getTime() ?? Date.now()) - (a.updatedAt?.getTime() ?? Date.now()))
    .slice(0, 5)

  const steps = [
    { done: !!profile.businessName, label: 'Define tu nombre profesional', to: '/preferencias' },
    { done: active.length > 0, label: 'Registra tu primer servicio', to: '/tabulador' },
    { done: false, label: 'Crea tu primer presupuesto', to: '/nuevo', pending: true },
  ]

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <section className="glass relative animate-rise overflow-hidden p-6 sm:p-8">
        <div className="absolute -top-24 -right-16 size-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-brand-400">{greeting()}</p>
            {profileLoading ? (
              <Skeleton className="mt-2 h-9 w-64 max-w-full" />
            ) : (
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {profile.businessName || 'Bienvenido a PresupuestosYA'}
              </h1>
            )}
            {!profileLoading && !profile.businessName && (
              <Link to="/preferencias" className="mt-1 inline-block text-sm text-brand-400 hover:text-brand-300">
                Configura tu nombre profesional →
              </Link>
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

      {/* Tarjetas informativas: solo datos reales */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat icon={<FileStack className="size-4.5" />} label="Presupuestos creados" pending delay="40ms" />
        <Stat icon={<Hourglass className="size-4.5" />} label="Pendientes" pending delay="90ms" />
        <Stat icon={<BadgeCheck className="size-4.5" />} label="Trabajos realizados" pending delay="140ms" />
        <Stat
          icon={<ListChecks className="size-4.5" />}
          label="Servicios en tu tabulador"
          value={String(active.length)}
          hint={`Moneda: ${profile.currency}`}
          loading={servicesLoading || profileLoading}
          delay="190ms"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Actividad reciente */}
        <section className="glass animate-rise p-6 [animation-delay:120ms]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              <Activity className="size-4.5 text-brand-400" /> Actividad reciente
            </h2>
            {recent.length > 0 && (
              <Link to="/tabulador" className="text-[13px] text-brand-400 hover:text-brand-300">
                Ver tabulador
              </Link>
            )}
          </div>
          {servicesLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-9 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
              <p className="text-sm text-cloud">Aún no hay actividad</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-mist">Cuando registres servicios o presupuestos, los verás aquí.</p>
              <Link to="/tabulador" className="btn-ghost mt-5 px-4 py-2 text-sm">
                <Plus className="size-4" /> Registrar un servicio
              </Link>
            </div>
          ) : (
            <ul className="space-y-1">
              {recent.map((s) => {
                const a = activityOf(s)
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/[0.03]">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400">{a.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-cloud">
                        {a.verb} <span className="font-medium text-white">{s.name}</span>
                      </p>
                      <p className="text-[12px] text-mist">
                        {formatMoney(s.priceMinor, profile.currency)} {UNIT_LABEL[s.unit].per} · {timeAgo(s.updatedAt)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          {/* Primeros pasos */}
          <section className="glass animate-rise p-6 [animation-delay:180ms]">
            <h2 className="text-base font-semibold text-white">Primeros pasos</h2>
            <ol className="mt-4 space-y-1">
              {steps.map((s, i) => (
                <li key={s.label}>
                  <Link to={s.to} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/[0.04]">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-semibold ${
                        s.done ? 'bg-emerald-400/15 text-emerald-300' : 'border border-white/10 text-mist'
                      }`}
                    >
                      {s.done ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className={`flex-1 text-sm ${s.done ? 'text-mist line-through decoration-white/20' : 'text-cloud'}`}>{s.label}</span>
                    {s.pending && <PendingBadge />}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* Accesos rápidos */}
          <section className="grid animate-rise grid-cols-2 gap-3 [animation-delay:220ms]">
            <Shortcut to="/tabulador" icon={<ListChecks className="size-5" />} title="Tabulador" />
            <Shortcut to="/preferencias" icon={<Settings2 className="size-5" />} title="Preferencias" />
            <Shortcut to="/borradores" icon={<FileStack className="size-5" />} title="Borradores" pending />
            <Shortcut to="/historial" icon={<Clock3 className="size-5" />} title="Historial" pending />
          </section>
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  hint,
  loading,
  pending,
  delay,
}: {
  icon: ReactNode
  label: string
  value?: string
  hint?: string
  loading?: boolean
  pending?: boolean
  delay: string
}) {
  return (
    <div className="glass animate-rise p-4 sm:p-5" style={{ animationDelay: delay }}>
      <span className={`grid size-9 place-items-center rounded-xl ${pending ? 'bg-white/5 text-mist' : 'bg-brand-500/15 text-brand-400'}`}>{icon}</span>
      <p className="mt-4 text-xs text-mist">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-7 w-16" />
      ) : pending ? (
        <p className="mt-1 text-[13px] font-medium text-amber-200/80">Próximamente</p>
      ) : (
        <p className="mt-0.5 truncate text-2xl font-semibold text-white">{value}</p>
      )}
      {hint && !loading && <p className="mt-0.5 truncate text-[11px] text-mist/80">{hint}</p>}
    </div>
  )
}

function Shortcut({ to, icon, title, pending }: { to: string; icon: ReactNode; title: string; pending?: boolean }) {
  return (
    <Link to={to} className="glass group flex flex-col gap-3 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand-400/25 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-2xl bg-linear-to-br from-navy-700 to-navy-900 text-brand-400">{icon}</span>
        <ArrowUpRight className="size-4 text-mist transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        {pending && <p className="text-[11px] text-amber-200/70">Próximamente</p>}
      </div>
    </Link>
  )
}
