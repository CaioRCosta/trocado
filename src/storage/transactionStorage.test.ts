import { describe, expect, it } from 'vitest'
import type { Transaction } from '../domain/transaction'
import { loadTransactions, saveTransactions, STORAGE_KEY } from './transactionStorage'

const salary: Transaction = {
  id: 'a1',
  description: 'Salário',
  amountCents: 450000,
  type: 'income',
  category: 'Salário',
  date: '2026-11-05',
}

describe('transactionStorage', () => {
  it('retorna lista vazia quando nada foi salvo', () => {
    expect(loadTransactions()).toEqual([])
  })

  it('recupera as transações que foram salvas', () => {
    saveTransactions([salary])

    expect(loadTransactions()).toEqual([salary])
  })

  it('retorna lista vazia quando o conteúdo salvo está corrompido', () => {
    localStorage.setItem(STORAGE_KEY, '{não é json')

    expect(loadTransactions()).toEqual([])
  })

  it('descarta itens com formato inválido e mantém os válidos', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([salary, { id: 2, description: null }]))

    expect(loadTransactions()).toEqual([salary])
  })

  it('retorna lista vazia quando o conteúdo salvo não é uma lista', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))

    expect(loadTransactions()).toEqual([])
  })
})
