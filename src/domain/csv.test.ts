import { describe, expect, it } from 'vitest'
import { transactionsToCsv } from './csv'
import type { Transaction } from './transaction'

const salary: Transaction = {
  id: '1',
  description: 'Salário',
  amountCents: 450000,
  type: 'income',
  category: 'Salário',
  date: '2026-11-05',
}

const rent: Transaction = {
  id: '2',
  description: 'Aluguel',
  amountCents: 180050,
  type: 'expense',
  category: 'Moradia',
  date: '2026-11-06',
}

function lines(csv: string): string[] {
  return csv.split('\r\n')
}

describe('transactionsToCsv', () => {
  it('começa com o cabeçalho separado por ponto e vírgula', () => {
    expect(lines(transactionsToCsv([]))).toEqual(['Data;Descrição;Categoria;Tipo;Valor'])
  })

  it('gera uma linha por transação com data e valor no padrão brasileiro', () => {
    expect(lines(transactionsToCsv([salary])).at(1)).toBe('05/11/2026;Salário;Salário;Receita;4500,00')
  })

  it('exporta despesas com valor negativo', () => {
    expect(lines(transactionsToCsv([rent])).at(1)).toBe('06/11/2026;Aluguel;Moradia;Despesa;-1800,50')
  })

  it('coloca entre aspas descrições com ponto e vírgula ou aspas', () => {
    const tricky = { ...rent, description: 'Pizza; refri e "sobremesa"' }

    expect(lines(transactionsToCsv([tricky])).at(1)).toBe(
      '06/11/2026;"Pizza; refri e ""sobremesa""";Moradia;Despesa;-1800,50',
    )
  })
})
