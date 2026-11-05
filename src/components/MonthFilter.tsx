import { formatMonthLabel } from '../domain/summary'

interface Props {
  months: string[]
  selected: string | null
  onChange: (month: string | null) => void
}

const ALL = 'all'

export function MonthFilter({ months, selected, onChange }: Props) {
  return (
    <div className="month-filter">
      <label htmlFor="month">Período</label>
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
    </div>
  )
}
