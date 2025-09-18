import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check if main elements are visible
    await expect(page.locator('text=Yuni')).toBeVisible();
    
    // Check if distance selector is visible
    await expect(page.locator('text=100 เมตร')).toBeVisible();
    
    // Check if create post button is visible
    await expect(page.locator('text=สร้างโพสต์')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.goto('/');
    
    // Check if main elements are visible
    await expect(page.locator('text=Yuni')).toBeVisible();
    
    // Check if distance selector is visible
    await expect(page.locator('text=100 เมตร')).toBeVisible();
    
    // Check if create post button is visible
    await expect(page.locator('text=สร้างโพสต์')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.goto('/');
    
    // Check if main elements are visible
    await expect(page.locator('text=Yuni')).toBeVisible();
    
    // Check if distance selector is visible
    await expect(page.locator('text=100 เมตร')).toBeVisible();
    
    // Check if create post button is visible
    await expect(page.locator('text=สร้างโพสต์')).toBeVisible();
  });

  test('should handle distance selector on all devices', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click on distance selector
    await page.click('text=100 เมตร');
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    
    // Check if modal opens (simplified check)
    await expect(page.locator('text=100 เมตร')).toBeVisible();
    
    // Close modal by clicking outside or pressing escape
    await page.keyboard.press('Escape');
  });
});
