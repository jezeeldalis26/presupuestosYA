import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { profileExists, saveProfile } from '../lib/db'
import { getFirebase } from '../lib/firebase'
import { DEFAULT_CURRENCY } from '../lib/model'

interface AuthValue {
  user: User | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const Ctx = createContext<AuthValue | null>(null)

async function ensureProfile(user: User) {
  // Solo para cuentas nuevas de Google: 1 lectura y, si falta, 1 escritura.
  if (!(await profileExists(user.uid))) {
    await saveProfile(user.uid, { businessName: (user.displayName ?? '').slice(0, 80), currency: DEFAULT_CURRENCY })
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { auth } = getFirebase()
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      async register(name, email, password) {
        const { auth } = getFirebase()
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
        const businessName = name.trim()
        await Promise.all([
          updateProfile(cred.user, { displayName: businessName }),
          saveProfile(cred.user.uid, { businessName, currency: DEFAULT_CURRENCY }),
        ])
      },
      async login(email, password) {
        await signInWithEmailAndPassword(getFirebase().auth, email.trim(), password)
      },
      async loginWithGoogle() {
        const { auth } = getFirebase()
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })
        try {
          const cred = await signInWithPopup(auth, provider)
          await ensureProfile(cred.user)
        } catch (err) {
          // Si el navegador bloquea la ventana emergente, usamos redirección.
          if ((err as { code?: string })?.code === 'auth/popup-blocked') {
            await signInWithRedirect(auth, provider)
            return
          }
          throw err
        }
      },
      async logout() {
        await signOut(getFirebase().auth)
      },
      async resetPassword(email) {
        await sendPasswordResetEmail(getFirebase().auth, email.trim())
      },
    }),
    [user, loading],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth fuera de AuthProvider')
  return v
}
