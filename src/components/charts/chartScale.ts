/**
 * Escalas e rótulos de eixo para os gráficos. Valores sempre em centavos.
 */

/** Marcas "redondas" no eixo, sempre incluindo o zero e cobrindo `min` e `max`. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  const low = Math.min(0, min)
  let high = Math.max(0, max)
  if (high === low) high = low + 10000

  const raw = (high - low) / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) as number

  const ticks: number[] = []
  for (let value = Math.floor(low / step) * step; value <= Math.ceil(high / step) * step; value += step) {
    ticks.push(Math.round(value))
  }
  return ticks
}

/** Converte um valor do domínio `[d0, d1]` para a faixa `[r0, r1]` da tela. */
export function scaleLinear(d0: number, d1: number, r0: number, r1: number) {
  return (value: number) => (d0 === d1 ? r0 : r0 + ((value - d0) / (d1 - d0)) * (r1 - r0))
}

/**
 * Rótulo do eixo: valor inteiro abaixo de R$ 10 mil e compacto acima
 * (um estilo só por eixo, decidido pelo maior valor absoluto).
 */
export function formatAxisValue(cents: number, largestAbsCents: number): string {
  const reais = cents / 100
  const sign = reais < 0 ? '-' : ''
  const abs = Math.abs(reais)
  if (largestAbsCents >= 1_000_000) {
    return `${sign}R$ ${(abs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  }
  return `${sign}R$ ${abs.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}
