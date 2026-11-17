import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MonthFilter } from './MonthFilter'

const months = ['2026-11', '2026-10', '2026-09']

function setup(selected: string | null) {
  const onChange = vi.fn()
  render(<MonthFilter months={months} selected={selected} onChange={onChange} />)
  return { onChange, user: userEvent.setup() }
}

describe('MonthFilter', () => {
  it('vai para o mês anterior e para o próximo pelas setas', async () => {
    const { onChange, user } = setup('2026-10')

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }))
    expect(onChange).toHaveBeenLastCalledWith('2026-09')

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }))
    expect(onChange).toHaveBeenLastCalledWith('2026-11')
  })

  it('desabilita a seta quando não há mês naquela direção', () => {
    setup('2026-11')

    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeEnabled()
  })

  it('desabilita as setas quando todos os meses estão selecionados', () => {
    setup(null)

    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeDisabled()
  })

  it('permite escolher todos os meses na lista', async () => {
    const { onChange, user } = setup('2026-11')

    await user.selectOptions(screen.getByLabelText('Período'), 'Todos os meses')

    expect(onChange).toHaveBeenCalledWith(null)
  })
})
