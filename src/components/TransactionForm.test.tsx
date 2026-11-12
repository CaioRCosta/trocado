import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../domain/transaction'
import { TransactionForm } from './TransactionForm'

function setup() {
  const onSubmit = vi.fn()
  render(<TransactionForm onSubmit={onSubmit} today="2026-11-04" />)
  return { onSubmit, user: userEvent.setup() }
}

describe('TransactionForm', () => {
  it('envia uma despesa válida com o valor em centavos', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText('Descrição'), 'Almoço')
    await user.type(screen.getByLabelText('Valor (R$)'), '32,90')
    await user.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação')
    await user.click(screen.getByRole('button', { name: 'Adicionar despesa' }))

    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Almoço',
      amountCents: 3290,
      type: 'expense',
      category: 'Alimentação',
      date: '2026-11-04',
    })
  })

  it('mostra os erros e não envia quando os dados são inválidos', async () => {
    const { onSubmit, user } = setup()

    await user.click(screen.getByRole('button', { name: 'Adicionar despesa' }))

    expect(onSubmit).not.toHaveBeenCalled()
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

  describe('no modo de edição', () => {
    const salary: Transaction = {
      id: 's1',
      description: 'Salário',
      amountCents: 450000,
      type: 'income',
      category: 'Salário',
      date: '2026-11-05',
    }

    it('começa preenchido com os dados da transação', () => {
      render(<TransactionForm onSubmit={vi.fn()} today="2026-11-04" editing={salary} />)

      expect(screen.getByRole('heading', { name: 'Editar transação' })).toBeInTheDocument()
      expect(screen.getByLabelText('Descrição')).toHaveValue('Salário')
      expect(screen.getByLabelText('Valor (R$)')).toHaveValue('4500,00')
      expect(screen.getByLabelText('Receita')).toBeChecked()
      expect(screen.getByLabelText('Descrição')).toHaveFocus()
    })

    it('envia os dados alterados', async () => {
      const onSubmit = vi.fn()
      const user = userEvent.setup()
      render(<TransactionForm onSubmit={onSubmit} today="2026-11-04" editing={salary} />)

      await user.clear(screen.getByLabelText('Valor (R$)'))
      await user.type(screen.getByLabelText('Valor (R$)'), '4800')
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

      expect(onSubmit).toHaveBeenCalledWith({
        description: 'Salário',
        amountCents: 480000,
        type: 'income',
        category: 'Salário',
        date: '2026-11-05',
      })
    })

    it('avisa quando o usuário cancela a edição', async () => {
      const onCancelEdit = vi.fn()
      render(<TransactionForm onSubmit={vi.fn()} today="2026-11-04" editing={salary} onCancelEdit={onCancelEdit} />)

      await userEvent.click(screen.getByRole('button', { name: 'Cancelar edição' }))

      expect(onCancelEdit).toHaveBeenCalled()
    })
  })
})
