import { transactionsToCsv } from '../domain/csv'
import type { Transaction } from '../domain/transaction'
import { downloadTextFile } from '../download'

/** Marca de ordem de bytes para o Excel reconhecer acentos em UTF-8. */
const UTF8_BOM = '﻿'

interface Props {
  transactions: Transaction[]
  fileName: string
  download?: (fileName: string, content: string) => void
}

export function ExportButton({ transactions, fileName, download = downloadTextFile }: Props) {
  return (
    <button
      type="button"
      className="secondary"
      disabled={transactions.length === 0}
      onClick={() => download(fileName, UTF8_BOM + transactionsToCsv(transactions))}
    >
      Exportar CSV
    </button>
  )
}
