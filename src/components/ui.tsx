import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const text = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' }[size]
  return (
    <span className={`inline-flex items-baseline font-semibold tracking-tight ${text}`}>
      <span className="text-white">Presupuestos</span>
      <span className="relative bg-linear-to-br from-sky-300 to-sky-500 bg-clip-text font-bold text-transparent">
        YA
      </span>
      <span className="ml-0.5 inline-block size-1.5 translate-y-[-0.1em] rounded-full bg-sky-400 shadow-[0_0_12px_2px_rgb(124_196_255/0.7)]" />
    </span>
  )
}

/** Fondo con luces suaves en movimiento. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      <div className="absolute -top-40 -left-32 size-[34rem] animate-drift rounded-full bg-navy-700/40 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 size-[30rem] animate-drift rounded-full bg-sky-500/15 blur-[130px] [animation-delay:-6s]" />
      <div className="absolute -bottom-48 left-1/4 size-[28rem] animate-drift rounded-full bg-navy-800/50 blur-[120px] [animation-delay:-11s]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function PendingBadge() {
  return <span className="badge-pending">Próximamente</span>
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex animate-rise flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mist">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="glass flex animate-rise flex-col items-center px-6 py-14 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-sky-400/25 blur-2xl" />
        <div className="relative grid size-16 place-items-center rounded-3xl border border-white/10 bg-linear-to-br from-navy-800 to-navy-950 text-sky-300">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-mist">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal>
      <div className="absolute inset-0 animate-fade bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-strong relative max-h-[92dvh] w-full animate-rise overflow-y-auto rounded-b-none p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-lg sm:rounded-3xl sm:pb-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-mist transition hover:bg-white/5 hover:text-white" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />
}

export function FieldError({ text }: { text?: string }) {
  if (!text) return null
  return <p className="mt-1.5 animate-fade text-[13px] text-rose-300">{text}</p>
}
