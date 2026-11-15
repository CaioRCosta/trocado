import { describe, expect, it } from 'vitest'
import { searchTransactions } from './search'
import type { Transaction } from './transaction'

function tx(id: string, description: string, category = 'Outros'): Transaction {
  return { id, description, amountCents: 1000, type: 'expense', category, date: '2026-11-01' }
}

const pharmacy = tx('1', 'Farmácia do bairro', 'Saúde')
const bus = tx('2', 'Ônibus', 'Transporte')
const market = tx('3', 'Mercado', 'Alimentação')
const all = [pharmacy, bus, market]

describe('searchTransactions', () => {
  it('encontra pelo trecho da descrição', () => {
    expect(searchTransactions(all, 'merc')).toEqual([market])
  })

  it('ignora maiúsculas e acentos', () => {
    expect(searchTransactions(all, 'FARMACIA')).toEqual([pharmacy])
    expect(searchTransactions(all, 'onibus')).toEqual([bus])
  })

  it('também procura na categoria', () => {
    expect(searchTransactions(all, 'saude')).toEqual([pharmacy])
  })

  it('retorna todas as transações quando a busca está vazia', () => {
    expect(searchTransactions(all, '   ')).toEqual(all)
  })

  it('retorna lista vazia quando nada corresponde', () => {
    expect(searchTransactions(all, 'viagem')).toEqual([])
  })
})
