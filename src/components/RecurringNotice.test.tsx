import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../domain/transaction'
import { RecurringNotice } from './RecurringNotice'

const rent: Transaction = {
  id: 'r',
  description: 'Aluguel',
  amountCents: 180000,
  type: 'expense',
  category: 'Moradia',
  date: '2026-10-06',
  recurring: true,
}
const salary: Transaction = { ...rent, id: 's', description: 'Salário', type: 'income', category: 'Salário', date: '2026-10-05', amountCents: 520000 }

describe('RecurringNotice', () => {
  it('não aparece quando não há contas pendentes', () => {
    const { container } = render(<RecurringNotice pending={[]} monthName="novembro" onLaunch={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('lista as contas pendentes com valor e dia do mês', () => {
    render(<RecurringNotice pending={[rent]} monthName="novembro" onLaunch={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Contas fixas para lançar em novembro' })).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent('AluguelMoradia, todo dia 6-R$ 1.800,00')
  })

  it('lança uma conta pelo botão dela', async () => {
    const onLaunch = vi.fn()
    render(<RecurringNotice pending={[salary, rent]} monthName="novembro" onLaunch={onLaunch} />)

    await userEvent.click(screen.getByRole('button', { name: 'Lançar Aluguel em novembro' }))

    expect(onLaunch).toHaveBeenCalledWith([rent])
  })

  it('lança todas de uma vez quando há mais de uma', async () => {
    const onLaunch = vi.fn()
    render(<RecurringNotice pending={[salary, rent]} monthName="novembro" onLaunch={onLaunch} />)

    await userEvent.click(screen.getByRole('button', { name: 'Lançar todas (2)' }))

    expect(onLaunch).toHaveBeenCalledWith([salary, rent])
  })

  it('não oferece lançar todas quando há uma conta só', () => {
    render(<RecurringNotice pending={[rent]} monthName="novembro" onLaunch={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /Lançar todas/ })).not.toBeInTheDocument()
  })
})
