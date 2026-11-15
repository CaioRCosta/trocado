import { formatCentsAsInput } from './money'
import { signedAmount, type Transaction } from './transaction'

const SEPARATOR = ';'
const HEADER = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']

/** Coloca o campo entre aspas quando ele contém separador, aspas ou quebra de linha. */
function escapeField(value: string): string {
  if (/[";\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDateBr(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

function formatSignedAmount(cents: number): string {
  return `${cents < 0 ? '-' : ''}${formatCentsAsInput(Math.abs(cents))}`
}

/**
 * Gera um CSV no padrão brasileiro (separador `;` e vírgula decimal),
 * com despesas em valor negativo, pronto para abrir em planilhas.
 */
export function transactionsToCsv(transactions: readonly Transaction[]): string {
  const rows = transactions.map((t) => [
    formatDateBr(t.date),
    t.description,
    t.category,
    t.type === 'income' ? 'Receita' : 'Despesa',
    formatSignedAmount(signedAmount(t)),
  ])
  return [HEADER, ...rows].map((row) => row.map(escapeField).join(SEPARATOR)).join('\r\n')
}
