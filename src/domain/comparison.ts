import { formatCents } from './money'
import { previousMonth } from './month'
import { calculateTotals, expensesByCategory, filterByMonth, formatMonthLabel } from './summary'
import type { Transaction } from './transaction'

export interface MonthComparison {
  previousMonth: string
  currentExpenseCents: number
  previousExpenseCents: number
  /** Diferença de despesas (atual menos anterior). Positivo = gastou mais. */
  expenseDiffCents: number
  /** Variação percentual arredondada; `null` quando o mês anterior não teve despesas. */
  expenseChangePercent: number | null
}

export function compareWithPreviousMonth(transactions: readonly Transaction[], month: string): MonthComparison {
  const previous = previousMonth(month)
  const currentExpenseCents = calculateTotals(filterByMonth(transactions, month)).expenseCents
  const previousExpenseCents = calculateTotals(filterByMonth(transactions, previous)).expenseCents
  const expenseDiffCents = currentExpenseCents - previousExpenseCents
  return {
    previousMonth: previous,
    currentExpenseCents,
    previousExpenseCents,
    expenseDiffCents,
    expenseChangePercent:
      previousExpenseCents === 0 ? null : Math.round((expenseDiffCents / previousExpenseCents) * 100),
  }
}

/** Diferença de gasto por categoria em relação ao mês anterior. */
export function categoryChanges(transactions: readonly Transaction[], month: string): Map<string, number> {
  const current = expensesByCategory(filterByMonth(transactions, month))
  const previous = expensesByCategory(filterByMonth(transactions, previousMonth(month)))
  const changes = new Map<string, number>()
  for (const c of previous) changes.set(c.category, -c.totalCents)
  for (const c of current) changes.set(c.category, (changes.get(c.category) ?? 0) + c.totalCents)
  return changes
}

/** Frase curta sobre a variação dos gastos, para exibir no painel. */
export function describeExpenseChange(comparison: MonthComparison): string {
  const monthName = formatMonthLabel(comparison.previousMonth).split(' ')[0]
  if (comparison.previousExpenseCents === 0) {
    return `Sem gastos em ${monthName} para comparar`
  }
  if (comparison.expenseDiffCents === 0) {
    return `Igual a ${monthName}`
  }
  const direction = comparison.expenseDiffCents > 0 ? 'a mais' : 'a menos'
  return `${formatCents(Math.abs(comparison.expenseDiffCents))} ${direction} que em ${monthName}`
}
