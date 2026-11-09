import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { saveTransactions } from './storage/transactionStorage'

const now = new Date(2026, 10, 4)

describe('App', () => {
  it('atualiza o saldo ao adicionar uma receita', async () => {
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.click(screen.getByLabelText('Receita'))
    await user.type(screen.getByLabelText('Descrição'), 'Salário')
    await user.type(screen.getByLabelText('Valor (R$)'), '3000')
    await user.click(screen.getByRole('button', { name: 'Adicionar receita' }))

    expect(screen.getByTestId('balance')).toHaveTextContent('R$ 3.000,00')
  })

  it('filtra o resumo e a lista pelo mês escolhido', async () => {
    saveTransactions([
      { id: '1', description: 'Cinema', amountCents: 5000, type: 'expense', category: 'Lazer', date: '2026-10-10' },
      { id: '2', description: 'Farmácia', amountCents: 2000, type: 'expense', category: 'Saúde', date: '2026-11-02' },
    ])
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.selectOptions(screen.getByLabelText('Período'), 'outubro de 2026')

    const list = screen.getByRole('region', { name: 'Transações' })
    expect(within(list).getByText('Cinema')).toBeInTheDocument()
    expect(within(list).queryByText('Farmácia')).not.toBeInTheDocument()
    expect(screen.getByTestId('balance')).toHaveTextContent('-R$ 50,00')
  })

  it('volta a mostrar todos os meses quando o mês filtrado fica vazio', async () => {
    saveTransactions([
      { id: '1', description: 'Cinema', amountCents: 5000, type: 'expense', category: 'Lazer', date: '2026-10-10' },
      { id: '2', description: 'Farmácia', amountCents: 2000, type: 'expense', category: 'Saúde', date: '2026-11-02' },
    ])
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.selectOptions(screen.getByLabelText('Período'), 'outubro de 2026')
    await user.click(screen.getByRole('button', { name: 'Excluir Cinema' }))
    await user.click(screen.getByRole('button', { name: 'Sim, excluir' }))

    expect(screen.getByLabelText('Período')).toHaveValue('all')
    expect(screen.getByText('Farmácia')).toBeInTheDocument()
  })
})
