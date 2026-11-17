import type { ReactNode } from 'react'
import { formatCents } from '../domain/money'
import type { Totals } from '../domain/summary'

interface Props {
  totals: Totals
  periodLabel: string
  /** Indicadores extras exibidos ao lado de entradas e saídas (grupos `<div><dt/><dd/></div>`). */
  children?: ReactNode
}

export function SummaryBand({ totals, periodLabel, children }: Props) {
  const tone = totals.balanceCents < 0 ? 'negative' : 'positive'

  return (
    <section className="summary" aria-labelledby="balance-title">
      <div className="summary-balance">
        <h2 id="balance-title" className="summary-label">
          Saldo de {periodLabel}
        </h2>
        <p className={`summary-value ${tone}`} data-testid="balance">
          {formatCents(totals.balanceCents)}
        </p>
      </div>
      <dl className="summary-stats">
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
        {children}
      </dl>
    </section>
  )
}
