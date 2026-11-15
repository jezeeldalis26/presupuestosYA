import { describe, expect, it } from 'vitest'
import { formatMoney, minorToInput, parseMoneyToMinor } from './model'

describe('parseMoneyToMinor', () => {
  it.each([
    ['250', 25000],
    ['250,5', 25050],
    ['250,50', 25050],
    ['250.50', 25050],
    ['1.250,50', 125050],
    ['1,250.50', 125050],
    ['1.250', 125000],
    ['0,10', 10],
    ['0.1', 10],
    [',99', 99],
    ['0', 0],
  ])('%s → %i', (txt, minor) => expect(parseMoneyToMinor(txt, 'BRL')).toBe(minor))

  it.each(['', 'abc', '-5', '1,2345', '12,3,4x', '1e5'])('rechaza %s', (txt) => expect(parseMoneyToMinor(txt, 'USD')).toBeNull())

  it('evita errores de coma flotante (0,1 + 0,2)', () => {
    expect(parseMoneyToMinor('0,1', 'USD')! + parseMoneyToMinor('0,2', 'USD')!).toBe(30)
  })
})

describe('formato', () => {
  it('ida y vuelta', () => expect(parseMoneyToMinor(minorToInput(125050, 'EUR'), 'EUR')).toBe(125050))
  it('formatea según la moneda', () => {
    expect(formatMoney(125050, 'BRL').replace(/\s/g, ' ')).toBe('R$ 1.250,50')
    expect(formatMoney(125050, 'USD')).toBe('$1,250.50')
    expect(formatMoney(125050, 'EUR').replace(/\s/g, ' ')).toBe('1.250,50 €')
    expect(formatMoney(125050, 'VES').replace(/\s/g, ' ')).toBe('Bs. 1.250,50')
  })
})
