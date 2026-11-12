import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../domain/transaction'
import { TransactionList } from './TransactionList'

const rent: Transaction = {
  id: 'r1',
  description: 'Aluguel',
  amountCents: 180000,
  type: 'expense',
  category: 'Moradia',
  date: '2026-11-06',
}

describe('TransactionList', () => {
  it('convida a registrar a primeira transação quando a lista está vazia', () => {
    render(<TransactionList transactions={[]} onRemove={() => {}} onEdit={() => {}} />)

    expect(screen.getByText(/Nenhuma transação ainda/)).toBeInTheDocument()
  })

  it('mostra despesas com sinal negativo, categoria e data no formato brasileiro', () => {
    render(<TransactionList transactions={[rent]} onRemove={() => {}} onEdit={() => {}} />)

    expect(screen.getByText('Aluguel')).toBeInTheDocument()
    expect(screen.getByText('-R$ 1.800,00')).toBeInTheDocument()
    expect(screen.getByText('Moradia, 06/11/2026')).toBeInTheDocument()
  })

  it('exclui a transação depois que o usuário confirma', async () => {
    const onRemove = vi.fn()
    render(<TransactionList transactions={[rent]} onRemove={onRemove} onEdit={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Aluguel' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }))

    expect(onRemove).toHaveBeenCalledWith('r1')
  })

  it('não exclui nada quando o usuário cancela a confirmação', async () => {
    const onRemove = vi.fn()
    render(<TransactionList transactions={[rent]} onRemove={onRemove} onEdit={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Aluguel' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onRemove).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Excluir Aluguel' })).toBeInTheDocument()
  })

  it('não apaga na hora: o primeiro clique só pede confirmação', async () => {
    const onRemove = vi.fn()
    render(<TransactionList transactions={[rent]} onRemove={onRemove} onEdit={() => {}} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Aluguel' }))

    expect(onRemove).not.toHaveBeenCalled()
    expect(screen.getByRole('group', { name: 'Confirmar exclusão de Aluguel' })).toBeInTheDocument()
  })

  it('pede a edição da transação clicada', async () => {
    const onEdit = vi.fn()
    render(<TransactionList transactions={[rent]} onRemove={() => {}} onEdit={onEdit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Editar Aluguel' }))

    expect(onEdit).toHaveBeenCalledWith('r1')
  })
})
