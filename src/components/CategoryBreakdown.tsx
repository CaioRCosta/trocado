import { formatCents } from '../domain/money'
import type { CategoryTotal } from '../domain/summary'
import { categoryColor } from './categoryColors'

interface Props {
  categories: CategoryTotal[]
}

export function CategoryBreakdown({ categories }: Props) {
  return (
    <section className="panel breakdown" aria-labelledby="breakdown-title">
      <h2 id="breakdown-title">Para onde foi o dinheiro</h2>
      {categories.length === 0 ? (
        <p className="muted">Sem despesas no período.</p>
      ) : (
        <ul>
          {categories.map((c) => (
            <li key={c.category}>
              <div className="breakdown-row">
                <span className="category-name">
                  <span className="category-dot" style={{ background: categoryColor(c.category) }} aria-hidden="true" />
                  {c.category}
                </span>
                <span className="num">
                  {formatCents(c.totalCents)} <small>({c.percentage}%)</small>
                </span>
              </div>
              <div className="bar" aria-hidden="true">
                <span style={{ width: `${c.percentage}%`, background: categoryColor(c.category) }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
