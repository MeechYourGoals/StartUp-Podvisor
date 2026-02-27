import { test, expect } from '@playwright/test';

// Define standard App Store screenshot sizes
const DEVICES = [
  { name: 'iphone-6.5', width: 1242, height: 2688 }, // iPhone 11 Pro Max, XS Max
  { name: 'iphone-5.5', width: 1242, height: 2208 }, // iPhone 8 Plus, 7 Plus, 6s Plus
  { name: 'ipad-12.9', width: 2048, height: 2732 },  // iPad Pro 12.9-inch
];

// Helper to capture screenshots for all devices
async function captureScreenshots(page, name) {
  for (const device of DEVICES) {
    await page.setViewportSize({ width: device.width, height: device.height });
    // Wait for any resizing or layout shifts
    await page.waitForTimeout(500);
    await page.screenshot({ path: `screenshots/${device.name}-${name}.png` });
  }
}

test('generate app store screenshots', async ({ page }) => {
  // 1. Landing Page (Public)
  await page.goto('http://localhost:8080/');
  await page.waitForLoadState('networkidle');
  await captureScreenshots(page, '01-landing');

  // 2. Auth Page
  await page.goto('http://localhost:8080/auth');
  await page.waitForLoadState('networkidle');
  await captureScreenshots(page, '02-auth');

  // NOTE: To capture authenticated pages (Dashboard, Account), you would typically need to:
  // 1. Mock the authentication state, or
  // 2. Perform a login action in the test.
  // Since this is a specialized script for the developer to run locally or in CI with specific env vars,
  // we will outline the steps but comment them out or keep them simple for now to avoid breaking if credentials aren't set.

  /*
  // Example of logging in (uncomment and configure if running against a local instance with known creds)
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:8080/');

  // 3. Dashboard (Authenticated)
  await captureScreenshots(page, '03-dashboard');

  // 4. Episode Detail (Mock navigation or direct link)
  // await page.click('text=Episode Title');
  // await captureScreenshots(page, '04-detail');

  // 5. Account / Paywall
  await page.goto('http://localhost:8080/account');
  await captureScreenshots(page, '05-account');
  */
});
