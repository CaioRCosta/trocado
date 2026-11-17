import { describe, expect, it } from 'vitest'
import { BUDGETS_KEY, loadBudgets, saveBudgets } from './budgetStorage'

describe('budgetStorage', () => {
  it('retorna nenhum limite quando nada foi salvo', () => {
    expect(loadBudgets()).toEqual({})
  })

  it('recupera os limites salvos', () => {
    saveBudgets({ Lazer: 50000 })

    expect(loadBudgets()).toEqual({ Lazer: 50000 })
  })

  it('descarta valores inválidos e mantém os válidos', () => {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify({ Lazer: 50000, Saúde: -1, Moradia: 'muito', Outros: 10.5 }))

    expect(loadBudgets()).toEqual({ Lazer: 50000 })
  })

  it('ignora conteúdo corrompido ou que não seja um objeto', () => {
    localStorage.setItem(BUDGETS_KEY, '{quebrado')
    expect(loadBudgets()).toEqual({})

    localStorage.setItem(BUDGETS_KEY, '[1, 2]')
    expect(loadBudgets()).toEqual({})
  })
})
