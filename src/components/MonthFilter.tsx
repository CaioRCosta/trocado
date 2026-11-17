import { formatMonthLabel } from '../domain/summary'

interface Props {
  /** Meses disponíveis, do mais recente para o mais antigo. */
  months: string[]
  selected: string | null
  onChange: (month: string | null) => void
}

const ALL = 'all'

export function MonthFilter({ months, selected, onChange }: Props) {
  const index = selected === null ? -1 : months.indexOf(selected)
  const older = index >= 0 ? months[index + 1] : undefined
  const newer = index > 0 ? months[index - 1] : undefined

  return (
    <div className="month-filter">
      <label htmlFor="month">Período</label>
      <button
        type="button"
        className="month-step"
        aria-label="Mês anterior"
        disabled={older === undefined}
        onClick={() => older && onChange(older)}
      >
        ‹
      </button>
      <select
        id="month"
        value={selected ?? ALL}
        onChange={(e) => onChange(e.target.value === ALL ? null : e.target.value)}
      >
        <option value={ALL}>Todos os meses</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthLabel(m)}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="month-step"
        aria-label="Próximo mês"
        disabled={newer === undefined}
        onClick={() => newer && onChange(newer)}
      >
        ›
      </button>
    </div>
  )
}
