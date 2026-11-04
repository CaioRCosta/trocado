import type { Transaction } from './transaction'

export interface Totals {
  incomeCents: number
  expenseCents: number
  balanceCents: number
}

export interface CategoryTotal {
  category: string
  totalCents: number
  /** Participação no total de despesas, de 0 a 100. */
  percentage: number
}

/** Mês no formato `AAAA-MM`. */
export function monthOf(date: string): string {
  return date.slice(0, 7)
}

export function calculateTotals(transactions: readonly Transaction[]): Totals {
  let incomeCents = 0
  let expenseCents = 0
  for (const t of transactions) {
    if (t.type === 'income') incomeCents += t.amountCents
    else expenseCents += t.amountCents
  }
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents }
}

export function filterByMonth(transactions: readonly Transaction[], month: string | null): Transaction[] {
  if (month === null) return [...transactions]
  return transactions.filter((t) => monthOf(t.date) === month)
}

/** Meses com transações, do mais recente para o mais antigo, sem repetição. */
export function availableMonths(transactions: readonly Transaction[]): string[] {
  return [...new Set(transactions.map((t) => monthOf(t.date)))].sort().reverse()
}

/** Ordena da data mais recente para a mais antiga, mantendo a ordem de cadastro em empates. */
export function sortByDateDesc(transactions: readonly Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date))
}

/** Total de despesas por categoria, da maior para a menor. */
export function expensesByCategory(transactions: readonly Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type === 'expense') {
      totals.set(t.category, (totals.get(t.category) ?? 0) + t.amountCents)
    }
  }
  const grandTotal = [...totals.values()].reduce((sum, v) => sum + v, 0)
  return [...totals.entries()]
    .map(([category, totalCents]) => ({
      category,
      totalCents,
      percentage: Math.round((totalCents / grandTotal) * 100),
    }))
    .sort((a, b) => b.totalCents - a.totalCents)
}

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

/** Rótulo legível para um mês `AAAA-MM` (ex.: "novembro de 2026"). */
export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return `${MONTH_NAMES[monthNumber - 1]} de ${year}`
}
