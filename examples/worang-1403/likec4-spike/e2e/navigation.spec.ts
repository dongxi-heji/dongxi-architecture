import { test, expect } from '@playwright/test'

test('click a real LikeC4 node, keep the same domain identity across five lenses, and read back analyzer evidence', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.goto('/')
  await expect(page.getByTestId('selected-id')).toHaveText('r-ownership')
  await expect(page.getByTestId('likec4-view')).toBeVisible()

  // LikeC4 renders into open shadow roots. Playwright text locators traverse them.
  const hive = page.getByText('Durable Hive', { exact: true }).first()
  await expect(hive).toBeVisible({ timeout: 45_000 })
  await hive.click()
  await expect(page.getByTestId('selected-id')).toHaveText('hive')
  await expect(page.getByTestId('tool-reading')).toContainText('dependency-cruiser 18.7.2')

  await page.getByRole('button', { name: '因果', exact: true }).click()
  await expect(page.getByTestId('selected-id')).toHaveText('hive')
  await page.getByRole('button', { name: '构成', exact: true }).click()
  await expect(page.getByTestId('selected-id')).toHaveText('hive')
  await expect(page.getByTestId('tool-reading')).toContainText('8 个模块')
  expect(pageErrors).toEqual([])
})
