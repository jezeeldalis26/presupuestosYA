import { WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div role="status" className="mb-5 flex animate-rise items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
      <WifiOff className="size-4.5 shrink-0" />
      Sin conexión. Puedes seguir consultando tus datos; los cambios se sincronizarán al reconectar.
    </div>
  )
}
