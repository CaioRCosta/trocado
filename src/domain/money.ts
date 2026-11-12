const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/**
 * Converte um valor digitado pelo usuário (ex.: "12,50", "1.234,56", "10")
 * em centavos. Retorna `null` quando o texto não representa um valor válido.
 */
export function parseAmountToCents(input: string): number | null {
  const text = input.trim()
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(text)) {
    return null
  }
  const [integerPart, decimalPart = ''] = text.replace(/\./g, '').split(',')
  return Number(integerPart) * 100 + Number(decimalPart.padEnd(2, '0'))
}

/** Formata centavos como moeda brasileira (ex.: 1250 → "R$ 12,50"). */
export function formatCents(cents: number): string {
  return brlFormatter.format(cents / 100).replace(/ /g, ' ')
}

/** Converte centavos no texto aceito pelo formulário (ex.: 123456 → "1234,56"). */
export function formatCentsAsInput(cents: number): string {
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')}`
}
