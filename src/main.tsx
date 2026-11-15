import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { Backdrop, Logo } from './components/ui'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'
import { firebaseMissingConfig } from './lib/firebase'

function MissingConfig() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="glass max-w-md p-8 text-center">
        <Logo size="lg" />
        <p className="mt-6 text-sm leading-relaxed text-mist">
          Falta la configuración web de Firebase. Define las variables <code className="text-sky-300">VITE_FIREBASE_*</code> en <code className="text-sky-300">.env.production</code> o <code className="text-sky-300">.env.local</code>.
        </p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Backdrop />
    {firebaseMissingConfig ? (
      <MissingConfig />
    ) : (
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    )}
  </StrictMode>,
)
