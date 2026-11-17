import { describe, expect, it } from 'vitest'
import { launchInMonth, pendingRecurring } from './recurring'
import type { Transaction } from './transaction'

let nextId = 0
function tx(overrides: Partial<Transaction>): Transaction {
  nextId += 1
  return {
    id: String(nextId),
    description: 'Aluguel',
    amountCents: 180000,
    type: 'expense',
    category: 'Moradia',
    date: '2026-10-05',
    recurring: true,
    ...overrides,
  }
}

describe('pendingRecurring', () => {
  it('lista recorrentes do mês anterior ainda não lançadas', () => {
    const rent = tx({})

    expect(pendingRecurring([rent], '2026-11')).toEqual([rent])
  })

  it('não lista o que já foi lançado no mês, mesmo com maiúsculas diferentes', () => {
    const rent = tx({})
    const launched = tx({ date: '2026-11-05', description: 'ALUGUEL ' })

    expect(pendingRecurring([rent, launched], '2026-11')).toEqual([])
  })

  it('ignora transações que não são recorrentes', () => {
    expect(pendingRecurring([tx({ recurring: undefined })], '2026-11')).toEqual([])
  })

  it('usa a ocorrência mais recente de cada conta', () => {
    const september = tx({ date: '2026-09-05', amountCents: 170000 })
    const october = tx({ date: '2026-10-05', amountCents: 180000 })

    expect(pendingRecurring([october, september], '2026-11')).toEqual([october])
  })

  it('não considera meses posteriores ao mês visto', () => {
    expect(pendingRecurring([tx({ date: '2026-12-05' })], '2026-11')).toEqual([])
  })

  it('ordena pelo dia do mês', () => {
    const salary = tx({ description: 'Salário', type: 'income', category: 'Salário', date: '2026-10-01' })
    const rent = tx({ date: '2026-10-10' })

    expect(pendingRecurring([rent, salary], '2026-11')).toEqual([salary, rent])
  })
})

describe('launchInMonth', () => {
  it('copia a transação para o mesmo dia do mês informado, ainda recorrente', () => {
    expect(launchInMonth([tx({ date: '2026-01-31' })], '2026-02')).toEqual([
      {
        description: 'Aluguel',
        amountCents: 180000,
        type: 'expense',
        category: 'Moradia',
        date: '2026-02-28',
        recurring: true,
      },
    ])
  })
})
