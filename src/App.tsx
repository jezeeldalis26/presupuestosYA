import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute, PublicOnlyRoute } from './components/Guards'
import { DashboardPage } from './pages/DashboardPage'
import { PendingPage } from './pages/PendingPage'
import { PreferenciasPage } from './pages/PreferenciasPage'
import { TabuladorPage } from './pages/TabuladorPage'
import { ForgotPage } from './pages/auth/ForgotPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar" element={<ForgotPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/tabulador" element={<TabuladorPage />} />
          <Route path="/preferencias" element={<PreferenciasPage />} />
          <Route
            path="/nuevo"
            element={<PendingPage title="Nuevo presupuesto" text="Pronto podrás armar presupuestos seleccionando servicios de tu tabulador. Esta función se habilitará en una próxima etapa." />}
          />
          <Route path="/historial" element={<PendingPage title="Historial" text="Aquí verás los presupuestos que hayas emitido. Se habilitará en una próxima etapa." />} />
          <Route path="/borradores" element={<PendingPage title="Borradores" text="Aquí quedarán los presupuestos que dejes a medias. Se habilitará en una próxima etapa." />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
