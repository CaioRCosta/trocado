/**
 * Cor fixa de cada categoria de despesa, inspirada nas cédulas do real.
 * A cor acompanha a categoria (nunca a posição na lista) e sempre aparece
 * ao lado do nome, nunca sozinha.
 */
const COLOR_VARIABLES: Record<string, string> = {
  Moradia: '--cat-moradia',
  Alimentação: '--cat-alimentacao',
  Saúde: '--cat-saude',
  Lazer: '--cat-lazer',
  Educação: '--cat-educacao',
  Transporte: '--cat-transporte',
}

export function categoryColor(category: string): string {
  return `var(${COLOR_VARIABLES[category] ?? '--cat-outros'})`
}
