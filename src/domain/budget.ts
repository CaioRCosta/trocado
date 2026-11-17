import { expensesByCategory } from './summary'
import type { Transaction } from './transaction'

/** Limite mensal de gasto por categoria, em centavos. */
export type Budgets = Readonly<Record<string, number>>

export type BudgetStatus = 'none' | 'ok' | 'warning' | 'over'

export interface BudgetLine {
  category: string
  spentCents: number
  limitCents: number | null
  /** Percentual do limite já usado; `null` quando a categoria não tem limite. */
  percent: number | null
  status: BudgetStatus
}

export interface BudgetOverview {
  spentCents: number
  limitCents: number
  percent: number
}

/** A partir de quanto do limite a categoria é sinalizada como perto de estourar. */
export const WARNING_PERCENT = 80

function statusFor(spentCents: number, limitCents: number | null): BudgetStatus {
  if (limitCents === null) return 'none'
  if (spentCents > limitCents) return 'over'
  if (spentCents * 100 >= limitCents * WARNING_PERCENT) return 'warning'
  return 'ok'
}

/**
 * Situação de cada categoria de despesa no período: quanto foi gasto e quanto
 * do limite foi usado. Inclui categorias com limite mesmo sem gasto.
 */
export function budgetLines(transactions: readonly Transaction[], budgets: Budgets): BudgetLine[] {
  const spent = new Map(expensesByCategory(transactions).map((c) => [c.category, c.totalCents]))
  const categories = new Set([...spent.keys(), ...Object.keys(budgets)])

  return [...categories]
    .map((category) => {
      const spentCents = spent.get(category) ?? 0
      const limitCents = budgets[category] ?? null
      const percent = limitCents === null ? null : Math.round((spentCents / limitCents) * 100)
      return { category, spentCents, limitCents, percent, status: statusFor(spentCents, limitCents) }
    })
    .sort((a, b) => b.spentCents - a.spentCents || a.category.localeCompare(b.category))
}

/** Soma das categorias com limite definido; `null` se nenhuma tiver limite. */
export function budgetOverview(lines: readonly BudgetLine[]): BudgetOverview | null {
  const limited = lines.filter((l) => l.limitCents !== null)
  if (limited.length === 0) return null
  const spentCents = limited.reduce((sum, l) => sum + l.spentCents, 0)
  const limitCents = limited.reduce((sum, l) => sum + (l.limitCents as number), 0)
  return { spentCents, limitCents, percent: Math.round((spentCents / limitCents) * 100) }
}

/** Define (ou remove, com `null`) o limite de uma categoria sem alterar o objeto original. */
export function setBudget(budgets: Budgets, category: string, limitCents: number | null): Budgets {
  const next = { ...budgets }
  if (limitCents === null) delete next[category]
  else next[category] = limitCents
  return next
}
