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

/** Cada moneda se formatea con la convención local de su país. */
export const CURRENCIES = [
  { code: 'BRL', name: 'Real brasileño', locale: 'pt-BR', decimals: 2 },
  { code: 'USD', name: 'Dólar', locale: 'en-US', decimals: 2 },
  { code: 'EUR', name: 'Euro', locale: 'es-ES', decimals: 2 },
  { code: 'VES', name: 'Bolívar venezolano', locale: 'es-VE', decimals: 2 },
] as const
export type Currency = (typeof CURRENCIES)[number]['code']
export const DEFAULT_CURRENCY: Currency = 'USD'

export const LIMITS = {
  businessName: 80,
  serviceName: 80,
  serviceDescription: 300,
  /** Precio máximo en unidades menores (centavos): 1.000.000.000,00 */
  maxPriceMinor: 100_000_000_000,
} as const

export interface Profile {
  businessName: string
  currency: Currency
}

export interface Service {
  id: string
  name: string
  description: string
  /** Precio en unidades menores enteras (centavos) para evitar errores de coma flotante. */
  priceMinor: number
  unit: Unit
  archived: boolean
  createdAt: Date | null
  updatedAt: Date | null
  /** true mientras el cambio no se ha confirmado en el servidor */
  pending: boolean
}

export interface ServiceInput {
  name: string
  description: string
  priceMinor: number
  unit: Unit
}

const meta = (c: Currency) => CURRENCIES.find((x) => x.code === c) ?? CURRENCIES[1]

export function isCurrency(v: unknown): v is Currency {
  return CURRENCIES.some((c) => c.code === v)
}

export function isUnit(v: unknown): v is Unit {
  return (UNITS as readonly unknown[]).includes(v)
}

/**
 * Convierte el texto que escribe el usuario ("1.250,50", "1250.5", "1,250.50")
 * a unidades menores enteras sin pasar por aritmética de coma flotante.
 * Devuelve null si el texto no es un importe válido.
 */
export function parseMoneyToMinor(text: string, currency: Currency): number | null {
  const decimals = meta(currency).decimals
  let s = text.trim().replace(/\s/g, '')
  if (!s || !/^[\d.,]+$/.test(s)) return null
  const lastSep = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'))
  let intPart = s
  let fracPart = ''
  if (lastSep !== -1) {
    const after = s.slice(lastSep + 1)
    // Un separador seguido de 1–2 dígitos es decimal; de 3 dígitos, es de miles.
    if (after.length > 0 && after.length <= decimals) {
      intPart = s.slice(0, lastSep)
      fracPart = after
    } else if (after.length !== 3) {
      return null
    }
  }
  intPart = intPart.replace(/[.,]/g, '')
  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(fracPart)) return null
  if (!intPart && !fracPart) return null
  s = (intPart || '0') + fracPart.padEnd(decimals, '0')
  const n = Number(s)
  return Number.isSafeInteger(n) ? n : null
}

/** Texto editable a partir de unidades menores (p. ej. 12550 → "125,50"). */
export function minorToInput(minor: number, currency: Currency) {
  const d = meta(currency).decimals
  const sign = minor < 0 ? '-' : ''
  const abs = String(Math.abs(minor)).padStart(d + 1, '0')
  return d ? `${sign}${abs.slice(0, -d)},${abs.slice(-d)}` : `${sign}${abs}`
}

export function formatMoney(minor: number, currency: Currency) {
  const { locale, decimals } = meta(currency)
  // División exacta solo para mostrar; el valor almacenado sigue siendo entero.
  const value = minor / 10 ** decimals
  try {
    const out = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      useGrouping: 'always',
    } as Intl.NumberFormatOptions).format(value)
    // Símbolo de uso común en Venezuela.
    return currency === 'VES' ? out.replace('Bs.S', 'Bs.') : out
  } catch {
    return `${currency} ${value.toFixed(decimals)}`
  }
}

/** Devuelve un mapa campo → mensaje de error. Vacío = válido. */
export function validateService(input: { name: string; description: string; priceMinor: number | null; unit: Unit }) {
  const errors: Partial<Record<'name' | 'description' | 'price' | 'unit', string>> = {}
  const name = input.name.trim()
  if (!name) errors.name = 'Escribe el nombre del servicio.'
  else if (name.length > LIMITS.serviceName) errors.name = `Máximo ${LIMITS.serviceName} caracteres.`
  if (input.description.trim().length > LIMITS.serviceDescription)
    errors.description = `Máximo ${LIMITS.serviceDescription} caracteres.`
  if (input.priceMinor === null || input.priceMinor < 0) errors.price = 'Ingresa un precio válido (ej. 250 o 250,50).'
  else if (input.priceMinor > LIMITS.maxPriceMinor) errors.price = 'El precio es demasiado alto.'
  if (!isUnit(input.unit)) errors.unit = 'Selecciona una unidad.'
  return errors
}
