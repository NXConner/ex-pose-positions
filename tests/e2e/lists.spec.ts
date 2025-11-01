import { test, expect } from '@playwright/test'

test('my lists shows chips for defaults', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('My Lists')).toBeVisible()
  await expect(page.getByText("Favorites")).toBeVisible()
  await expect(page.getByText("Let's Try")).toBeVisible()
  await expect(page.getByText("Done It")).toBeVisible()
})

