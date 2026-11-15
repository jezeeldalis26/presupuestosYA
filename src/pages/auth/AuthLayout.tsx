import { ClipboardList, Sparkles, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '../../components/ui'

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-[1.1fr_1fr]">
      {/* Panel de marca (escritorio) */}
      <section className="relative hidden flex-col justify-between p-12 lg:flex">
        <Logo size="lg" />
        <div className="max-w-lg animate-rise">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/5 px-3 py-1 text-xs text-sky-300">
            <Sparkles className="size-3.5" /> Presupuestos profesionales en minutos
          </p>
          <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight text-white">
            Tus precios, ordenados.
            <br />
            <span className="bg-linear-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">Tus presupuestos, listos YA.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-mist">
            Arma tu tabulador de servicios una sola vez y úsalo para cotizar a cada cliente sin empezar desde cero.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            <Feature icon={<ClipboardList className="size-4.5" />} title="Tabulador" text="Servicios, precios y unidades de cobro." />
            <Feature icon={<Zap className="size-4.5" />} title="Rápido" text="Pensado para el celular y la computadora." />
          </div>
        </div>
        <p className="text-xs text-mist/60">© {new Date().getFullYear()} PresupuestosYA</p>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex justify-center lg:hidden">
            <Logo size="lg" />
          </div>
          <div className="glass animate-rise p-7 sm:p-9">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="mt-1.5 mb-7 text-sm text-mist">{subtitle}</p>
            {children}
          </div>
          {footer && <div className="mt-6 animate-fade text-center text-sm text-mist">{footer}</div>}
        </div>
      </section>
    </div>
  )
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass p-4">
      <div className="mb-3 grid size-9 place-items-center rounded-xl bg-sky-400/10 text-sky-300">{icon}</div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-mist">{text}</p>
    </div>
  )
}
