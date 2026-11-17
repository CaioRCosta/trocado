import { useState } from 'react'
import { dailyBalanceSeries, monthlyTotalsSeries } from '../../domain/charts'
import { daysInMonth } from '../../domain/month'
import { formatMonthLabel, monthOf } from '../../domain/summary'
import type { Transaction } from '../../domain/transaction'
import { BalanceChart } from './BalanceChart'
import { MonthlyChart } from './MonthlyChart'

interface Props {
  transactions: readonly Transaction[]
  /** Mês exibido; `null` quando todos os meses estão selecionados. */
  month: string | null
  /** Data de hoje (`AAAA-MM-DD`), para não desenhar dias que ainda não chegaram. */
  today: string
}

type View = 'month' | 'history'

const HISTORY_MONTHS = 6

export function ChartPanel({ transactions, month, today }: Props) {
  const [chosenView, setView] = useState<View>('month')
  // Sem um mês escolhido, só faz sentido o histórico.
  const view: View = month === null ? 'history' : chosenView
  const lastMonth = month ?? monthOf(today)
  const monthName = formatMonthLabel(lastMonth).split(' ')[0]
  const title = view === 'month' ? `Saldo ao longo de ${monthName}` : `Entradas e saídas dos últimos ${HISTORY_MONTHS} meses`

  const tabs: { key: View; label: string }[] = [
    { key: 'month', label: 'Mês' },
    { key: 'history', label: `${HISTORY_MONTHS} meses` },
  ]

  return (
    <section className="panel chart-panel" aria-labelledby="chart-title">
      <div className="panel-head">
        <h2 id="chart-title">{title}</h2>
        {month !== null && (
          <div className="tabs" role="tablist" aria-label="Escolha o gráfico">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                id={`tab-${t.key}`}
                aria-selected={view === t.key}
                aria-controls="chart-view"
                onClick={() => setView(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div id="chart-view" role={month !== null ? 'tabpanel' : undefined} aria-labelledby={month !== null ? `tab-${view}` : undefined}>
        {view === 'month' ? (
          <BalanceChart
            points={dailyBalanceSeries(
              transactions,
              lastMonth,
              today.startsWith(lastMonth) ? Number(today.slice(8, 10)) : daysInMonth(lastMonth),
            )}
            monthName={monthName}
          />
        ) : (
          <MonthlyChart points={monthlyTotalsSeries(transactions, lastMonth, HISTORY_MONTHS)} />
        )}
      </div>
    </section>
  )
}
