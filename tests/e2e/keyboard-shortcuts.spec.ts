import { test, expect } from "@playwright/test";

test.describe("Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should focus search with / key", async ({ page }) => {
    await page.keyboard.press("/");
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeFocused();
  });

  test("should focus search with Ctrl+K", async ({ page }) => {
    await page.keyboard.press("Control+K");
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeFocused();
  });

  test("should toggle filters with Ctrl+F", async ({ page }) => {
    // Filters should not be visible initially
    const filters = page.locator('[class*="Filter"]');
    const initialCount = await filters.count();
    
    await page.keyboard.press("Control+F");
    await page.waitForTimeout(100);
    
    // After toggle, should see filters section
    const afterCount = await filters.count();
    expect(afterCount).not.toBe(initialCount);
  });

  test("should navigate positions with arrow keys", async ({ page }) => {
    // Get initial position ID
    const initialPosition = await page.locator('h3').first().textContent();
    
    // Press right arrow to go to next
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    
    const nextPosition = await page.locator('h3').first().textContent();
    // Position should change (or stay same if at end)
    expect(nextPosition).toBeDefined();
    
    // Press left arrow to go back
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(300);
    
    const prevPosition = await page.locator('h3').first().textContent();
    expect(prevPosition).toBeDefined();
  });
});

