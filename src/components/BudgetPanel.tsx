import { useState, type FormEvent } from 'react'
import { budgetLines, type BudgetLine, type Budgets } from '../domain/budget'
import { formatCents, formatCentsAsInput, parseAmountToCents } from '../domain/money'
import { CATEGORIES, type Transaction } from '../domain/transaction'
import { categoryColor } from './categoryColors'

interface Props {
  /** Transações do mês exibido. */
  transactions: readonly Transaction[]
  budgets: Budgets
  onSetBudget: (category: string, limitCents: number | null) => void
  /** Variação do gasto de cada categoria em relação ao mês anterior. */
  changes?: ReadonlyMap<string, number>
  /** Nome do mês anterior por extenso (ex.: "outubro"). */
  previousMonthName?: string
}

/** Todas as categorias de despesa, com as que tiveram gasto ou limite primeiro. */
function allLines(transactions: readonly Transaction[], budgets: Budgets): BudgetLine[] {
  const lines = budgetLines(transactions, budgets)
  const missing = CATEGORIES.expense
    .filter((category) => !lines.some((l) => l.category === category))
    .map((category) => ({ category, spentCents: 0, limitCents: null, percent: null, status: 'none' as const }))
  return [...lines, ...missing]
}

function statusText(line: BudgetLine): string | null {
  if (line.status === 'over') return `Estourou ${formatCents(line.spentCents - (line.limitCents as number))}`
  if (line.status === 'warning') return line.spentCents === line.limitCents ? 'Limite atingido' : 'Perto do limite'
  return null
}

function changeText(diffCents: number | undefined, monthName: string | undefined): string | null {
  if (!diffCents || !monthName) return null
  return `${diffCents > 0 ? '↑' : '↓'} ${formatCents(Math.abs(diffCents))} vs. ${monthName}`
}

export function BudgetPanel({ transactions, budgets, onSetBudget, changes, previousMonthName }: Props) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  return (
    <section className="panel budget" aria-labelledby="budget-title">
      <h2 id="budget-title">Orçamento por categoria</h2>
      <ul>
        {allLines(transactions, budgets).map((line) => (
          <li key={line.category} className={`budget-line status-${line.status}`}>
            <div className="budget-row">
              <span className="category-name">
                <span className="category-dot" style={{ background: categoryColor(line.category) }} aria-hidden="true" />
                {line.category}
              </span>
              <span className="num">
                {formatCents(line.spentCents)}
                {line.limitCents !== null && <small> de {formatCents(line.limitCents)}</small>}
              </span>
            </div>

            {line.limitCents !== null && (
              <div
                className="bar"
                role="progressbar"
                aria-label={`Uso do limite de ${line.category}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.min(line.percent as number, 100)}
              >
                <span
                  style={{ width: `${Math.min(line.percent as number, 100)}%`, background: categoryColor(line.category) }}
                />
              </div>
            )}

            {editingCategory === line.category ? (
              <LimitForm
                line={line}
                onSave={(limitCents) => {
                  onSetBudget(line.category, limitCents)
                  setEditingCategory(null)
                }}
                onCancel={() => setEditingCategory(null)}
              />
            ) : (
              <div className="budget-meta">
                {changeText(changes?.get(line.category), previousMonthName) && (
                  <span className="budget-change">{changeText(changes?.get(line.category), previousMonthName)}</span>
                )}
                {statusText(line) && (
                  <span className="budget-status">
                    <span aria-hidden="true">⚠ </span>
                    {statusText(line)}
                  </span>
                )}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setEditingCategory(line.category)}
                  aria-label={`${line.limitCents === null ? 'Definir' : 'Alterar'} limite de ${line.category}`}
                >
                  {line.limitCents === null ? 'Definir limite' : 'Alterar limite'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

interface LimitFormProps {
  line: BudgetLine
  onSave: (limitCents: number | null) => void
  onCancel: () => void
}

function LimitForm({ line, onSave, onCancel }: LimitFormProps) {
  const [value, setValue] = useState(line.limitCents === null ? '' : formatCentsAsInput(line.limitCents))
  const [error, setError] = useState<string | null>(null)
  const inputId = `limit-${line.category}`

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cents = parseAmountToCents(value)
    if (cents === null || cents === 0) {
      setError('Informe um valor maior que zero, por exemplo 500.')
      return
    }
    onSave(cents)
  }

  return (
    <form className="limit-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId}>Limite mensal de {line.category} (R$)</label>
      <div className="limit-form-row">
        <input
          id={inputId}
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error ? `${inputId}-error` : undefined}
          autoFocus
        />
        <button type="submit" className="secondary">
          Salvar
        </button>
      </div>
      {error && (
        <p className="field-error" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      )}
      <div className="limit-form-actions">
        {line.limitCents !== null && (
          <button type="button" className="link-button" onClick={() => onSave(null)}>
            Remover limite
          </button>
        )}
        <button type="button" className="link-button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
