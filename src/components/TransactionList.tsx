import { formatCents } from '../domain/money'
import { signedAmount, type Transaction } from '../domain/transaction'

interface Props {
  transactions: Transaction[]
  onRemove: (id: string) => void
}

function formatDay(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function TransactionList({ transactions, onRemove }: Props) {
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
              <button
                type="button"
                className="ghost"
                onClick={() => onRemove(t.id)}
                aria-label={`Excluir ${t.description}`}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
