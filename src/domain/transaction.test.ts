import { describe, expect, it } from 'vitest'
import { signedAmount, validateTransaction, type Transaction, type TransactionInput } from './transaction'

const validInput: TransactionInput = {
  description: 'Mercado',
  amount: '150,90',
  type: 'expense',
  category: 'Alimentação',
  date: '2026-11-04',
}

describe('validateTransaction', () => {
  it('aceita uma transação válida e converte o valor em centavos', () => {
    const result = validateTransaction(validInput)

    expect(result).toEqual({
      ok: true,
      value: {
        description: 'Mercado',
        amountCents: 15090,
        type: 'expense',
        category: 'Alimentação',
        date: '2026-11-04',
      },
    })
  })

  it('remove espaços extras da descrição', () => {
    const result = validateTransaction({ ...validInput, description: '  Padaria  ' })

    expect(result.ok && result.value.description).toBe('Padaria')
  })

  it('exige uma descrição', () => {
    const result = validateTransaction({ ...validInput, description: '   ' })

    expect(result).toEqual({ ok: false, errors: { description: 'Informe uma descrição.' } })
  })

  it('rejeita descrição com mais de 60 caracteres', () => {
    const result = validateTransaction({ ...validInput, description: 'a'.repeat(61) })

    expect(result.ok).toBe(false)
    expect(!result.ok && result.errors.description).toMatch(/no máximo 60/)
  })

  it('rejeita valor zero', () => {
    const result = validateTransaction({ ...validInput, amount: '0' })

    expect(!result.ok && result.errors.amount).toBeTruthy()
  })

  it('rejeita valor em formato inválido', () => {
    const result = validateTransaction({ ...validInput, amount: '12.5.0' })

    expect(!result.ok && result.errors.amount).toBeTruthy()
  })

  it('rejeita categoria que não pertence ao tipo escolhido', () => {
    const result = validateTransaction({ ...validInput, type: 'income', category: 'Alimentação' })

    expect(!result.ok && result.errors.category).toBe('Escolha uma categoria.')
  })

  it('rejeita data inexistente', () => {
    const result = validateTransaction({ ...validInput, date: '2026-02-30' })

    expect(!result.ok && result.errors.date).toBe('Informe uma data válida.')
  })

  it('informa todos os erros de uma vez', () => {
    const result = validateTransaction({ description: '', amount: '', type: 'expense', category: '', date: '' })

    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(['amount', 'category', 'date', 'description'])
  })
})

describe('signedAmount', () => {
  const base: Transaction = { id: '1', description: 'x', amountCents: 500, type: 'income', category: 'Outros', date: '2026-11-01' }

  it('é positivo para receitas', () => {
    expect(signedAmount(base)).toBe(500)
  })

  it('é negativo para despesas', () => {
    expect(signedAmount({ ...base, type: 'expense' })).toBe(-500)
  })
})
