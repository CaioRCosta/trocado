import { describe, expect, it } from 'vitest'
import { formatCents, parseAmountToCents } from './money'

describe('parseAmountToCents', () => {
  it('converte um valor inteiro em centavos', () => {
    expect(parseAmountToCents('10')).toBe(1000)
  })

  it('converte um valor com vírgula decimal', () => {
    expect(parseAmountToCents('12,50')).toBe(1250)
  })

  it('aceita separador de milhar', () => {
    expect(parseAmountToCents('1.234,56')).toBe(123456)
  })

  it('ignora espaços nas bordas', () => {
    expect(parseAmountToCents('  7,5 ')).toBe(750)
  })

  it('rejeita texto que não é número', () => {
    expect(parseAmountToCents('abc')).toBeNull()
  })

  it('rejeita valores negativos', () => {
    expect(parseAmountToCents('-5')).toBeNull()
  })

  it('rejeita mais de duas casas decimais', () => {
    expect(parseAmountToCents('1,999')).toBeNull()
  })
})

describe('formatCents', () => {
  it('formata centavos como reais', () => {
    expect(formatCents(1250)).toBe('R$ 12,50')
  })

  it('formata valores negativos', () => {
    expect(formatCents(-300)).toBe('-R$ 3,00')
  })
})
