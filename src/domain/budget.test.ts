import { describe, expect, it } from 'vitest'
import { budgetLines, budgetOverview, setBudget } from './budget'
import type { Transaction } from './transaction'

let nextId = 0
function expense(category: string, amountCents: number): Transaction {
  nextId += 1
  return { id: String(nextId), description: 'x', amountCents, type: 'expense', category, date: '2026-11-01' }
}

describe('budgetLines', () => {
  it('calcula quanto do limite foi usado', () => {
    const [line] = budgetLines([expense('Lazer', 15000)], { Lazer: 50000 })

    expect(line).toEqual({ category: 'Lazer', spentCents: 15000, limitCents: 50000, percent: 30, status: 'ok' })
  })

  it('sinaliza quando a categoria passou de 80% do limite', () => {
    const [line] = budgetLines([expense('Lazer', 42000)], { Lazer: 50000 })

    expect(line.status).toBe('warning')
  })

  it('sinaliza quando o limite estourou', () => {
    const [line] = budgetLines([expense('Lazer', 50100)], { Lazer: 50000 })

    expect(line.status).toBe('over')
  })

  it('mostra categoria com gasto e sem limite', () => {
    const [line] = budgetLines([expense('Saúde', 3000)], {})

    expect(line).toMatchObject({ limitCents: null, percent: null, status: 'none' })
  })

  it('inclui categoria com limite mesmo sem gasto, depois das que tiveram gasto', () => {
    const lines = budgetLines([expense('Moradia', 180000)], { Educação: 30000 })

    expect(lines.map((l) => [l.category, l.spentCents])).toEqual([
      ['Moradia', 180000],
      ['Educação', 0],
    ])
  })
})

describe('budgetOverview', () => {
  it('soma apenas as categorias com limite', () => {
    const lines = budgetLines(
      [expense('Lazer', 30000), expense('Alimentação', 45000), expense('Saúde', 99999)],
      { Lazer: 50000, Alimentação: 50000 },
    )

    expect(budgetOverview(lines)).toEqual({ spentCents: 75000, limitCents: 100000, percent: 75 })
  })

  it('retorna null quando nenhuma categoria tem limite', () => {
    expect(budgetOverview(budgetLines([expense('Lazer', 100)], {}))).toBeNull()
  })
})

describe('setBudget', () => {
  it('define o limite sem alterar o objeto original', () => {
    const original = { Lazer: 100 }

    expect(setBudget(original, 'Saúde', 200)).toEqual({ Lazer: 100, Saúde: 200 })
    expect(original).toEqual({ Lazer: 100 })
  })

  it('remove o limite quando recebe null', () => {
    expect(setBudget({ Lazer: 100, Saúde: 200 }, 'Lazer', null)).toEqual({ Saúde: 200 })
  })
})
