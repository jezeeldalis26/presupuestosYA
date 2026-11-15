import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { saveProfile } from '../lib/db'
import { getFirebase } from '../lib/firebase'
import { DEFAULT_CURRENCY } from '../lib/model'

interface AuthValue {
  user: User | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const Ctx = createContext<AuthValue | null>(null)

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
        // Perfil inicial: una sola escritura al registrarse.
        await Promise.all([
          updateProfile(cred.user, { displayName: businessName }),
          saveProfile(cred.user.uid, { businessName, currency: DEFAULT_CURRENCY }),
        ])
      },
      async login(email, password) {
        await signInWithEmailAndPassword(getFirebase().auth, email.trim(), password)
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
