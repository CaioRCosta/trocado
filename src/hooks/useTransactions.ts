import { useCallback, useEffect, useState } from 'react'
import type { Transaction } from '../domain/transaction'
import { loadTransactions, saveTransactions } from '../storage/transactionStorage'

export type NewTransaction = Omit<Transaction, 'id'>

const defaultIdGenerator = () => crypto.randomUUID()

/** Estado das transações do usuário, sincronizado com o localStorage. */
export function useTransactions(generateId: () => string = defaultIdGenerator) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions())

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  const addTransaction = useCallback(
    (data: NewTransaction) => {
      setTransactions((current) => [...current, { ...data, id: generateId() }])
    },
    [generateId],
  )

  const updateTransaction = useCallback((id: string, data: NewTransaction) => {
    setTransactions((current) => current.map((t) => (t.id === id ? { ...data, id } : t)))
  }, [])

  const removeTransaction = useCallback((id: string) => {
    setTransactions((current) => current.filter((t) => t.id !== id))
  }, [])

  return { transactions, addTransaction, updateTransaction, removeTransaction }
}
