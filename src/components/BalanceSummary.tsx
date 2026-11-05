import { formatCents } from '../domain/money'
import type { Totals } from '../domain/summary'

interface Props {
  totals: Totals
  periodLabel: string
}

export function BalanceSummary({ totals, periodLabel }: Props) {
  const tone = totals.balanceCents < 0 ? 'negative' : 'positive'

  return (
    <section className="balance" aria-labelledby="balance-title">
      <h2 id="balance-title" className="balance-label">
        Saldo de {periodLabel}
      </h2>
      <p className={`balance-value ${tone}`} data-testid="balance">
        {formatCents(totals.balanceCents)}
      </p>
      <dl className="balance-split">
        <div>
          <dt>Entrou</dt>
          <dd className="income" data-testid="income-total">
            {formatCents(totals.incomeCents)}
          </dd>
        </div>
        <div>
          <dt>Saiu</dt>
          <dd className="expense" data-testid="expense-total">
            {formatCents(totals.expenseCents)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
