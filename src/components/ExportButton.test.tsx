import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../domain/transaction'
import { ExportButton } from './ExportButton'

const bus: Transaction = {
  id: '1',
  description: 'Ônibus',
  amountCents: 520,
  type: 'expense',
  category: 'Transporte',
  date: '2026-11-03',
}

describe('ExportButton', () => {
  it('baixa o CSV das transações com o nome de arquivo informado', async () => {
    const download = vi.fn()
    render(<ExportButton transactions={[bus]} fileName="trocado-2026-11.csv" download={download} />)

    await userEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    const [fileName, content] = download.mock.calls[0]
    expect(fileName).toBe('trocado-2026-11.csv')
    expect(content).toContain('03/11/2026;Ônibus;Transporte;Despesa;-5,20')
  })

  it('fica desabilitado quando não há transações para exportar', () => {
    render(<ExportButton transactions={[]} fileName="vazio.csv" download={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled()
  })
})
