import { describe, expect, it } from 'vitest'
import {
  availableMonths,
  calculateTotals,
  expensesByCategory,
  filterByMonth,
  formatMonthLabel,
  sortByDateDesc,
} from './summary'
import type { Transaction } from './transaction'

let nextId = 0
function tx(overrides: Partial<Transaction>): Transaction {
  nextId += 1
  return {
    id: String(nextId),
    description: 'Transação',
    amountCents: 1000,
    type: 'expense',
    category: 'Outros',
    date: '2026-11-01',
    ...overrides,
  }
}

describe('calculateTotals', () => {
  it('retorna zero quando não há transações', () => {
    expect(calculateTotals([])).toEqual({ incomeCents: 0, expenseCents: 0, balanceCents: 0 })
  })

  it('soma receitas, despesas e calcula o saldo', () => {
    const totals = calculateTotals([
      tx({ type: 'income', amountCents: 500000 }),
      tx({ type: 'expense', amountCents: 120000 }),
      tx({ type: 'expense', amountCents: 30000 }),
    ])

    expect(totals).toEqual({ incomeCents: 500000, expenseCents: 150000, balanceCents: 350000 })
  })

  it('produz saldo negativo quando as despesas superam as receitas', () => {
    const totals = calculateTotals([tx({ type: 'income', amountCents: 100 }), tx({ type: 'expense', amountCents: 300 })])

    expect(totals.balanceCents).toBe(-200)
  })
})

describe('filterByMonth', () => {
  const october = tx({ date: '2026-10-31' })
  const november = tx({ date: '2026-11-01' })

  it('mantém apenas as transações do mês escolhido', () => {
    expect(filterByMonth([october, november], '2026-11')).toEqual([november])
  })

  it('retorna todas as transações quando nenhum mês é escolhido', () => {
    expect(filterByMonth([october, november], null)).toEqual([october, november])
  })
})

describe('availableMonths', () => {
  it('lista meses distintos do mais recente ao mais antigo', () => {
    const months = availableMonths([
      tx({ date: '2026-09-10' }),
      tx({ date: '2026-11-02' }),
      tx({ date: '2026-09-25' }),
    ])

    expect(months).toEqual(['2026-11', '2026-09'])
  })
})

describe('sortByDateDesc', () => {
  it('ordena da mais recente para a mais antiga sem alterar a lista original', () => {
    const older = tx({ date: '2026-01-01' })
    const newer = tx({ date: '2026-12-01' })
    const original = [older, newer]

    expect(sortByDateDesc(original)).toEqual([newer, older])
    expect(original).toEqual([older, newer])
  })
})

describe('expensesByCategory', () => {
  it('agrupa despesas por categoria da maior para a menor, com percentual', () => {
    const result = expensesByCategory([
      tx({ category: 'Lazer', amountCents: 2500 }),
      tx({ category: 'Moradia', amountCents: 6000 }),
      tx({ category: 'Lazer', amountCents: 1500 }),
    ])

    expect(result).toEqual([
      { category: 'Moradia', totalCents: 6000, percentage: 60 },
      { category: 'Lazer', totalCents: 4000, percentage: 40 },
    ])
  })

  it('ignora receitas', () => {
    expect(expensesByCategory([tx({ type: 'income', category: 'Salário' })])).toEqual([])
  })
})

describe('formatMonthLabel', () => {
  it('escreve o mês por extenso', () => {
    expect(formatMonthLabel('2026-03')).toBe('março de 2026')
  })
})
