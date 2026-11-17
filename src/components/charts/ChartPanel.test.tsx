import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '../../domain/transaction'
import { ChartPanel } from './ChartPanel'

const salary: Transaction = {
  id: '1',
  description: 'Salário',
  amountCents: 520000,
  type: 'income',
  category: 'Salário',
  date: '2026-11-05',
}

describe('ChartPanel', () => {
  it('começa pelo saldo do mês, só até o dia de hoje', () => {
    render(<ChartPanel transactions={[salary]} month="2026-11" today="2026-11-16" />)

    expect(screen.getByRole('heading', { name: 'Saldo ao longo de novembro' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Mês' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('row')).toHaveLength(17)
  })

  it('mostra o mês inteiro quando ele já terminou', () => {
    render(<ChartPanel transactions={[salary]} month="2026-10" today="2026-11-16" />)

    expect(screen.getAllByRole('row')).toHaveLength(32)
  })

  it('troca para o histórico de 6 meses pela aba', async () => {
    render(<ChartPanel transactions={[salary]} month="2026-11" today="2026-11-16" />)

    await userEvent.click(screen.getByRole('tab', { name: '6 meses' }))

    expect(screen.getByRole('heading', { name: 'Entradas e saídas dos últimos 6 meses' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '6 meses' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('img', { name: 'Entrou em novembro de 2026: R$ 5.200,00' })).toBeInTheDocument()
  })

  it('mostra só o histórico, sem abas, quando todos os meses estão selecionados', () => {
    render(<ChartPanel transactions={[salary]} month={null} today="2026-11-16" />)

    expect(screen.getByRole('heading', { name: 'Entradas e saídas dos últimos 6 meses' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })
})
