import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { watchProfile, watchServices } from '../lib/db'
import { DEFAULT_CURRENCY, type Profile, type Service } from '../lib/model'
import { useAuth } from './AuthContext'

interface DataValue {
  profile: Profile
  profileLoading: boolean
  profileExists: boolean
  services: Service[]
  servicesLoading: boolean
  error: string | null
}

const Ctx = createContext<DataValue | null>(null)

/** Mantiene un único listener de perfil y uno de servicios para toda la sesión. */
export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    setProfileLoading(true)
    setServicesLoading(true)
    const onError = (e: Error) => {
      console.error(e)
      setError('No se pudieron cargar tus datos. Revisa tu conexión.')
      setProfileLoading(false)
      setServicesLoading(false)
    }
    const offProfile = watchProfile(
      uid,
      (p) => {
        setProfile(p)
        setProfileLoading(false)
      },
      onError,
    )
    const offServices = watchServices(
      uid,
      (s) => {
        setServices(s)
        setServicesLoading(false)
      },
      onError,
    )
    return () => {
      offProfile()
      offServices()
    }
  }, [uid])

  const value = useMemo<DataValue>(
    () => ({
      profile: profile ?? { businessName: user?.displayName ?? '', currency: DEFAULT_CURRENCY },
      profileExists: profile !== null,
      profileLoading,
      services,
      servicesLoading,
      error,
    }),
    [profile, profileLoading, services, servicesLoading, error, user?.displayName],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData fuera de DataProvider')
  return v
}
