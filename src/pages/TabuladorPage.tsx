import { Archive, ArchiveRestore, ListChecks, MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { EmptyState, FieldError, Modal, PageHeader, Skeleton, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { dbErrorMessage } from '../lib/authErrors'
import { createService, deleteService, setServiceArchived, updateService } from '../lib/db'
import { QUEUED_MSG, commitWrite } from '../lib/write'
import {
  LIMITS,
  UNIT_LABEL,
  UNITS,
  formatMoney,
  minorToInput,
  parseMoneyToMinor,
  validateService,
  type Currency,
  type Service,
  type ServiceInput,
  type Unit,
} from '../lib/model'

type Tab = 'activos' | 'archivados'

export function TabuladorPage() {
  const { user } = useAuth()
  const uid = user!.uid
  const { services, servicesLoading, profile } = useData()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('activos')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  const counts = useMemo(
    () => ({ activos: services.filter((s) => !s.archived).length, archivados: services.filter((s) => s.archived).length }),
    [services],
  )
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return services
      .filter((s) => (tab === 'activos' ? !s.archived : s.archived))
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
  }, [services, tab, query])

  async function toggleArchive(s: Service) {
    try {
      const r = await commitWrite(setServiceArchived(uid, s.id, !s.archived))
      toast(r === 'queued' ? QUEUED_MSG : s.archived ? 'Servicio restaurado' : 'Servicio archivado')
    } catch (e) {
      toast(dbErrorMessage(e), 'error')
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      const r = await commitWrite(deleteService(uid, toDelete.id))
      toast(r === 'queued' ? QUEUED_MSG : 'Servicio eliminado')
      setToDelete(null)
    } catch (e) {
      toast(dbErrorMessage(e), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Tabulador"
        subtitle="Tu catálogo de servicios y precios base para cotizar."
        action={
          <button onClick={() => setEditing('new')} className="btn-primary">
            <Plus className="size-4.5" /> Nuevo servicio
          </button>
        }
      />

      <div className="mb-5 flex animate-rise flex-col gap-3 [animation-delay:60ms] sm:flex-row sm:items-center">
        <div className="glass flex rounded-2xl p-1">
          {(['activos', 'archivados'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm capitalize transition sm:flex-none ${
                tab === t ? 'bg-brand-400/15 text-white shadow-[inset_0_0_0_1px_rgb(96_165_250/0.2)]' : 'text-mist hover:text-slate-200'
              }`}
            >
              {t} <span className="ml-1 text-xs text-mist">{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mist" />
          <input className="field rounded-2xl py-2.5 pl-11" placeholder="Buscar servicio…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {servicesLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="mt-3 h-3.5 w-full" />
              <Skeleton className="mt-2 h-3.5 w-1/2" />
              <Skeleton className="mt-6 h-7 w-28" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        query ? (
          <EmptyState icon={<Search className="size-7" />} title="Sin resultados" text={`No hay servicios ${tab} que coincidan con “${query}”.`} />
        ) : tab === 'activos' ? (
          <EmptyState
            icon={<ListChecks className="size-7" />}
            title="Tu tabulador está vacío"
            text="Registra los servicios que ofreces con su precio y unidad de cobro. Los usarás para armar cada presupuesto."
            action={
              <button onClick={() => setEditing('new')} className="btn-primary">
                <Plus className="size-4.5" /> Registrar mi primer servicio
              </button>
            }
          />
        ) : (
          <EmptyState icon={<Archive className="size-7" />} title="Nada archivado" text="Los servicios que archives aparecerán aquí y podrás restaurarlos cuando quieras." />
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s, i) => (
            <ServiceCard
              key={s.id}
              service={s}
              currency={profile.currency}
              delay={Math.min(i, 8) * 40}
              onEdit={() => setEditing(s)}
              onArchive={() => toggleArchive(s)}
              onDelete={() => setToDelete(s)}
            />
          ))}
        </div>
      )}

      <ServiceForm
        key={editing === 'new' ? 'new' : (editing?.id ?? 'closed')}
        open={editing !== null}
        service={editing === 'new' ? null : editing}
        currency={profile.currency}
        onClose={() => setEditing(null)}
        onSave={async (input) => {
          if (editing && editing !== 'new') {
            const r = await commitWrite(updateService(uid, editing.id, input))
            toast(r === 'queued' ? QUEUED_MSG : 'Servicio actualizado')
          } else {
            const r = await commitWrite(createService(uid, input))
            toast(r === 'queued' ? QUEUED_MSG : 'Servicio registrado')
          }
          setEditing(null)
        }}
      />

      <Modal open={!!toDelete} onClose={() => !deleting && setToDelete(null)} title="Eliminar servicio">
        <p className="text-sm leading-relaxed text-mist">
          ¿Eliminar <span className="font-medium text-white">{toDelete?.name}</span> de forma permanente? Si solo quieres ocultarlo, mejor archívalo.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="btn-ghost" disabled={deleting} onClick={() => setToDelete(null)}>
            Cancelar
          </button>
          <button className="btn-danger" disabled={deleting} onClick={confirmDelete}>
            {deleting ? <Spinner /> : <><Trash2 className="size-4" /> Eliminar</>}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function ServiceCard({
  service: s,
  currency,
  delay,
  onEdit,
  onArchive,
  onDelete,
}: {
  service: Service
  currency: Currency
  delay: number
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menu])

  return (
    <article
      className={`glass group relative flex animate-rise flex-col p-5 transition duration-300 hover:border-white/15 ${s.archived ? 'opacity-70' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-white" title={s.name}>
            {s.name}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5em] text-[13px] leading-relaxed text-mist">{s.description || 'Sin descripción'}</p>
        </div>
        <div className="relative" ref={ref}>
          <button onClick={() => setMenu((m) => !m)} className="-mr-2 -mt-1 rounded-xl p-2 text-mist transition hover:bg-white/5 hover:text-white" aria-label="Opciones">
            <MoreVertical className="size-4.5" />
          </button>
          {menu && (
            <div className="glass-strong absolute right-0 z-20 mt-1 w-44 animate-pop overflow-hidden rounded-2xl p-1.5 text-sm">
              <MenuItem icon={<Pencil className="size-4" />} label="Editar" onClick={() => (setMenu(false), onEdit())} />
              <MenuItem
                icon={s.archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
                label={s.archived ? 'Restaurar' : 'Archivar'}
                onClick={() => (setMenu(false), onArchive())}
              />
              <MenuItem icon={<Trash2 className="size-4" />} label="Eliminar" danger onClick={() => (setMenu(false), onDelete())} />
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <p className="text-xl font-semibold tracking-tight text-white">{formatMoney(s.priceMinor, currency)}</p>
          <p className="flex items-center gap-2 text-xs text-mist">
            {UNIT_LABEL[s.unit].per}
            {s.pending && (
              <span className="inline-flex items-center gap-1 text-amber-200/90" title="Pendiente de sincronizar">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-300" /> Sincronizando
              </span>
            )}
          </p>
        </div>
        <button onClick={onEdit} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-mist transition hover:border-brand-400/30 hover:text-brand-200 sm:opacity-0 sm:group-hover:opacity-100">
          Editar
        </button>
      </div>
    </article>
  )
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${danger ? 'text-rose-300 hover:bg-rose-400/10' : 'text-slate-200 hover:bg-white/5'}`}
    >
      {icon}
      {label}
    </button>
  )
}

function ServiceForm({
  open,
  service,
  currency,
  onClose,
  onSave,
}: {
  open: boolean
  service: Service | null
  currency: Currency
  onClose: () => void
  onSave: (s: ServiceInput) => Promise<void>
}) {
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [price, setPrice] = useState(service ? minorToInput(service.priceMinor, currency) : '')
  const [unit, setUnit] = useState<Unit>(service?.unit ?? 'servicio')
  const [errors, setErrors] = useState<ReturnType<typeof validateService>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const priceMinor = parseMoneyToMinor(price, currency)
    const errs = validateService({ name, description, priceMinor, unit })
    setErrors(errs)
    if (Object.keys(errs).length || priceMinor === null) return
    const input: ServiceInput = { name, description, priceMinor, unit }
    setBusy(true)
    try {
      await onSave(input)
    } catch (err) {
      setFormError(dbErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={service ? 'Editar servicio' : 'Nuevo servicio'}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="s-name">Nombre del servicio</label>
          <input id="s-name" autoFocus maxLength={LIMITS.serviceName} className="field" placeholder="Ej. Diseño de logotipo" value={name} onChange={(e) => setName(e.target.value)} />
          <FieldError text={errors.name} />
        </div>
        <div>
          <label className="label" htmlFor="s-desc">
            Descripción <span className="font-normal text-mist">(opcional)</span>
          </label>
          <textarea
            id="s-desc"
            rows={3}
            maxLength={LIMITS.serviceDescription}
            className="field resize-none"
            placeholder="Qué incluye, entregables, condiciones…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-between">
            <FieldError text={errors.description} />
            <span className="mt-1 ml-auto text-[11px] text-mist">
              {description.length}/{LIMITS.serviceDescription}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="s-price">Precio ({currency})</label>
            <input id="s-price" type="text" inputMode="decimal" autoComplete="off" className="field" placeholder="0,00" value={price} onChange={(e) => setPrice(e.target.value)} />
            <FieldError text={errors.price} />
          </div>
          <div>
            <span className="label">Unidad de cobro</span>
            <div className="grid grid-cols-2 gap-1.5">
              {UNITS.map((u) => (
                <button
                  type="button"
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`rounded-xl border px-2 py-2 text-[13px] transition ${
                    unit === u ? 'border-brand-400/50 bg-brand-400/10 text-white' : 'border-white/10 text-mist hover:border-white/20 hover:text-slate-200'
                  }`}
                >
                  {UNIT_LABEL[u].one}
                </button>
              ))}
            </div>
            <FieldError text={errors.unit} />
          </div>
        </div>
        <FieldError text={formError} />
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-ghost" disabled={busy} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? <Spinner /> : service ? 'Guardar cambios' : 'Registrar servicio'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
