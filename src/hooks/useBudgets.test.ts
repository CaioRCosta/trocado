import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { loadBudgets, saveBudgets } from '../storage/budgetStorage'
import { useBudgets } from './useBudgets'

describe('useBudgets', () => {
  it('começa com os limites já salvos', () => {
    saveBudgets({ Moradia: 200000 })

    const { result } = renderHook(() => useBudgets())

    expect(result.current.budgets).toEqual({ Moradia: 200000 })
  })

  it('define e remove limites, persistindo cada mudança', () => {
    const { result } = renderHook(() => useBudgets())

    act(() => result.current.setCategoryBudget('Lazer', 30000))
    expect(loadBudgets()).toEqual({ Lazer: 30000 })

    act(() => result.current.setCategoryBudget('Lazer', null))
    expect(result.current.budgets).toEqual({})
    expect(loadBudgets()).toEqual({})
  })
})
