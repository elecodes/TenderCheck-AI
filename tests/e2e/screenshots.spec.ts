import { test, expect } from '@playwright/test';

test('📸 Generate Marketing Screenshots', async ({ page }) => {
  // 1. Setup - 1920x1080 Viewport
  await page.setViewportSize({ width: 1920, height: 1080 });

  // 2. Login Page
  await page.goto('/login');
  await page.waitForSelector('form');
  await page.screenshot({ path: 'screenshots/01-login-page.png', fullPage: true });

  // 3. Login Flow
  await page.fill('input[type="email"]', 'demo@tendercheck.ai'); // Assuming demo user
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // 4. Dashboard (Empty State)
  await expect(page).toHaveURL('/');
  await page.waitForTimeout(1000); // Wait for animations
  await page.screenshot({ path: 'screenshots/02-dashboard-empty.png', fullPage: true });

  // 5. Upload Modal (simulate open)
  // Assuming there is a button to upload
  /* 
  await page.click('text=Subir Pliego'); 
  await page.waitForSelector('.modal');
  await page.screenshot({ path: 'screenshots/03-upload-modal.png' });
  */
});
