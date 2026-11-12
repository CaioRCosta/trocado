import { useState } from 'react'
import { formatCents } from '../domain/money'
import { signedAmount, type Transaction } from '../domain/transaction'

interface Props {
  transactions: Transaction[]
  onRemove: (id: string) => void
  onEdit: (id: string) => void
}

function formatDay(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function TransactionList({ transactions, onRemove, onEdit }: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <section className="tx-list" aria-labelledby="list-title">
      <h2 id="list-title">Transações</h2>
      {transactions.length === 0 ? (
        <p className="muted">Nenhuma transação ainda. Use o formulário para registrar a primeira.</p>
      ) : (
        <ul>
          {transactions.map((t) => (
            <li key={t.id} className={t.type}>
              <div className="tx-main">
                <span className="tx-description">{t.description}</span>
                <span className="tx-meta">
                  {t.category}, {formatDay(t.date)}
                </span>
              </div>
              <span className="tx-amount num">{formatCents(signedAmount(t))}</span>
              {confirmingId === t.id ? (
                <div className="tx-confirm" role="group" aria-label={`Confirmar exclusão de ${t.description}`}>
                  <span>Excluir?</span>
                  <button type="button" className="danger" onClick={() => onRemove(t.id)}>
                    Sim, excluir
                  </button>
                  <button type="button" className="ghost" onClick={() => setConfirmingId(null)}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="tx-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => onEdit(t.id)}
                    aria-label={`Editar ${t.description}`}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setConfirmingId(t.id)}
                    aria-label={`Excluir ${t.description}`}
                  >
                    Excluir
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
