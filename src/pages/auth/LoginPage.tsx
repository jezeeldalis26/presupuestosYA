import { ArrowRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FieldError, Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { authErrorMessage } from '../../lib/authErrors'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(authErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Ingresa para continuar con tus presupuestos."
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-sky-300 hover:text-sky-200">
            Crea una gratis
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" autoComplete="email" required className="field" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Contraseña</label>
            <Link to="/recuperar" className="mb-1.5 text-[13px] text-sky-300 hover:text-sky-200">
              ¿La olvidaste?
            </Link>
          </div>
          <PasswordInput id="password" autoComplete="current-password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <FieldError text={error} />
        <button type="submit" disabled={busy} className="btn-primary mt-2 w-full">
          {busy ? <Spinner /> : <>Iniciar sesión <ArrowRight className="size-4.5" /></>}
        </button>
      </form>
    </AuthLayout>
  )
}
