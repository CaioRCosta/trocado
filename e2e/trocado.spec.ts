import { expect, test, type Page } from '@playwright/test'

interface NewTransaction {
  type: 'Despesa' | 'Receita'
  description: string
  amount: string
  category: string
  date?: string
  recurring?: boolean
}

async function addTransaction(page: Page, tx: NewTransaction) {
  await page.getByRole('button', { name: 'Nova transação' }).click()
  const form = page.getByRole('dialog')
  await form.getByText(tx.type, { exact: true }).click()
  await form.getByLabel('Descrição').fill(tx.description)
  await form.getByLabel('Valor (R$)').fill(tx.amount)
  if (tx.date) await form.getByLabel('Data').fill(tx.date)
  await form.getByLabel('Categoria').selectOption(tx.category)
  if (tx.recurring) await form.getByLabel(/Repetir todo mês/).check()
  await form.getByRole('button', { name: /^Adicionar/ }).click()
}

const transactionList = (page: Page) => page.getByRole('region', { name: 'Transações' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('registra uma receita e uma despesa e calcula o saldo', async ({ page }) => {
  await addTransaction(page, { type: 'Receita', description: 'Salário', amount: '4.500,00', category: 'Salário' })
  await addTransaction(page, { type: 'Despesa', description: 'Aluguel', amount: '1500', category: 'Moradia' })

  await expect(page.getByTestId('income-total')).toHaveText('R$ 4.500,00')
  await expect(page.getByTestId('expense-total')).toHaveText('R$ 1.500,00')
  await expect(page.getByTestId('balance')).toHaveText('R$ 3.000,00')
})

test('mostra os erros e não registra uma transação inválida', async ({ page }) => {
  await page.getByRole('button', { name: 'Nova transação' }).click()
  await page.getByLabel('Valor (R$)').fill('abc')
  await page.getByRole('button', { name: 'Adicionar despesa' }).click()

  await expect(page.getByText('Informe uma descrição.')).toBeVisible()
  await expect(page.getByText(/Informe um valor maior que zero/)).toBeVisible()
  await expect(transactionList(page).getByText(/Nenhuma transação ainda/)).toBeVisible()
})

test('exclui uma transação e atualiza o saldo', async ({ page }) => {
  await addTransaction(page, { type: 'Despesa', description: 'Cinema', amount: '64', category: 'Lazer' })
  await addTransaction(page, { type: 'Despesa', description: 'Pizza', amount: '80', category: 'Alimentação' })

  await page.getByRole('button', { name: 'Excluir Cinema' }).click()
  await page.getByRole('group', { name: 'Confirmar exclusão de Cinema' }).getByRole('button', { name: 'Sim, excluir' }).click()

  await expect(transactionList(page).getByText('Cinema')).toHaveCount(0)
  await expect(transactionList(page).getByText('Pizza')).toBeVisible()
  await expect(page.getByTestId('balance')).toHaveText('-R$ 80,00')
})

test('mantém as transações depois de recarregar a página', async ({ page }) => {
  await addTransaction(page, { type: 'Despesa', description: 'Farmácia', amount: '37,40', category: 'Saúde' })

  await page.reload()

  await expect(transactionList(page).getByText('Farmácia')).toBeVisible()
  await expect(page.getByTestId('balance')).toHaveText('-R$ 37,40')
})

test('filtra resumo e lista pelo mês escolhido', async ({ page }) => {
  await addTransaction(page, { type: 'Despesa', description: 'Show', amount: '200', category: 'Lazer', date: '2026-09-12' })
  await addTransaction(page, { type: 'Despesa', description: 'Uber', amount: '25', category: 'Transporte', date: '2026-10-03' })

  await page.getByLabel('Período').selectOption({ label: 'setembro de 2026' })

  await expect(transactionList(page).getByText('Show')).toBeVisible()
  await expect(transactionList(page).getByText('Uber')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Saldo de setembro de 2026' })).toBeVisible()
  await expect(page.getByTestId('balance')).toHaveText('-R$ 200,00')
})

test('mostra a participação de cada categoria nas despesas', async ({ page }) => {
  await addTransaction(page, { type: 'Despesa', description: 'Aluguel', amount: '750', category: 'Moradia' })
  await addTransaction(page, { type: 'Despesa', description: 'Mercado', amount: '250', category: 'Alimentação' })
  await page.getByLabel('Período').selectOption({ label: 'Todos os meses' })

  const breakdown = page.getByRole('region', { name: 'Para onde foi o dinheiro' })
  await expect(breakdown.getByRole('listitem').first()).toContainText('Moradia')
  await expect(breakdown.getByRole('listitem').first()).toContainText('(75%)')
  await expect(breakdown.getByRole('listitem').nth(1)).toContainText('(25%)')
})

test('edita uma transação e recalcula o saldo', async ({ page }) => {
  await addTransaction(page, { type: 'Despesa', description: 'Academia', amount: '99,90', category: 'Saúde' })

  await page.getByRole('button', { name: 'Editar Academia' }).click()
  await expect(page.getByRole('heading', { name: 'Editar transação' })).toBeVisible()
  await page.getByLabel('Descrição').fill('Academia anual')
  await page.getByLabel('Valor (R$)').fill('1.198,80')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  await expect(transactionList(page).getByText('Academia anual')).toBeVisible()
  await expect(page.getByTestId('balance')).toHaveText('-R$ 1.198,80')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('exporta as transações do período em CSV', async ({ page }) => {
  await addTransaction(page, { type: 'Receita', description: 'Freela', amount: '800', category: 'Freelance', date: '2026-10-15' })
  await page.getByLabel('Período').selectOption({ label: 'outubro de 2026' })

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar CSV' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe('trocado-2026-10.csv')
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(chunk as Buffer)
  const csv = Buffer.concat(chunks).toString('utf-8')
  expect(csv).toContain('Data;Descrição;Categoria;Tipo;Valor')
  expect(csv).toContain('15/10/2026;Freela;Freelance;Receita;800,00')
})

test('mostra o saldo do mês e o histórico nos gráficos', async ({ page }) => {
  await addTransaction(page, { type: 'Receita', description: 'Bolsa', amount: '1000', category: 'Outros' })

  const chart = page.getByRole('region', { name: /Saldo ao longo de/ })
  await chart.getByRole('img').focus()
  await expect(chart.getByRole('status')).toContainText('R$ 1.000,00')

  await page.getByRole('tab', { name: '6 meses' }).click()

  await expect(page.getByRole('heading', { name: 'Entradas e saídas dos últimos 6 meses' })).toBeVisible()
  await expect(page.getByRole('img', { name: /^Entrou em .*: R\$ 1\.000,00$/ })).toBeVisible()
})

test('define um limite de orçamento e avisa quando ele estoura', async ({ page }) => {
  await page.getByRole('button', { name: 'Definir limite de Lazer' }).click()
  await page.getByLabel('Limite mensal de Lazer (R$)').fill('100')
  await page.getByRole('button', { name: 'Salvar' }).click()

  await addTransaction(page, { type: 'Despesa', description: 'Show', amount: '130', category: 'Lazer' })

  const budget = page.getByRole('region', { name: 'Orçamento por categoria' })
  await expect(budget.getByRole('listitem').filter({ hasText: 'Lazer' })).toContainText('Estourou R$ 30,00')
  await expect(page.getByTestId('budget-total')).toHaveText('130% usado')

  await page.reload()
  await expect(budget.getByRole('listitem').filter({ hasText: 'Lazer' })).toContainText('de R$ 100,00')
})

/** Data no mês anterior ao atual, no dia informado (formato do campo de data). */
function dayInPreviousMonth(day: number): string {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

test('lança no mês atual uma conta fixa do mês anterior', async ({ page }) => {
  await addTransaction(page, {
    type: 'Despesa',
    description: 'Aluguel',
    amount: '1800',
    category: 'Moradia',
    date: dayInPreviousMonth(6),
    recurring: true,
  })

  const notice = page.getByRole('region', { name: /Contas fixas para lançar/ })
  await expect(notice).toContainText('Aluguel')
  await notice.getByRole('button', { name: /Lançar Aluguel/ }).click()

  await expect(notice).toBeHidden()
  await expect(transactionList(page).getByText('Aluguel')).toBeVisible()
  await expect(transactionList(page).getByText('mensal')).toBeVisible()
  await expect(page.getByTestId('balance')).toHaveText('-R$ 1.800,00')
})
