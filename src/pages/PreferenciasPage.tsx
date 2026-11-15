import { FileText } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { FieldError, PageHeader, Skeleton, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { dbErrorMessage } from '../lib/authErrors'
import { saveProfile } from '../lib/db'
import { CURRENCIES, LIMITS, formatMoney, type Currency } from '../lib/model'

export function PreferenciasPage() {
  const { user } = useAuth()
  const { profile, profileLoading } = useData()
  const toast = useToast()
  const [name, setName] = useState(profile.businessName)
  const [currency, setCurrency] = useState<Currency>(profile.currency)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Sincroniza el formulario cuando llega el perfil.
  useEffect(() => {
    if (!profileLoading) {
      setName(profile.businessName)
      setCurrency(profile.currency)
    }
  }, [profileLoading, profile.businessName, profile.currency])

  const dirty = name.trim() !== profile.businessName || currency !== profile.currency

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Escribe tu nombre profesional o comercial.')
    setBusy(true)
    try {
      await saveProfile(user!.uid, { businessName: name, currency })
      toast('Preferencias guardadas')
    } catch (err) {
      setError(dbErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Preferencias" subtitle="Datos que aparecerán como emisor en tus presupuestos." />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={onSubmit} className="glass animate-rise space-y-5 p-6 sm:p-7" noValidate>
          {profileLoading ? (
            <>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : (
            <>
              <div>
                <label className="label" htmlFor="p-name">Nombre profesional o comercial</label>
                <input id="p-name" maxLength={LIMITS.businessName} className="field" placeholder="Ej. Estudio Creativo Luna" value={name} onChange={(e) => setName(e.target.value)} />
                <p className="mt-1.5 text-[12px] text-mist">Se mostrará como emisor en cada presupuesto.</p>
              </div>
              <div>
                <label className="label" htmlFor="p-currency">Moneda predeterminada</label>
                <select id="p-currency" className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%238b97ad%22 stroke-width=%222%22><path d=%22M4 6l4 4 4-4%22/></svg>')] bg-[length:16px] bg-[position:right_1rem_center] bg-no-repeat pr-10" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-navy-950">
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[12px] text-mist">Se usará para los precios del tabulador y los nuevos presupuestos.</p>
              </div>
              <FieldError text={error} />
              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={busy || !dirty}>
                  {busy ? <Spinner /> : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Vista previa del emisor */}
        <aside className="glass animate-rise p-6 [animation-delay:100ms]">
          <p className="mb-4 flex items-center gap-2 text-xs font-medium tracking-wide text-mist uppercase">
            <FileText className="size-3.5" /> Vista previa del emisor
          </p>
          <div className="rounded-2xl bg-white p-5 text-slate-800 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="min-w-0">
                <p className="text-[10px] tracking-widest text-slate-400 uppercase">Emitido por</p>
                <p className="mt-0.5 truncate text-base font-semibold text-navy-900">{name.trim() || 'Tu nombre comercial'}</p>
              </div>
              <p className="shrink-0 text-[10px] font-semibold tracking-widest text-sky-600 uppercase">Presupuesto</p>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Servicio de ejemplo</span>
                <span>{formatMoney(150, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-navy-900">
                <span>Total</span>
                <span>{formatMoney(150, currency)}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-mist">Ejemplo ilustrativo. La generación de presupuestos llegará en el próximo gate.</p>
        </aside>
      </div>
    </div>
  )
}
