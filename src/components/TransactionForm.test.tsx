import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransactionForm } from './TransactionForm'

function setup() {
  const onAdd = vi.fn()
  render(<TransactionForm onAdd={onAdd} today="2026-11-04" />)
  return { onAdd, user: userEvent.setup() }
}

describe('TransactionForm', () => {
  it('envia uma despesa válida com o valor em centavos', async () => {
    const { onAdd, user } = setup()

    await user.type(screen.getByLabelText('Descrição'), 'Almoço')
    await user.type(screen.getByLabelText('Valor (R$)'), '32,90')
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação')
    await user.click(screen.getByRole('button', { name: 'Adicionar despesa' }))

    expect(onAdd).toHaveBeenCalledWith({
      description: 'Almoço',
      amountCents: 3290,
      type: 'expense',
      category: 'Alimentação',
      date: '2026-11-04',
    })
  })

  it('mostra os erros e não envia quando os dados são inválidos', async () => {
    const { onAdd, user } = setup()

    await user.click(screen.getByRole('button', { name: 'Adicionar despesa' }))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByText('Informe uma descrição.')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor (R$)')).toHaveAttribute('aria-invalid', 'true')
  })

  it('troca as categorias disponíveis ao escolher receita', async () => {
    const { user } = setup()

    await user.click(screen.getByLabelText('Receita'))

    expect(screen.getByRole('option', { name: 'Salário' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Alimentação' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Adicionar receita' })).toBeInTheDocument()
  })

  it('limpa descrição e valor depois de adicionar', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText('Descrição'), 'Ônibus')
    await user.type(screen.getByLabelText('Valor (R$)'), '5')
    await user.click(screen.getByRole('button', { name: 'Adicionar despesa' }))

    expect(screen.getByLabelText('Descrição')).toHaveValue('')
    expect(screen.getByLabelText('Valor (R$)')).toHaveValue('')
  })
})
