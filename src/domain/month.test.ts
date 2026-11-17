import { describe, expect, it } from 'vitest'
import { addMonths, daysInMonth, lastMonths, previousMonth, sameDayInMonth, shortMonthLabel } from './month'

describe('addMonths', () => {
  it('avança meses dentro do mesmo ano', () => {
    expect(addMonths('2026-03', 2)).toBe('2026-05')
  })

  it('vira o ano quando necessário', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02')
  })
})

describe('previousMonth', () => {
  it('volta para dezembro do ano anterior a partir de janeiro', () => {
    expect(previousMonth('2027-01')).toBe('2026-12')
  })
})

describe('lastMonths', () => {
  it('lista os meses do mais antigo ao mais recente, terminando no mês informado', () => {
    expect(lastMonths('2027-02', 4)).toEqual(['2026-11', '2026-12', '2027-01', '2027-02'])
  })
})

describe('daysInMonth', () => {
  it('considera anos bissextos', () => {
    expect(daysInMonth('2028-02')).toBe(29)
    expect(daysInMonth('2026-02')).toBe(28)
  })
})

describe('sameDayInMonth', () => {
  it('mantém o dia ao mudar de mês', () => {
    expect(sameDayInMonth('2026-10-05', '2026-11')).toBe('2026-11-05')
  })

  it('usa o último dia quando o mês de destino é mais curto', () => {
    expect(sameDayInMonth('2026-01-31', '2026-02')).toBe('2026-02-28')
  })
})

describe('shortMonthLabel', () => {
  it('abrevia o nome do mês', () => {
    expect(shortMonthLabel('2026-09')).toBe('set')
  })
})
