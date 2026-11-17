import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BalanceChart } from './BalanceChart'

const points = [
  { day: 1, balanceCents: 0 },
  { day: 2, balanceCents: 500000 },
  { day: 3, balanceCents: 320000 },
]

describe('BalanceChart', () => {
  it('descreve o gráfico com o saldo final para leitores de tela', () => {
    render(<BalanceChart points={points} monthName="novembro" />)

    expect(screen.getByRole('img', { name: 'Saldo acumulado em novembro, terminando em R$ 3.200,00' })).toBeInTheDocument()
  })

  it('oferece os mesmos dados numa tabela', () => {
    render(<BalanceChart points={points} monthName="novembro" />)

    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows).toHaveLength(4)
    expect(rows[2]).toHaveTextContent('2R$ 5.000,00')
  })

  it('mostra o saldo do dia pelo teclado, começando pelo último dia', () => {
    render(<BalanceChart points={points} monthName="novembro" />)
    const chart = screen.getByRole('img')

    fireEvent.focus(chart)
    expect(screen.getByRole('status')).toHaveTextContent('R$ 3.200,00Dia 3 de novembro')

    fireEvent.keyDown(chart, { key: 'ArrowLeft' })
    expect(screen.getByRole('status')).toHaveTextContent('R$ 5.000,00Dia 2 de novembro')

    fireEvent.keyDown(chart, { key: 'ArrowRight' })
    fireEvent.keyDown(chart, { key: 'ArrowRight' })
    expect(screen.getByRole('status')).toHaveTextContent('Dia 3 de novembro')

    fireEvent.blur(chart)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('mostra o dia mais próximo do ponteiro', () => {
    render(<BalanceChart points={points} monthName="novembro" />)
    const chart = screen.getByRole('img')
    vi.spyOn(chart, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 640 } as DOMRect)

    fireEvent.pointerMove(chart, { clientX: 340 })
    expect(screen.getByRole('status')).toHaveTextContent('Dia 2 de novembro')

    fireEvent.pointerLeave(chart)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('avisa quando não há dias para mostrar', () => {
    render(<BalanceChart points={[]} monthName="dezembro" />)

    expect(screen.getByText('Ainda não há dias para mostrar neste mês.')).toBeInTheDocument()
  })
})
