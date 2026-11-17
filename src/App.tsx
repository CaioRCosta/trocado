import { useMemo, useState } from 'react'
import { BudgetPanel } from './components/BudgetPanel'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { ChartPanel } from './components/charts/ChartPanel'
import { ExportButton } from './components/ExportButton'
import { Modal } from './components/Modal'
import { MonthFilter } from './components/MonthFilter'
import { SearchField } from './components/SearchField'
import { SummaryBand } from './components/SummaryBand'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import {
  availableMonths,
  calculateTotals,
  expensesByCategory,
  filterByMonth,
  formatMonthLabel,
  monthOf,
  sortByDateDesc,
} from './domain/summary'
import { budgetLines, budgetOverview } from './domain/budget'
import { categoryChanges, compareWithPreviousMonth, describeExpenseChange } from './domain/comparison'
import { toLocalIsoDate } from './domain/date'
import { formatCents } from './domain/money'
import { previousMonth } from './domain/month'
import { searchTransactions } from './domain/search'
import { useBudgets } from './hooks/useBudgets'
import { useTransactions, type NewTransaction } from './hooks/useTransactions'

interface Props {
  now?: Date
}

export default function App({ now }: Props) {
  const { transactions, addTransaction, updateTransaction, removeTransaction } = useTransactions()
  const { budgets, setCategoryBudget } = useBudgets()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [today] = useState(() => toLocalIsoDate(now ?? new Date()))
  const currentMonth = monthOf(today)
  const [selectedMonth, setMonth] = useState<string | null>(currentMonth)

  // O mês atual sempre aparece na lista, mesmo antes da primeira transação.
  const months = useMemo(
    () => [...new Set([currentMonth, ...availableMonths(transactions)])].sort().reverse(),
    [transactions, currentMonth],
  )
  // Se o mês escolhido ficou sem transações (todas excluídas), volta para o mês atual.
  const month = selectedMonth === null || months.includes(selectedMonth) ? selectedMonth : currentMonth
  const visible = useMemo(() => sortByDateDesc(filterByMonth(transactions, month)), [transactions, month])
  const totals = useMemo(() => calculateTotals(visible), [visible])
  const categories = useMemo(() => expensesByCategory(visible), [visible])
  const listed = useMemo(() => searchTransactions(visible, query), [visible, query])
  const expenseNote = month ? describeExpenseChange(compareWithPreviousMonth(transactions, month)) : undefined
  const budget = month ? budgetOverview(budgetLines(visible, budgets)) : null
  const editing = transactions.find((t) => t.id === editingId)

  function openNewForm() {
    setEditingId(null)
    setFormOpen(true)
  }

  function openEditForm(id: string) {
    setEditingId(id)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
  }

  function handleSubmit(data: NewTransaction) {
    if (editing) updateTransaction(editing.id, data)
    else addTransaction(data)
    closeForm()
  }

  return (
    <div className="app">
      <header className="band">
        <div className="band-inner">
          <div className="topbar">
            <h1 className="brand">Trocado</h1>
            <MonthFilter months={months} selected={month} onChange={setMonth} />
            <button type="button" className="add-button" onClick={openNewForm}>
              Nova transação
            </button>
          </div>
          <SummaryBand
            totals={totals}
            periodLabel={month ? formatMonthLabel(month) : 'todos os meses'}
            expenseNote={expenseNote}
          >
            {budget && (
              <div>
                <dt>Orçamento</dt>
                <dd data-testid="budget-total">{budget.percent}% usado</dd>
                <dd className="summary-note">
                  {formatCents(budget.spentCents)} de {formatCents(budget.limitCents)}
                </dd>
              </div>
            )}
          </SummaryBand>
        </div>
      </header>

      {formOpen && (
        <Modal label={editing ? 'Editar transação' : 'Nova transação'} onClose={closeForm}>
          <TransactionForm onSubmit={handleSubmit} today={today} editing={editing} onCancel={closeForm} />
        </Modal>
      )}

      <main className="dashboard">
        <div className="dashboard-main">
          <ChartPanel transactions={transactions} month={month} today={today} />
          <TransactionList
            transactions={listed}
            onRemove={removeTransaction}
            onEdit={openEditForm}
            emptyMessage={query.trim() ? `Nenhuma transação encontrada para “${query.trim()}”.` : undefined}
          >
            <div className="tx-list-tools">
              <SearchField value={query} onChange={setQuery} />
              <ExportButton transactions={listed} fileName={`trocado-${month ?? 'todos-os-meses'}.csv`} />
            </div>
          </TransactionList>
        </div>
        <aside className="dashboard-side">
          {month ? (
            <BudgetPanel
              transactions={visible}
              budgets={budgets}
              onSetBudget={setCategoryBudget}
              changes={categoryChanges(transactions, month)}
              previousMonthName={formatMonthLabel(previousMonth(month)).split(' ')[0]}
            />
          ) : (
            <CategoryBreakdown categories={categories} />
          )}
        </aside>
      </main>
    </div>
  )
}
