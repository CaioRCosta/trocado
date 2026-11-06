import { useMemo, useState } from 'react'
import { BalanceSummary } from './components/BalanceSummary'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { MonthFilter } from './components/MonthFilter'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import {
  availableMonths,
  calculateTotals,
  expensesByCategory,
  filterByMonth,
  formatMonthLabel,
  sortByDateDesc,
} from './domain/summary'
import { toLocalIsoDate } from './domain/date'
import { useTransactions } from './hooks/useTransactions'

interface Props {
  now?: Date
}

export default function App({ now }: Props) {
  const { transactions, addTransaction, removeTransaction } = useTransactions()
  const [selectedMonth, setMonth] = useState<string | null>(null)
  const [today] = useState(() => toLocalIsoDate(now ?? new Date()))

  const months = useMemo(() => availableMonths(transactions), [transactions])
  // Se o mês escolhido ficou sem transações (todas excluídas), volta a mostrar tudo.
  const month = selectedMonth !== null && months.includes(selectedMonth) ? selectedMonth : null
  const visible = useMemo(() => sortByDateDesc(filterByMonth(transactions, month)), [transactions, month])
  const totals = useMemo(() => calculateTotals(visible), [visible])
  const categories = useMemo(() => expensesByCategory(visible), [visible])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trocado</h1>
        <p className="tagline">Anote o que entra e o que sai, e veja para onde vai cada real.</p>
      </header>

      <main className="layout">
        <aside className="form-column">
          <TransactionForm onAdd={addTransaction} today={today} />
        </aside>

        <div className="content-column">
          <MonthFilter months={months} selected={month} onChange={setMonth} />
          <BalanceSummary totals={totals} periodLabel={month ? formatMonthLabel(month) : 'todos os meses'} />
          <CategoryBreakdown categories={categories} />
          <TransactionList transactions={visible} onRemove={removeTransaction} />
        </div>
      </main>
    </div>
  )
}
