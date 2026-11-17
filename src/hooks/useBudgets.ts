import { useCallback, useEffect, useState } from 'react'
import { setBudget, type Budgets } from '../domain/budget'
import { loadBudgets, saveBudgets } from '../storage/budgetStorage'

/** Limites de orçamento por categoria, sincronizados com o localStorage. */
export function useBudgets() {
  const [budgets, setBudgets] = useState<Budgets>(() => loadBudgets())

  useEffect(() => {
    saveBudgets(budgets)
  }, [budgets])

  const setCategoryBudget = useCallback((category: string, limitCents: number | null) => {
    setBudgets((current) => setBudget(current, category, limitCents))
  }, [])

  return { budgets, setCategoryBudget }
}
