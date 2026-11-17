import { monthOf } from './summary'
import { sameDayInMonth } from './month'
import type { Transaction } from './transaction'

/** Identifica a "mesma" conta recorrente em meses diferentes. */
function recurringKey(t: Transaction): string {
  return [t.type, t.category, t.description.trim().toLowerCase()].join('|')
}

/**
 * Transações recorrentes de meses anteriores que ainda não foram lançadas
 * no mês informado. Para cada conta, usa a ocorrência mais recente.
 */
export function pendingRecurring(transactions: readonly Transaction[], month: string): Transaction[] {
  const launched = new Set(transactions.filter((t) => monthOf(t.date) === month).map(recurringKey))
  const latest = new Map<string, Transaction>()

  for (const t of transactions) {
    if (!t.recurring || monthOf(t.date) >= month) continue
    const key = recurringKey(t)
    const current = latest.get(key)
    if (!current || t.date > current.date) latest.set(key, t)
  }

  return [...latest.entries()]
    .filter(([key]) => !launched.has(key))
    .map(([, t]) => t)
    .sort((a, b) => a.date.slice(8).localeCompare(b.date.slice(8)))
}

/** Cópias das transações recorrentes no mês informado, no mesmo dia do mês. */
export function launchInMonth(sources: readonly Transaction[], month: string): Omit<Transaction, 'id'>[] {
  return sources.map((t) => ({
    description: t.description,
    amountCents: t.amountCents,
    type: t.type,
    category: t.category,
    date: sameDayInMonth(t.date, month),
    recurring: true,
  }))
}
