import { test, expect } from '@playwright/test';

test('📸 Generate Marketing Screenshots', async ({ page }) => {
  // 1. Setup - 1920x1080 Viewport & Dark Mode
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ colorScheme: 'dark' });

  // 1. Landing Page (Public)
  await page.goto('/');
  // Force Tailwind Dark Mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  
  await page.waitForSelector('nav'); // Wait for header
  await page.mouse.wheel(0, 500); // Scroll down a bit for video effect
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, -500); // Scroll up
  await page.screenshot({ path: 'screenshots/00-landing-page.png', fullPage: true });

  // 2. Register Page (To ensure user exists)
  await page.goto('/register');
  await page.waitForSelector('form');
  await page.screenshot({ path: 'screenshots/0B-register-page.png', fullPage: true });

  const uniqueId = Date.now();
  await page.fill('input[id="name"]', 'Demo User');
  await page.fill('input[id="email"]', `demo${uniqueId}@tendercheck.ai`);
  await page.fill('input[id="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // 3. Auto-login or Redirect to Dashboard
  await expect(page).toHaveURL('/dashboard');
  await page.evaluate(() => document.documentElement.classList.add('dark')); // Ensure dark mode persists
  await page.waitForTimeout(1500); // Wait for animations to settle
  
  // Simulate user exploring dashboard
  await page.mouse.move(100, 100);
  await page.mouse.move(200, 200);
  
  // Take Dashboard Screenshot
  await page.screenshot({ path: 'screenshots/02-dashboard-empty.png', fullPage: true });

  // 4. Open "Subir Pliego" Modal (if button exists) or interact
  // Assuming there's a button, let's try to find a call to action
  const ctaButton = page.locator('button:has-text("Analizar"), button:has-text("Subir"), a[href="/upload"]');
  if (await ctaButton.count() > 0) {
      await ctaButton.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/03-dashboard-interaction.png' });
  }
  await expect(page).toHaveURL('/dashboard');
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
