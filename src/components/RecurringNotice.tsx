import { formatCents } from '../domain/money'
import { signedAmount, type Transaction } from '../domain/transaction'

interface Props {
  /** Recorrentes de meses anteriores ainda não lançadas no mês exibido. */
  pending: Transaction[]
  /** Nome do mês exibido por extenso (ex.: "novembro"). */
  monthName: string
  onLaunch: (transactions: Transaction[]) => void
}

export function RecurringNotice({ pending, monthName, onLaunch }: Props) {
  if (pending.length === 0) return null

  return (
    <section className="panel recurring" aria-labelledby="recurring-title">
      <h2 id="recurring-title">Contas fixas para lançar em {monthName}</h2>
      <ul>
        {pending.map((t) => (
          <li key={t.id}>
            <div className="tx-main">
              <span className="tx-description">{t.description}</span>
              <span className="tx-meta">
                {t.category}, todo dia {Number(t.date.slice(8, 10))}
              </span>
            </div>
            <span className={`tx-amount num ${t.type}`}>{formatCents(signedAmount(t))}</span>
            <button
              type="button"
              className="secondary"
              onClick={() => onLaunch([t])}
              aria-label={`Lançar ${t.description} em ${monthName}`}
            >
              Lançar
            </button>
          </li>
        ))}
      </ul>
      {pending.length > 1 && (
        <button type="button" className="primary recurring-all" onClick={() => onLaunch(pending)}>
          Lançar todas ({pending.length})
        </button>
      )}
    </section>
  )
}
