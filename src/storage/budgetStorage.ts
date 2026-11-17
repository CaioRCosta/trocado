import type { Budgets } from '../domain/budget'

export const BUDGETS_KEY = 'trocado:budgets'

/** Lê os limites salvos, descartando valores que não sejam inteiros positivos. */
export function loadBudgets(storage: Storage = localStorage): Budgets {
  const raw = storage.getItem(BUDGETS_KEY)
  if (raw === null) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => Number.isInteger(value) && (value as number) > 0),
    ) as Budgets
  } catch {
    return {}
  }
}

export function saveBudgets(budgets: Budgets, storage: Storage = localStorage): void {
  storage.setItem(BUDGETS_KEY, JSON.stringify(budgets))
}
