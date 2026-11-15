import { ArrowLeft, MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FieldError, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { authErrorMessage } from '../../lib/authErrors'
import { AuthLayout } from './AuthLayout'

export function ForgotPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      // Por privacidad no revelamos si el correo existe.
      const code = (err as { code?: string })?.code
      if (code === 'auth/user-not-found') setSent(true)
      else setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Te enviaremos un enlace para crear una nueva."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-brand-300 hover:text-brand-200">
          <ArrowLeft className="size-4" /> Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <div className="animate-pop text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <MailCheck className="size-7" />
          </div>
          <p className="text-[15px] text-white">Revisa tu bandeja de entrada</p>
          <p className="mt-1.5 text-sm leading-relaxed text-mist">
            Si existe una cuenta con <span className="text-slate-200">{email}</span>, recibirás un enlace en unos minutos. Revisa también la carpeta de spam.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" autoComplete="email" className="field" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <FieldError text={error} />
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? <Spinner /> : 'Enviar enlace'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
