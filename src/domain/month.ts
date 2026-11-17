/**
 * Operações com meses no formato `AAAA-MM`.
 */

function parse(month: string): { year: number; monthNumber: number } {
  const [year, monthNumber] = month.split('-').map(Number)
  return { year, monthNumber }
}

function format(year: number, monthNumber: number): string {
  return `${year}-${String(monthNumber).padStart(2, '0')}`
}

/** Soma (ou subtrai, com valor negativo) uma quantidade de meses. */
export function addMonths(month: string, amount: number): string {
  const { year, monthNumber } = parse(month)
  const index = year * 12 + (monthNumber - 1) + amount
  return format(Math.floor(index / 12), (index % 12) + 1)
}

export function previousMonth(month: string): string {
  return addMonths(month, -1)
}

/** Os `count` meses que terminam em `lastMonth`, do mais antigo ao mais recente. */
export function lastMonths(lastMonth: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(lastMonth, i - count + 1))
}

export function daysInMonth(month: string): number {
  const { year, monthNumber } = parse(month)
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
}

/**
 * Data no mesmo dia em outro mês, ajustada para o último dia quando
 * o mês de destino é mais curto (ex.: 31/01 → 28/02).
 */
export function sameDayInMonth(date: string, month: string): string {
  const day = Math.min(Number(date.slice(8, 10)), daysInMonth(month))
  return `${month}-${String(day).padStart(2, '0')}`
}

const SHORT_NAMES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Rótulo curto para gráficos (ex.: "2026-11" → "nov"). */
export function shortMonthLabel(month: string): string {
  return SHORT_NAMES[parse(month).monthNumber - 1]
}
