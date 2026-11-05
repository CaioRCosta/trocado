import { useState, type FormEvent } from 'react'
import {
  CATEGORIES,
  validateTransaction,
  type TransactionErrors,
  type TransactionInput,
  type TransactionType,
} from '../domain/transaction'
import type { NewTransaction } from '../hooks/useTransactions'

interface Props {
  onAdd: (transaction: NewTransaction) => void
  /** Data inicial do formulário no formato `AAAA-MM-DD`. */
  today: string
}

function emptyInput(type: TransactionType, today: string): TransactionInput {
  return { description: '', amount: '', type, category: CATEGORIES[type][0], date: today }
}

export function TransactionForm({ onAdd, today }: Props) {
  const [input, setInput] = useState<TransactionInput>(() => emptyInput('expense', today))
  const [errors, setErrors] = useState<TransactionErrors>({})

  function update<K extends keyof TransactionInput>(field: K, value: TransactionInput[K]) {
    setInput((current) => ({ ...current, [field]: value }))
  }

  function changeType(type: TransactionType) {
    setInput((current) => ({ ...current, type, category: CATEGORIES[type][0] }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = validateTransaction(input)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    onAdd(result.value)
    setErrors({})
    setInput({ ...emptyInput(input.type, today), date: input.date })
  }

  return (
    <form className="tx-form" onSubmit={handleSubmit} noValidate aria-label="Nova transação">
      <h2>Nova transação</h2>

      <fieldset className="type-toggle">
        <legend>Tipo</legend>
        <label className={input.type === 'expense' ? 'is-active expense' : ''}>
          <input
            type="radio"
            name="type"
            value="expense"
            checked={input.type === 'expense'}
            onChange={() => changeType('expense')}
          />
          Despesa
        </label>
        <label className={input.type === 'income' ? 'is-active income' : ''}>
          <input
            type="radio"
            name="type"
            value="income"
            checked={input.type === 'income'}
            onChange={() => changeType('income')}
          />
          Receita
        </label>
      </fieldset>

      <Field id="description" label="Descrição" error={errors.description}>
        <input
          id="description"
          value={input.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Ex.: Mercado da semana"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
      </Field>

      <div className="field-row">
        <Field id="amount" label="Valor (R$)" error={errors.amount}>
          <input
            id="amount"
            inputMode="decimal"
            value={input.amount}
            onChange={(e) => update('amount', e.target.value)}
            placeholder="0,00"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
          />
        </Field>

        <Field id="date" label="Data" error={errors.date}>
          <input
            id="date"
            type="date"
            value={input.date}
            onChange={(e) => update('date', e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
        </Field>
      </div>

      <Field id="category" label="Categoria" error={errors.category}>
        <select id="category" value={input.category} onChange={(e) => update('category', e.target.value)}>
          {CATEGORIES[input.type].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <button type="submit" className="primary">
        Adicionar {input.type === 'expense' ? 'despesa' : 'receita'}
      </button>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
