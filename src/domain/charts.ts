import { daysInMonth, lastMonths } from './month'
import { calculateTotals, filterByMonth } from './summary'
import { signedAmount, type Transaction } from './transaction'

export interface DailyBalancePoint {
  day: number
  balanceCents: number
}

export interface MonthlyTotalsPoint {
  month: string
  incomeCents: number
  expenseCents: number
}

/**
 * Saldo acumulado do mês ao fim de cada dia. Com `untilDay`, a série
 * para nesse dia (útil para não desenhar dias que ainda não chegaram).
 */
export function dailyBalanceSeries(
  transactions: readonly Transaction[],
  month: string,
  untilDay: number = daysInMonth(month),
): DailyBalancePoint[] {
  const changeByDay = new Map<number, number>()
  for (const t of filterByMonth(transactions, month)) {
    const day = Number(t.date.slice(8, 10))
    changeByDay.set(day, (changeByDay.get(day) ?? 0) + signedAmount(t))
  }

  const lastDay = Math.min(untilDay, daysInMonth(month))
  let balance = 0
  return Array.from({ length: lastDay }, (_, i) => {
    balance += changeByDay.get(i + 1) ?? 0
    return { day: i + 1, balanceCents: balance }
  })
}

/** Entradas e saídas de cada um dos `count` meses que terminam em `lastMonth`. */
export function monthlyTotalsSeries(
  transactions: readonly Transaction[],
  lastMonth: string,
  count: number,
): MonthlyTotalsPoint[] {
  return lastMonths(lastMonth, count).map((month) => {
    const { incomeCents, expenseCents } = calculateTotals(filterByMonth(transactions, month))
    return { month, incomeCents, expenseCents }
  })
}
