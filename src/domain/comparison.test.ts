import { describe, expect, it } from 'vitest'
import { categoryChanges, compareWithPreviousMonth, describeExpenseChange } from './comparison'
import type { Transaction } from './transaction'

let nextId = 0
function expense(date: string, amountCents: number, category = 'Outros'): Transaction {
  nextId += 1
  return { id: String(nextId), description: 'x', amountCents, type: 'expense', category, date }
}

describe('compareWithPreviousMonth', () => {
  it('calcula a diferença e a variação percentual das despesas', () => {
    const result = compareWithPreviousMonth([expense('2026-10-05', 20000), expense('2026-11-05', 15000)], '2026-11')

    expect(result).toEqual({
      previousMonth: '2026-10',
      currentExpenseCents: 15000,
      previousExpenseCents: 20000,
      expenseDiffCents: -5000,
      expenseChangePercent: -25,
    })
  })

  it('não calcula percentual quando o mês anterior não teve despesas', () => {
    expect(compareWithPreviousMonth([expense('2026-11-05', 15000)], '2026-11').expenseChangePercent).toBeNull()
  })

  it('ignora receitas na comparação', () => {
    const income: Transaction = { ...expense('2026-10-01', 900000), type: 'income' }

    expect(compareWithPreviousMonth([income], '2026-11').previousExpenseCents).toBe(0)
  })
})

describe('categoryChanges', () => {
  it('mostra quanto cada categoria variou, incluindo as que sumiram ou apareceram', () => {
    const changes = categoryChanges(
      [
        expense('2026-10-01', 10000, 'Lazer'),
        expense('2026-10-02', 5000, 'Saúde'),
        expense('2026-11-01', 13000, 'Lazer'),
        expense('2026-11-02', 2000, 'Transporte'),
      ],
      '2026-11',
    )

    expect(Object.fromEntries(changes)).toEqual({ Lazer: 3000, Saúde: -5000, Transporte: 2000 })
  })
})

describe('describeExpenseChange', () => {
  const base = {
    previousMonth: '2026-10',
    currentExpenseCents: 0,
    previousExpenseCents: 20000,
    expenseDiffCents: 0,
    expenseChangePercent: 0,
  }

  it('descreve gasto menor que no mês anterior', () => {
    expect(describeExpenseChange({ ...base, expenseDiffCents: -12000 })).toBe('R$ 120,00 a menos que em outubro')
  })

  it('descreve gasto maior que no mês anterior', () => {
    expect(describeExpenseChange({ ...base, expenseDiffCents: 4550 })).toBe('R$ 45,50 a mais que em outubro')
  })

  it('avisa quando os gastos foram iguais', () => {
    expect(describeExpenseChange(base)).toBe('Igual a outubro')
  })

  it('avisa quando não há como comparar', () => {
    expect(describeExpenseChange({ ...base, previousExpenseCents: 0 })).toBe('Sem gastos em outubro para comparar')
  })
})
