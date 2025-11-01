import { test, expect } from '@playwright/test'

test('camera controls exist in settings', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Settings').scrollIntoViewIfNeeded()
  await expect(page.getByText('Camera Sync Controls')).toBeVisible()
  await expect(page.getByText('Local-only mode')).toBeVisible()
  await expect(page.getByText('Allow TURN relay')).toBeVisible()
})

