import type { Transaction } from '../domain/transaction'

export const STORAGE_KEY = 'trocado:transactions'

function isTransaction(value: unknown): value is Transaction {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.description === 'string' &&
    typeof t.amountCents === 'number' &&
    (t.type === 'income' || t.type === 'expense') &&
    typeof t.category === 'string' &&
    typeof t.date === 'string'
  )
}

/**
 * Lê as transações salvas. Dados corrompidos ou de formato desconhecido
 * são descartados para que o app continue funcionando.
 */
export function loadTransactions(storage: Storage = localStorage): Transaction[] {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTransaction) : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions: readonly Transaction[], storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}
