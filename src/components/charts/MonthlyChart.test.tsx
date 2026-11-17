import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MonthlyChart } from './MonthlyChart'

const points = [
  { month: '2026-10', incomeCents: 670000, expenseCents: 296990 },
  { month: '2026-11', incomeCents: 520000, expenseCents: 0 },
]

describe('MonthlyChart', () => {
  it('tem legenda para entradas e saídas', () => {
    render(<MonthlyChart points={points} />)

    const legend = screen.getAllByRole('list')[0]
    expect(within(legend).getByText('Entrou')).toBeInTheDocument()
    expect(within(legend).getByText('Saiu')).toBeInTheDocument()
  })

  it('descreve cada coluna com série, mês e valor', () => {
    render(<MonthlyChart points={points} />)

    expect(screen.getByRole('img', { name: 'Saiu em outubro de 2026: R$ 2.969,90' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Entrou em novembro de 2026: R$ 5.200,00' })).toBeInTheDocument()
  })

  it('mostra o tooltip da coluna sob o ponteiro e esmaece as demais', () => {
    render(<MonthlyChart points={points} />)
    const bar = screen.getByRole('img', { name: /Saiu em outubro/ })

    fireEvent.pointerEnter(bar)

    expect(screen.getByRole('status')).toHaveTextContent('R$ 2.969,90Saiu em outubro de 2026')
    expect(screen.getByRole('img', { name: /Entrou em outubro/ })).toHaveClass('is-dimmed')

    fireEvent.pointerLeave(screen.getByRole('group', { name: 'Entradas e saídas por mês' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('mostra o mesmo tooltip ao navegar pelo teclado', () => {
    render(<MonthlyChart points={points} />)
    const bar = screen.getByRole('img', { name: /Entrou em novembro/ })

    fireEvent.focus(bar)
    expect(screen.getByRole('status')).toHaveTextContent('Entrou em novembro de 2026')

    fireEvent.blur(bar)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('oferece os mesmos dados numa tabela', () => {
    render(<MonthlyChart points={points} />)

    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows[1]).toHaveTextContent('outubro de 2026R$ 6.700,00R$ 2.969,90')
  })
})
