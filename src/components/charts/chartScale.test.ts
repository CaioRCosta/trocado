import { describe, expect, it } from 'vitest'
import { formatAxisValue, niceTicks, scaleLinear } from './chartScale'

describe('niceTicks', () => {
  it('gera marcas redondas a partir do zero', () => {
    expect(niceTicks(0, 520000)).toEqual([0, 200000, 400000, 600000])
  })

  it('inclui valores negativos e o zero', () => {
    expect(niceTicks(-30000, 70000)).toEqual([-50000, -25000, 0, 25000, 50000, 75000])
  })

  it('cria uma faixa mínima quando tudo é zero', () => {
    expect(niceTicks(0, 0)).toEqual([0, 2500, 5000, 7500, 10000])
  })
})

describe('scaleLinear', () => {
  it('converte valores do domínio para a tela, inclusive invertida', () => {
    const y = scaleLinear(0, 100, 200, 0)

    expect(y(0)).toBe(200)
    expect(y(50)).toBe(100)
  })

  it('não divide por zero quando o domínio é um ponto só', () => {
    expect(scaleLinear(5, 5, 10, 90)(5)).toBe(10)
  })
})

describe('formatAxisValue', () => {
  it('usa o valor inteiro abaixo de R$ 10 mil', () => {
    expect(formatAxisValue(400000, 600000)).toBe('R$ 4.000')
  })

  it('usa formato compacto quando o eixo passa de R$ 10 mil', () => {
    expect(formatAxisValue(1500000, 2000000)).toBe('R$ 15 mil')
  })

  it('mantém o sinal de valores negativos', () => {
    expect(formatAxisValue(-50000, 100000)).toBe('-R$ 500')
  })
})
