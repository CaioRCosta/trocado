import { parseAmountToCents } from './money'

export type TransactionType = 'income' | 'expense'

export const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  expense: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Outros'],
} as const satisfies Record<TransactionType, readonly string[]>

export interface Transaction {
  id: string
  description: string
  amountCents: number
  type: TransactionType
  category: string
  /** Data no formato ISO `AAAA-MM-DD`. */
  date: string
}

/** Dados do formulário, ainda como texto digitado pelo usuário. */
export interface TransactionInput {
  description: string
  amount: string
  type: TransactionType
  category: string
  date: string
}

export type TransactionErrors = Partial<Record<keyof TransactionInput, string>>

export type ValidationResult =
  | { ok: true; value: Omit<Transaction, 'id'> }
  | { ok: false; errors: TransactionErrors }

const MAX_DESCRIPTION_LENGTH = 60

function isValidIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const parsed = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
}

export function validateTransaction(input: TransactionInput): ValidationResult {
  const errors: TransactionErrors = {}
  const description = input.description.trim()
  const amountCents = parseAmountToCents(input.amount)

  if (description === '') {
    errors.description = 'Informe uma descrição.'
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `A descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`
  }

  if (amountCents === null || amountCents === 0) {
    errors.amount = 'Informe um valor maior que zero, por exemplo 12,50.'
  }

  if (!(CATEGORIES[input.type] as readonly string[]).includes(input.category)) {
    errors.category = 'Escolha uma categoria.'
  }

  if (!isValidIsoDate(input.date)) {
    errors.date = 'Informe uma data válida.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: {
      description,
      amountCents: amountCents as number,
      type: input.type,
      category: input.category,
      date: input.date,
    },
  }
}

/** Valor com sinal: positivo para receitas, negativo para despesas. */
export function signedAmount(transaction: Transaction): number {
  return transaction.type === 'income' ? transaction.amountCents : -transaction.amountCents
}
