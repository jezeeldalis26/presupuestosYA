// Modelo de datos y validaciones compartidas.
// Las mismas restricciones se replican en firestore.rules.

export const UNITS = ['servicio', 'hora', 'dia', 'unidad'] as const
export type Unit = (typeof UNITS)[number]

export const UNIT_LABEL: Record<Unit, { one: string; per: string }> = {
  servicio: { one: 'Servicio', per: 'por servicio' },
  hora: { one: 'Hora', per: 'por hora' },
  dia: { one: 'Día', per: 'por día' },
  unidad: { one: 'Unidad', per: 'por unidad' },
}

export const CURRENCIES = [
  { code: 'BRL', name: 'Real brasileño' },
  { code: 'USD', name: 'Dólar estadounidense' },
  { code: 'EUR', name: 'Euro' },
  { code: 'VES', name: 'Bolívar venezolano' },
  { code: 'COP', name: 'Peso colombiano' },
  { code: 'MXN', name: 'Peso mexicano' },
  { code: 'ARS', name: 'Peso argentino' },
  { code: 'CLP', name: 'Peso chileno' },
  { code: 'PEN', name: 'Sol peruano' },
] as const
export type Currency = (typeof CURRENCIES)[number]['code']
export const DEFAULT_CURRENCY: Currency = 'USD'

export const LIMITS = {
  businessName: 80,
  serviceName: 80,
  serviceDescription: 300,
  maxPrice: 1_000_000_000,
} as const

export interface Profile {
  businessName: string
  currency: Currency
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  unit: Unit
  archived: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface ServiceInput {
  name: string
  description: string
  price: number
  unit: Unit
}

export function isCurrency(v: unknown): v is Currency {
  return CURRENCIES.some((c) => c.code === v)
}

export function isUnit(v: unknown): v is Unit {
  return (UNITS as readonly unknown[]).includes(v)
}

/** Devuelve un mapa campo → mensaje de error. Vacío = válido. */
export function validateService(input: ServiceInput): Partial<Record<keyof ServiceInput, string>> {
  const errors: Partial<Record<keyof ServiceInput, string>> = {}
  const name = input.name.trim()
  if (!name) errors.name = 'Escribe el nombre del servicio.'
  else if (name.length > LIMITS.serviceName) errors.name = `Máximo ${LIMITS.serviceName} caracteres.`
  if (input.description.trim().length > LIMITS.serviceDescription)
    errors.description = `Máximo ${LIMITS.serviceDescription} caracteres.`
  if (!Number.isFinite(input.price) || input.price < 0) errors.price = 'Ingresa un precio válido.'
  else if (input.price > LIMITS.maxPrice) errors.price = 'El precio es demasiado alto.'
  if (!isUnit(input.unit)) errors.unit = 'Selecciona una unidad.'
  return errors
}

export function formatMoney(value: number, currency: Currency) {
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'CLP' ? 0 : 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}
