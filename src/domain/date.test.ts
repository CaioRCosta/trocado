import { describe, expect, it } from 'vitest'
import { toLocalIsoDate } from './date'

describe('toLocalIsoDate', () => {
  it('formata a data local com zeros à esquerda', () => {
    expect(toLocalIsoDate(new Date(2026, 0, 7))).toBe('2026-01-07')
  })
})
