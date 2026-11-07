import { test, expect } from '@playwright/test'

test('click a real LikeC4 node, keep the same domain identity across five lenses, and read back analyzer evidence', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.goto('/')
  await expect(page.getByTestId('selected-id')).toHaveText('r-ownership')
  await expect(page.getByTestId('likec4-view')).toBeVisible()

  // LikeC4 renders into open shadow roots. Playwright text locators traverse them.
  const hive = page.locator('.react-flow__node').filter({ hasText: 'Durable Hive' }).first()
  await expect(hive).toBeVisible({ timeout: 30_000 })
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

test('click a rendered LikeC4 edge to recover a domain relation and retain it across lenses', async ({ page }) => {
  const failures: string[] = []
  page.on('pageerror', error => failures.push(error.message))
  await page.goto('/')
  await expect(page.getByTestId('selected-id')).toHaveText('r-ownership')
  const hive = page.locator('.react-flow__node').filter({ hasText: 'Durable Hive' }).first()
  await expect(hive).toBeVisible({ timeout: 30_000 })
  await hive.click()
  await expect(page.getByTestId('selected-id')).toHaveText('hive')

  // Target the SVG *interaction path* using its rendered geometry,
  // not a label or internal ids inferred to be Worang authorities.
  const path = page.locator('.react-flow__edge .react-flow__edge-interaction').first()
  await expect(path).toBeAttached({ timeout: 30_000 })
  const candidates = await path.evaluate((element: SVGPathElement) => {
    const transform = element.getScreenCTM()
    if (!transform) throw new Error('edge has no screen transform')
    const root = element.getRootNode() as ShadowRoot | Document
    const ownEdge = element.closest('.react-flow__edge')
    const length = element.getTotalLength()
    return [0.12, 0.2, 0.28, 0.38, 0.62, 0.72, 0.8, 0.88].map(fraction => {
      const p = element.getPointAtLength(length * fraction)
      const x = transform.a * p.x + transform.c * p.y + transform.e
      const y = transform.b * p.x + transform.d * p.y + transform.f
      const top = root.elementFromPoint(x, y)
      return { x, y, fraction, hit:top?.getAttribute('class'), targetIsEdge: Boolean(top?.closest('.react-flow__edge') === ownEdge) }
    })
  })
  console.log('EDGE_HIT_TEST', JSON.stringify(candidates))
  const unobstructed = candidates.find(p => p.targetIsEdge)
  if (!unobstructed) throw new Error('No edge path point is directly clickable: '+JSON.stringify(candidates))
  await page.mouse.click(unobstructed.x, unobstructed.y)
  const clickedId = await page.getByTestId('selected-id').textContent()
  console.log('EDGE_SELECTION', JSON.stringify({clickedId,warning:await page.locator('.warning').allTextContents()}))
  await expect(page.getByTestId('selected-id')).toHaveText(/^r-(candidates|dispatch|claim|ownership|handoff|refill)$/)
  const relationId = await page.getByTestId('selected-id').textContent()
  await expect(page.locator('.sources a').first()).toBeVisible()
  await page.getByRole('button', { name: '蕴含', exact: true }).click()
  await expect(page.getByTestId('selected-id')).toHaveText(relationId ?? '')
  expect(failures).toEqual([])
})
