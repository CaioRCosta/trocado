import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { loadTransactions, saveTransactions } from '../storage/transactionStorage'
import { useTransactions, type NewTransaction } from './useTransactions'

const groceries: NewTransaction = {
  description: 'Mercado',
  amountCents: 8990,
  type: 'expense',
  category: 'Alimentação',
  date: '2026-11-03',
}

describe('useTransactions', () => {
  it('começa com as transações já salvas', () => {
    saveTransactions([{ ...groceries, id: 'salva' }])

    const { result } = renderHook(() => useTransactions())

    expect(result.current.transactions).toEqual([{ ...groceries, id: 'salva' }])
  })

  it('adiciona uma transação com identificador gerado e a persiste', () => {
    const { result } = renderHook(() => useTransactions(() => 'novo-id'))

    act(() => result.current.addTransaction(groceries))

    expect(result.current.transactions).toEqual([{ ...groceries, id: 'novo-id' }])
    expect(loadTransactions()).toEqual([{ ...groceries, id: 'novo-id' }])
  })

  it('remove apenas a transação indicada', () => {
    saveTransactions([
      { ...groceries, id: 'fica' },
      { ...groceries, id: 'sai' },
    ])
    const { result } = renderHook(() => useTransactions())

    act(() => result.current.removeTransaction('sai'))

    expect(result.current.transactions.map((t) => t.id)).toEqual(['fica'])
    expect(loadTransactions().map((t) => t.id)).toEqual(['fica'])
  })
})
