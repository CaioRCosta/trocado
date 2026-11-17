import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SummaryBand } from './SummaryBand'

describe('SummaryBand', () => {
  it('mostra saldo, entradas e saídas formatados', () => {
    render(
      <SummaryBand
        totals={{ incomeCents: 300000, expenseCents: 125050, balanceCents: 174950 }}
        periodLabel="novembro de 2026"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Saldo de novembro de 2026' })).toBeInTheDocument()
    expect(screen.getByTestId('balance')).toHaveTextContent('R$ 1.749,50')
    expect(screen.getByTestId('income-total')).toHaveTextContent('R$ 3.000,00')
    expect(screen.getByTestId('expense-total')).toHaveTextContent('R$ 1.250,50')
  })

  it('destaca o saldo negativo', () => {
    render(<SummaryBand totals={{ incomeCents: 0, expenseCents: 100, balanceCents: -100 }} periodLabel="todos os meses" />)

    expect(screen.getByTestId('balance')).toHaveClass('negative')
  })

  it('mostra indicadores extras junto com entradas e saídas', () => {
    render(
      <SummaryBand totals={{ incomeCents: 0, expenseCents: 0, balanceCents: 0 }} periodLabel="novembro de 2026">
        <div>
          <dt>Orçamento</dt>
          <dd>40%</dd>
        </div>
      </SummaryBand>,
    )

    expect(screen.getByText('Orçamento')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
  })
})
