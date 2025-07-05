import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Phone OTP Authentication Flow', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="login-button"]');
    
    // Select phone login
    await page.click('[data-testid="phone-login-tab"]');
    
    // Enter phone number
    await page.fill('[data-testid="phone-input"]', '1234567890');
    await page.click('[data-testid="send-otp-button"]');
    
    // Wait for OTP sent confirmation
    await expect(page.locator('[data-testid="otp-sent-message"]')).toBeVisible();
    
    // Enter OTP (using test code)
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp-button"]');
    
    // Verify successful login
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-phone"]')).toContainText('***7890');
  });

  test('Email OTP Authentication Flow', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="login-button"]');
    
    // Select email login
    await page.click('[data-testid="email-login-tab"]');
    
    // Enter email
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="send-email-link-button"]');
    
    // Wait for email sent confirmation
    await expect(page.locator('[data-testid="email-sent-message"]')).toBeVisible();
    
    // Enter OTP (using test code)
    await page.fill('[data-testid="email-otp-input"]', '123456');
    await page.click('[data-testid="verify-email-otp-button"]');
    
    // Verify successful login
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText('***@example.com');
  });

  test('Wallet Authentication Flow', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="login-button"]');
    
    // Select wallet login
    await page.click('[data-testid="wallet-login-tab"]');
    
    // Mock wallet connection
    await page.evaluate(() => {
      window.ethereum = {
        request: async () => ['0x1234567890123456789012345678901234567890'],
        on: () => {},
        removeListener: () => {}
      };
    });
    
    await page.click('[data-testid="connect-wallet-button"]');
    
    // Verify successful login
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="wallet-address"]')).toContainText('0x1234...7890');
  });

  test('Authentication Error Handling', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="login-button"]');
    
    // Test invalid phone number
    await page.click('[data-testid="phone-login-tab"]');
    await page.fill('[data-testid="phone-input"]', 'invalid');
    await page.click('[data-testid="send-otp-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid phone number');
    
    // Test invalid OTP
    await page.fill('[data-testid="phone-input"]', '1234567890');
    await page.click('[data-testid="send-otp-button"]');
    await page.fill('[data-testid="otp-input"]', '000000');
    await page.click('[data-testid="verify-otp-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid OTP');
  });

  test('Logout Flow', async ({ page }) => {
    // Login first
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="phone-login-tab"]');
    await page.fill('[data-testid="phone-input"]', '1234567890');
    await page.click('[data-testid="send-otp-button"]');
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp-button"]');
    
    // Verify logged in
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify logged out
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });
}); 