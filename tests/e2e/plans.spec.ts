import { test, expect } from '@playwright/test'

test('plans section shows and preset buttons work', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText("Tonight's Plans")).toBeVisible()
  const preset3 = page.getByRole('button', { name: /preset 3/i })
  const preset5 = page.getByRole('button', { name: /preset 5/i })
  await expect(preset3).toBeVisible()
  await expect(preset5).toBeVisible()
  await preset3.click()
})

