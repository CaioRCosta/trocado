import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../domain/transaction'
import { BudgetPanel } from './BudgetPanel'

let nextId = 0
function expense(category: string, amountCents: number): Transaction {
  nextId += 1
  return { id: String(nextId), description: 'x', amountCents, type: 'expense', category, date: '2026-11-03' }
}

function lineOf(category: string) {
  return screen.getByText(category, { selector: '.category-name' }).closest('li') as HTMLElement
}

function setup(transactions: Transaction[], budgets = {}) {
  const onSetBudget = vi.fn()
  render(<BudgetPanel transactions={transactions} budgets={budgets} onSetBudget={onSetBudget} />)
  return { onSetBudget, user: userEvent.setup() }
}

describe('BudgetPanel', () => {
  it('lista todas as categorias de despesa, mesmo sem gasto', () => {
    setup([])

    expect(screen.getAllByRole('listitem')).toHaveLength(7)
  })

  it('mostra gasto, limite e barra de uso da categoria', () => {
    setup([expense('Lazer', 15000)], { Lazer: 50000 })

    const line = lineOf('Lazer')
    expect(line).toHaveTextContent('R$ 150,00 de R$ 500,00')
    expect(within(line).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30')
  })

  it('avisa quando a categoria está perto do limite', () => {
    setup([expense('Lazer', 45000)], { Lazer: 50000 })

    expect(lineOf('Lazer')).toHaveTextContent('Perto do limite')
  })

  it('avisa quando o limite foi atingido exatamente', () => {
    setup([expense('Lazer', 50000)], { Lazer: 50000 })

    expect(lineOf('Lazer')).toHaveTextContent('Limite atingido')
  })

  it('avisa quanto o limite estourou, com a barra cheia', () => {
    setup([expense('Lazer', 62000)], { Lazer: 50000 })

    const line = lineOf('Lazer')
    expect(line).toHaveTextContent('Estourou R$ 120,00')
    expect(within(line).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('define um limite novo', async () => {
    const { onSetBudget, user } = setup([expense('Saúde', 8990)])

    await user.click(screen.getByRole('button', { name: 'Definir limite de Saúde' }))
    await user.type(screen.getByLabelText('Limite mensal de Saúde (R$)'), '250')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSetBudget).toHaveBeenCalledWith('Saúde', 25000)
  })

  it('não aceita limite inválido', async () => {
    const { onSetBudget, user } = setup([])

    await user.click(screen.getByRole('button', { name: 'Definir limite de Lazer' }))
    await user.type(screen.getByLabelText('Limite mensal de Lazer (R$)'), '0')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSetBudget).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um valor maior que zero')
  })

  it('altera o limite partindo do valor atual', async () => {
    const { onSetBudget, user } = setup([], { Lazer: 50000 })

    await user.click(screen.getByRole('button', { name: 'Alterar limite de Lazer' }))
    const input = screen.getByLabelText('Limite mensal de Lazer (R$)')
    expect(input).toHaveValue('500,00')

    await user.clear(input)
    await user.type(input, '650')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSetBudget).toHaveBeenCalledWith('Lazer', 65000)
  })

  it('remove o limite', async () => {
    const { onSetBudget, user } = setup([], { Lazer: 50000 })

    await user.click(screen.getByRole('button', { name: 'Alterar limite de Lazer' }))
    await user.click(screen.getByRole('button', { name: 'Remover limite' }))

    expect(onSetBudget).toHaveBeenCalledWith('Lazer', null)
  })

  it('cancela a edição sem salvar', async () => {
    const { onSetBudget, user } = setup([])

    await user.click(screen.getByRole('button', { name: 'Definir limite de Lazer' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onSetBudget).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Limite mensal de Lazer (R$)')).not.toBeInTheDocument()
  })

  it('mostra a variação de cada categoria em relação ao mês anterior', () => {
    render(
      <BudgetPanel
        transactions={[expense('Lazer', 13000), expense('Saúde', 2000)]}
        budgets={{}}
        onSetBudget={vi.fn()}
        changes={new Map([['Lazer', 3000], ['Saúde', -5000], ['Moradia', 0]])}
        previousMonthName="outubro"
      />,
    )

    expect(lineOf('Lazer')).toHaveTextContent('↑ R$ 30,00 vs. outubro')
    expect(lineOf('Saúde')).toHaveTextContent('↓ R$ 50,00 vs. outubro')
    expect(lineOf('Moradia')).not.toHaveTextContent('vs.')
  })
})
