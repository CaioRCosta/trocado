import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { DailyBalancePoint } from '../../domain/charts'
import { formatCents } from '../../domain/money'
import { formatAxisValue, niceTicks, scaleLinear } from './chartScale'
import { useChartWidth } from './useChartWidth'

interface Props {
  points: DailyBalancePoint[]
  /** Nome do mês por extenso, usado no tooltip e na tabela (ex.: "novembro"). */
  monthName: string
}

const HEIGHT = 220
const MARGIN = { top: 16, right: 24, bottom: 28, left: 64 }

/** Saldo acumulado ao longo do mês: uma linha com crosshair, tooltip e tabela. */
export function BalanceChart({ points, monthName }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [plotRef, width] = useChartWidth()

  if (points.length === 0) {
    return <p className="muted">Ainda não há dias para mostrar neste mês.</p>
  }

  const values = points.map((p) => p.balanceCents)
  const ticks = niceTicks(Math.min(...values), Math.max(...values))
  const largestAbs = Math.max(...ticks.map(Math.abs))
  const lastDay = points[points.length - 1].day
  const x = scaleLinear(1, Math.max(lastDay, 2), MARGIN.left, width - MARGIN.right)
  const y = scaleLinear(ticks[0], ticks[ticks.length - 1], HEIGHT - MARGIN.bottom, MARGIN.top)

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.day)},${y(p.balanceCents)}`).join(' ')
  const area = `${line} L${x(lastDay)},${y(0)} L${x(1)},${y(0)} Z`
  const dayTicks = (width < 420 ? [1, 15, 29] : [1, 8, 15, 22, 29]).filter((d) => d <= lastDay)
  const last = points[points.length - 1]
  const active = activeIndex === null ? null : points[activeIndex]

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0) return
    const svgX = ((event.clientX - rect.left) / rect.width) * width
    const day = Math.round(((svgX - MARGIN.left) / (width - MARGIN.left - MARGIN.right)) * (lastDay - 1) + 1)
    setActiveIndex(Math.min(Math.max(day, 1), lastDay) - 1)
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    const current = activeIndex ?? points.length - 1
    if (event.key === 'ArrowLeft') setActiveIndex(Math.max(current - 1, 0))
    else if (event.key === 'ArrowRight') setActiveIndex(Math.min(current + 1, points.length - 1))
    else return
    event.preventDefault()
  }

  return (
    <div className="chart">
      <div className="chart-plot" ref={plotRef}>
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`Saldo acumulado em ${monthName}, terminando em ${formatCents(last.balanceCents)}`}
          tabIndex={0}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActiveIndex(null)}
          onFocus={() => setActiveIndex(points.length - 1)}
          onBlur={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
        >
          {ticks.map((t) => (
            <g key={t} className="chart-grid">
              <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'baseline' : ''} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {formatAxisValue(t, largestAbs)}
              </text>
            </g>
          ))}
          {dayTicks.map((d) => (
            <text key={d} className="chart-axis" x={x(d)} y={HEIGHT - 8} textAnchor="middle">
              {d}
            </text>
          ))}
          <path d={area} className="balance-area" />
          <path d={line} className="balance-line" />
          <circle cx={x(last.day)} cy={y(last.balanceCents)} r={4} className="balance-dot" />
          {active && (
            <g className="chart-crosshair">
              <line x1={x(active.day)} x2={x(active.day)} y1={MARGIN.top} y2={HEIGHT - MARGIN.bottom} />
              <circle cx={x(active.day)} cy={y(active.balanceCents)} r={5} className="balance-dot" />
            </g>
          )}
        </svg>
        {active && (
          <div
            className="chart-tooltip"
            role="status"
            style={{ left: `${(x(active.day) / width) * 100}%`, top: `${(y(active.balanceCents) / HEIGHT) * 100}%` }}
          >
            <strong>{formatCents(active.balanceCents)}</strong>
            <span>
              Dia {active.day} de {monthName}
            </span>
          </div>
        )}
      </div>
      <details className="chart-table">
        <summary>Ver dados em tabela</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Dia</th>
              <th scope="col">Saldo acumulado</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.day}>
                <td>{p.day}</td>
                <td>{formatCents(p.balanceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
