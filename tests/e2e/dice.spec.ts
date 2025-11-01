import { test, expect } from '@playwright/test'

test('dice button appears and can be clicked', async ({ page }) => {
  await page.goto('/')
  const dice = page.getByRole('button', { name: /random|next/i })
  await expect(dice).toBeVisible()
  await dice.click()
  await expect(dice).toBeVisible()
})

