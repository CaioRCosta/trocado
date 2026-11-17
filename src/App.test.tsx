import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { saveBudgets } from './storage/budgetStorage'
import { saveTransactions } from './storage/transactionStorage'

const now = new Date(2026, 10, 4)

describe('App', () => {
  it('atualiza o saldo ao adicionar uma receita', async () => {
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.click(screen.getByRole('button', { name: 'Nova transação' }))
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

  it('volta para o mês atual quando o mês filtrado fica vazio', async () => {
    saveTransactions([
      { id: '1', description: 'Cinema', amountCents: 5000, type: 'expense', category: 'Lazer', date: '2026-10-10' },
      { id: '2', description: 'Farmácia', amountCents: 2000, type: 'expense', category: 'Saúde', date: '2026-11-02' },
    ])
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.selectOptions(screen.getByLabelText('Período'), 'outubro de 2026')
    await user.click(screen.getByRole('button', { name: 'Excluir Cinema' }))
    await user.click(screen.getByRole('button', { name: 'Sim, excluir' }))

    expect(screen.getByLabelText('Período')).toHaveValue('2026-11')
    expect(screen.getByText('Farmácia')).toBeInTheDocument()
  })

  it('salva a edição e fecha a janela', async () => {
    saveTransactions([
      { id: '1', description: 'Cinema', amountCents: 5000, type: 'expense', category: 'Lazer', date: '2026-11-02' },
    ])
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.click(screen.getByRole('button', { name: 'Editar Cinema' }))
    await user.clear(screen.getByLabelText('Descrição'))
    await user.type(screen.getByLabelText('Descrição'), 'Teatro')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    const list = screen.getByRole('region', { name: 'Transações' })
    expect(within(list).getByText('Teatro')).toBeInTheDocument()
    expect(within(list).queryByText('Cinema')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('balance')).toHaveTextContent('-R$ 50,00')
  })

  it('filtra a lista pela busca sem alterar o saldo do período', async () => {
    saveTransactions([
      { id: '1', description: 'Cinema', amountCents: 5000, type: 'expense', category: 'Lazer', date: '2026-11-02' },
      { id: '2', description: 'Farmácia', amountCents: 2000, type: 'expense', category: 'Saúde', date: '2026-11-03' },
    ])
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.type(screen.getByLabelText('Buscar'), 'farmacia')

    const list = screen.getByRole('region', { name: 'Transações' })
    expect(within(list).getByText('Farmácia')).toBeInTheDocument()
    expect(within(list).queryByText('Cinema')).not.toBeInTheDocument()
    expect(screen.getByTestId('balance')).toHaveTextContent('-R$ 70,00')
  })

  it('avisa quando a busca não encontra nada', async () => {
    saveTransactions([
      { id: '1', description: 'Cinema', amountCents: 5000, type: 'expense', category: 'Lazer', date: '2026-11-02' },
    ])
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.type(screen.getByLabelText('Buscar'), 'viagem')

    expect(screen.getByText('Nenhuma transação encontrada para “viagem”.')).toBeInTheDocument()
  })

  it('fecha a janela de nova transação sem salvar ao cancelar', async () => {
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.click(screen.getByRole('button', { name: 'Nova transação' }))
    await user.type(screen.getByLabelText('Descrição'), 'Rascunho')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Rascunho')).not.toBeInTheDocument()
  })

  it('abre no mês atual mesmo quando há transações de outros meses', () => {
    saveTransactions([
      { id: '1', description: 'Cinema', amountCents: 5000, type: 'expense', category: 'Lazer', date: '2026-10-10' },
    ])
    render(<App now={now} />)

    expect(screen.getByRole('heading', { name: 'Saldo de novembro de 2026' })).toBeInTheDocument()
    expect(screen.queryByText('Cinema')).not.toBeInTheDocument()
  })

  it('compara os gastos do mês com os do mês anterior', () => {
    saveTransactions([
      { id: '1', description: 'Mercado', amountCents: 60000, type: 'expense', category: 'Alimentação', date: '2026-10-10' },
      { id: '2', description: 'Mercado', amountCents: 48000, type: 'expense', category: 'Alimentação', date: '2026-11-03' },
    ])
    render(<App now={now} />)

    expect(screen.getByTestId('expense-note')).toHaveTextContent('R$ 120,00 a menos que em outubro')
  })

  it('não compara quando todos os meses estão selecionados', async () => {
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.selectOptions(screen.getByLabelText('Período'), 'Todos os meses')

    expect(screen.queryByTestId('expense-note')).not.toBeInTheDocument()
  })

  it('guarda o limite definido no painel de orçamento', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App now={now} />)

    await user.click(screen.getByRole('button', { name: 'Definir limite de Lazer' }))
    await user.type(screen.getByLabelText('Limite mensal de Lazer (R$)'), '300')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    unmount()
    render(<App now={now} />)

    expect(screen.getByRole('button', { name: 'Alterar limite de Lazer' })).toBeInTheDocument()
  })

  it('mostra o resumo por categoria, sem limites, quando todos os meses estão selecionados', async () => {
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.selectOptions(screen.getByLabelText('Período'), 'Todos os meses')

    expect(screen.getByRole('heading', { name: 'Para onde foi o dinheiro' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Orçamento por categoria' })).not.toBeInTheDocument()
  })

  it('mostra quanto do orçamento total do mês já foi usado', () => {
    saveTransactions([
      { id: '1', description: 'Mercado', amountCents: 60000, type: 'expense', category: 'Alimentação', date: '2026-11-03' },
      { id: '2', description: 'Show', amountCents: 15000, type: 'expense', category: 'Lazer', date: '2026-11-04' },
    ])
    saveBudgets({ Alimentação: 80000, Lazer: 20000 })
    render(<App now={now} />)

    expect(screen.getByTestId('budget-total')).toHaveTextContent('75% usado')
    expect(screen.getByText('R$ 750,00 de R$ 1.000,00')).toBeInTheDocument()
  })

  it('não mostra o orçamento total quando não há limites', () => {
    render(<App now={now} />)

    expect(screen.queryByTestId('budget-total')).not.toBeInTheDocument()
  })

  it('lança as contas fixas do mês anterior no mês atual', async () => {
    saveTransactions([
      { id: '1', description: 'Aluguel', amountCents: 180000, type: 'expense', category: 'Moradia', date: '2026-10-06', recurring: true },
      { id: '2', description: 'Salário', amountCents: 520000, type: 'income', category: 'Salário', date: '2026-10-05', recurring: true },
    ])
    const user = userEvent.setup()
    render(<App now={now} />)

    await user.click(screen.getByRole('button', { name: 'Lançar todas (2)' }))

    expect(screen.queryByRole('heading', { name: /Contas fixas/ })).not.toBeInTheDocument()
    expect(screen.getByTestId('balance')).toHaveTextContent('R$ 3.400,00')
    const list = screen.getByRole('region', { name: 'Transações' })
    expect(within(list).getByText('06/11/2026', { exact: false })).toBeInTheDocument()
  })
})
