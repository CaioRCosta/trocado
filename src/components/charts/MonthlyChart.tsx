import { useState } from 'react'
import type { MonthlyTotalsPoint } from '../../domain/charts'
import { formatCents } from '../../domain/money'
import { shortMonthLabel } from '../../domain/month'
import { formatMonthLabel } from '../../domain/summary'
import { formatAxisValue, niceTicks, scaleLinear } from './chartScale'
import { useChartWidth } from './useChartWidth'

interface Props {
  points: MonthlyTotalsPoint[]
}

type Series = 'income' | 'expense'

const SERIES: { key: Series; label: string; value: (p: MonthlyTotalsPoint) => number }[] = [
  { key: 'income', label: 'Entrou', value: (p) => p.incomeCents },
  { key: 'expense', label: 'Saiu', value: (p) => p.expenseCents },
]

const HEIGHT = 220
const MARGIN = { top: 16, right: 8, bottom: 28, left: 64 }
const MAX_BAR_WIDTH = 22
const GAP = 2
const RADIUS = 4

/** Coluna com o topo arredondado e a base reta, crescendo a partir da linha do zero. */
function columnPath(x: number, top: number, bottom: number, width: number): string {
  const r = Math.min(RADIUS, (bottom - top) / 2, width / 2)
  if (r <= 0) return ''
  return `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + width - r} Q${x + width},${top} ${x + width},${top + r} V${bottom} Z`
}

/** Entradas e saídas por mês em colunas agrupadas, com legenda, tooltip e tabela. */
export function MonthlyChart({ points }: Props) {
  const [active, setActive] = useState<{ index: number; series: Series } | null>(null)
  const [plotRef, width] = useChartWidth()

  const max = Math.max(...points.flatMap((p) => [p.incomeCents, p.expenseCents]))
  const ticks = niceTicks(0, max)
  const top = ticks[ticks.length - 1]
  const y = scaleLinear(0, top, HEIGHT - MARGIN.bottom, MARGIN.top)
  const slot = (width - MARGIN.left - MARGIN.right) / points.length
  // Nunca preenche o espaço todo: sobra ar entre os grupos de colunas.
  const barWidth = Math.min(MAX_BAR_WIDTH, (slot * 0.7 - GAP) / 2)
  const center = (i: number) => MARGIN.left + slot * i + slot / 2
  const barX = (i: number, series: Series) =>
    series === 'income' ? center(i) - barWidth - GAP / 2 : center(i) + GAP / 2

  const activePoint = active ? points[active.index] : null
  const activeSeries = active ? SERIES.find((s) => s.key === active.series) : undefined

  return (
    <div className="chart">
      <ul className="chart-legend">
        {SERIES.map((s) => (
          <li key={s.key}>
            <span className={`legend-swatch ${s.key}`} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="chart-plot" ref={plotRef}>
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="group"
          aria-label="Entradas e saídas por mês"
          onPointerLeave={() => setActive(null)}
        >
          <defs>
            <pattern id="hatch-expense" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" className="hatch-fill" />
              <line x1="0" y1="0" x2="0" y2="6" className="hatch-stripe" />
            </pattern>
          </defs>
          {ticks.map((t) => (
            <g key={t} className="chart-grid">
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'baseline' : ''} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {formatAxisValue(t, top)}
              </text>
            </g>
          ))}
          {points.map((p, i) => (
            <g key={p.month}>
              {SERIES.map((s) => {
                const isActive = active?.index === i && active.series === s.key
                return (
                  <g
                    key={s.key}
                    className={`monthly-bar ${s.key}${active && !isActive ? ' is-dimmed' : ''}`}
                    tabIndex={0}
                    role="img"
                    aria-label={`${s.label} em ${formatMonthLabel(p.month)}: ${formatCents(s.value(p))}`}
                    onPointerEnter={() => setActive({ index: i, series: s.key })}
                    onFocus={() => setActive({ index: i, series: s.key })}
                    onBlur={() => setActive(null)}
                  >
                    <rect
                      className="hit-area"
                      x={s.key === 'income' ? center(i) - slot / 2 : center(i)}
                      y={MARGIN.top}
                      width={slot / 2}
                      height={HEIGHT - MARGIN.top - MARGIN.bottom}
                    />
                    <path d={columnPath(barX(i, s.key), y(s.value(p)), y(0), barWidth)} />
                  </g>
                )
              })}
              <text className="chart-axis" x={center(i)} y={HEIGHT - 8} textAnchor="middle">
                {shortMonthLabel(p.month)}
              </text>
            </g>
          ))}
        </svg>
        {active && activePoint && activeSeries && (
          <div
            className="chart-tooltip"
            role="status"
            style={{
              left: `${((barX(active.index, active.series) + barWidth / 2) / width) * 100}%`,
              top: `${(y(activeSeries.value(activePoint)) / HEIGHT) * 100}%`,
            }}
          >
            <strong>{formatCents(activeSeries.value(activePoint))}</strong>
            <span>
              {activeSeries.label} em {formatMonthLabel(activePoint.month)}
            </span>
          </div>
        )}
      </div>
      <details className="chart-table">
        <summary>Ver dados em tabela</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Mês</th>
              <th scope="col">Entrou</th>
              <th scope="col">Saiu</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.month}>
                <td>{formatMonthLabel(p.month)}</td>
                <td>{formatCents(p.incomeCents)}</td>
                <td>{formatCents(p.expenseCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
