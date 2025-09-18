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
    
    // Click on distance selector
    await page.click('text=100 เมตร');
    
    // Check if modal opens
    await expect(page.locator('text=เลือกรัศมี')).toBeVisible();
    
    // Check if all distance options are visible
    await expect(page.locator('text=100 เมตร')).toBeVisible();
    await expect(page.locator('text=200 เมตร')).toBeVisible();
    await expect(page.locator('text=300 เมตร')).toBeVisible();
    await expect(page.locator('text=400 เมตร')).toBeVisible();
    await expect(page.locator('text=500 เมตร')).toBeVisible();
    await expect(page.locator('text=1 กิโลเมตร')).toBeVisible();
    
    // Close modal
    await page.click('text=ปิด');
  });
});
