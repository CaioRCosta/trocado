import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BalanceChart } from './BalanceChart'
import { MonthlyChart } from './MonthlyChart'

class FakeResizeObserver {
  static width = 360
  private callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe() {
    this.callback([{ contentRect: { width: FakeResizeObserver.width } } as ResizeObserverEntry], this as never)
  }
  disconnect() {}
}

describe('largura dos gráficos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('usa a largura padrão quando o navegador não informa o tamanho', () => {
    render(<BalanceChart points={[{ day: 1, balanceCents: 100 }]} monthName="novembro" />)

    expect(screen.getByRole('img').getAttribute('viewBox')).toBe('0 0 640 220')
  })

  it('desenha o gráfico na largura real do contêiner', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)

    render(<BalanceChart points={[{ day: 1, balanceCents: 100 }]} monthName="novembro" />)

    expect(screen.getByRole('img').getAttribute('viewBox')).toBe('0 0 360 220')
  })

  it('não desenha menor que a largura mínima', () => {
    FakeResizeObserver.width = 100
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)

    render(<MonthlyChart points={[{ month: '2026-11', incomeCents: 100, expenseCents: 50 }]} />)

    expect(screen.getByRole('group', { name: 'Entradas e saídas por mês' }).getAttribute('viewBox')).toBe('0 0 280 220')
  })
})
