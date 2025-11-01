import { test, expect } from '@playwright/test'

test('app loads and shows title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Random Sex Position')).toBeVisible()
})

