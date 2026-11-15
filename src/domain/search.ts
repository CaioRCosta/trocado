import type { Transaction } from './transaction'

/** Remove acentos e diferenças de maiúsculas para comparar textos. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Filtra transações cuja descrição ou categoria contém o texto buscado,
 * sem diferenciar maiúsculas nem acentos. Busca vazia retorna tudo.
 */
export function searchTransactions(transactions: readonly Transaction[], query: string): Transaction[] {
  const term = normalize(query)
  if (term === '') return [...transactions]
  return transactions.filter(
    (t) => normalize(t.description).includes(term) || normalize(t.category).includes(term),
  )
}
