import { useMemo, useState } from 'react'
import { BalanceSummary } from './components/BalanceSummary'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { MonthFilter } from './components/MonthFilter'
import { SearchField } from './components/SearchField'
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
import { searchTransactions } from './domain/search'
import { useTransactions, type NewTransaction } from './hooks/useTransactions'

interface Props {
  now?: Date
}

export default function App({ now }: Props) {
  const { transactions, addTransaction, updateTransaction, removeTransaction } = useTransactions()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedMonth, setMonth] = useState<string | null>(null)
  const [today] = useState(() => toLocalIsoDate(now ?? new Date()))

  const months = useMemo(() => availableMonths(transactions), [transactions])
  // Se o mês escolhido ficou sem transações (todas excluídas), volta a mostrar tudo.
  const month = selectedMonth !== null && months.includes(selectedMonth) ? selectedMonth : null
  const visible = useMemo(() => sortByDateDesc(filterByMonth(transactions, month)), [transactions, month])
  const totals = useMemo(() => calculateTotals(visible), [visible])
  const categories = useMemo(() => expensesByCategory(visible), [visible])
  const listed = useMemo(() => searchTransactions(visible, query), [visible, query])
  const editing = transactions.find((t) => t.id === editingId)

  function handleSubmit(data: NewTransaction) {
    if (editing) {
      updateTransaction(editing.id, data)
      setEditingId(null)
    } else {
      addTransaction(data)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Trocado</h1>
        <p className="tagline">Anote o que entra e o que sai, e veja para onde vai cada real.</p>
      </header>

      <main className="layout">
        <aside className="form-column">
          <TransactionForm
            key={editing?.id ?? 'nova'}
            onSubmit={handleSubmit}
            today={today}
            editing={editing}
            onCancelEdit={() => setEditingId(null)}
          />
        </aside>

        <div className="content-column">
          <MonthFilter months={months} selected={month} onChange={setMonth} />
          <BalanceSummary totals={totals} periodLabel={month ? formatMonthLabel(month) : 'todos os meses'} />
          <CategoryBreakdown categories={categories} />
          <TransactionList
            transactions={listed}
            onRemove={removeTransaction}
            onEdit={setEditingId}
            emptyMessage={query.trim() ? `Nenhuma transação encontrada para “${query.trim()}”.` : undefined}
          >
            <SearchField value={query} onChange={setQuery} />
          </TransactionList>
        </div>
      </main>
    </div>
  )
}
