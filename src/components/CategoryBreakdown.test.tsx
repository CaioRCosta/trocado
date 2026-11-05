import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CategoryBreakdown } from './CategoryBreakdown'

describe('CategoryBreakdown', () => {
  it('avisa quando não há despesas', () => {
    render(<CategoryBreakdown categories={[]} />)

    expect(screen.getByText('Sem despesas no período.')).toBeInTheDocument()
  })

  it('lista cada categoria com total e percentual', () => {
    render(<CategoryBreakdown categories={[{ category: 'Transporte', totalCents: 4500, percentage: 100 }]} />)

    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Transporte')
    expect(item).toHaveTextContent('R$ 45,00 (100%)')
  })
})
