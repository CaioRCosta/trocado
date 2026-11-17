import { describe, expect, it } from 'vitest'
import { dailyBalanceSeries, monthlyTotalsSeries } from './charts'
import type { Transaction } from './transaction'

let nextId = 0
function tx(date: string, amountCents: number, type: Transaction['type'] = 'expense'): Transaction {
  nextId += 1
  return { id: String(nextId), description: 'x', amountCents, type, category: 'Outros', date }
}

describe('dailyBalanceSeries', () => {
  it('tem um ponto por dia do mês', () => {
    expect(dailyBalanceSeries([], '2026-02')).toHaveLength(28)
  })

  it('acumula o saldo dia a dia, somando receitas e subtraindo despesas', () => {
    const series = dailyBalanceSeries(
      [tx('2026-11-01', 100000, 'income'), tx('2026-11-03', 30000), tx('2026-11-03', 5000)],
      '2026-11',
    )

    expect(series.slice(0, 4)).toEqual([
      { day: 1, balanceCents: 100000 },
      { day: 2, balanceCents: 100000 },
      { day: 3, balanceCents: 65000 },
      { day: 4, balanceCents: 65000 },
    ])
  })

  it('ignora transações de outros meses', () => {
    const series = dailyBalanceSeries([tx('2026-10-31', 999)], '2026-11')

    expect(series.every((p) => p.balanceCents === 0)).toBe(true)
  })

  it('para no dia informado', () => {
    expect(dailyBalanceSeries([], '2026-11', 16)).toHaveLength(16)
  })
})

describe('monthlyTotalsSeries', () => {
  it('soma entradas e saídas de cada mês, incluindo meses sem movimento', () => {
    const series = monthlyTotalsSeries(
      [tx('2026-09-10', 500000, 'income'), tx('2026-09-12', 120000), tx('2026-11-02', 8000)],
      '2026-11',
      3,
    )

    expect(series).toEqual([
      { month: '2026-09', incomeCents: 500000, expenseCents: 120000 },
      { month: '2026-10', incomeCents: 0, expenseCents: 0 },
      { month: '2026-11', incomeCents: 0, expenseCents: 8000 },
    ])
  })
})
