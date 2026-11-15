import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FieldError, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { authErrorMessage } from '../../lib/authErrors'
import { LIMITS } from '../../lib/model'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'

export function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Escribe tu nombre profesional o comercial.')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    setBusy(true)
    try {
      await register(name, email, password)
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Empieza a armar tu tabulador en menos de un minuto."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-sky-300 hover:text-sky-200">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="name">Nombre profesional o comercial</label>
          <input id="name" autoComplete="organization" maxLength={LIMITS.businessName} className="field" placeholder="Ej. Estudio Creativo Luna" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" autoComplete="email" className="field" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <PasswordInput id="password" autoComplete="new-password" placeholder="Mín. 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirmar</label>
            <PasswordInput id="confirm" autoComplete="new-password" placeholder="Repítela" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>
        <FieldError text={error} />
        <button type="submit" disabled={busy} className="btn-primary mt-2 w-full">
          {busy ? <Spinner /> : <>Crear cuenta <ArrowRight className="size-4.5" /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
