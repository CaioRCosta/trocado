import { describe, expect, it } from 'vitest'
import { categoryColor } from './categoryColors'

describe('categoryColor', () => {
  it('dá a cada categoria conhecida a sua própria cor', () => {
    const categories = ['Moradia', 'Alimentação', 'Saúde', 'Lazer', 'Educação', 'Transporte']
    const colors = categories.map(categoryColor)

    expect(new Set(colors).size).toBe(categories.length)
    expect(categoryColor('Moradia')).toBe('var(--cat-moradia)')
  })

  it('usa a cor neutra para "Outros" e categorias desconhecidas', () => {
    expect(categoryColor('Outros')).toBe('var(--cat-outros)')
    expect(categoryColor('Pet')).toBe('var(--cat-outros)')
  })
})
