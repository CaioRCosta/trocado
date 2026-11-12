import { expect, test, type Page } from '@playwright/test'

interface NewTransaction {
  type: 'Despesa' | 'Receita'
  description: string
  amount: string
  category: string
  date?: string
}

async function addTransaction(page: Page, tx: NewTransaction) {
  await page.getByText(tx.type, { exact: true }).click()
  await page.getByLabel('Descrição').fill(tx.description)
  await page.getByLabel('Valor (R$)').fill(tx.amount)
  if (tx.date) await page.getByLabel('Data').fill(tx.date)
  await page.getByLabel('Categoria').selectOption(tx.category)
  await page.getByRole('button', { name: /^Adicionar/ }).click()
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
  await expect(page.getByRole('heading', { name: 'Nova transação' })).toBeVisible()
})
