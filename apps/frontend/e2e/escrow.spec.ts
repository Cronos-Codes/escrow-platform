import { test, expect } from '@playwright/test';

test.describe('Escrow Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as buyer
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="phone-login-tab"]');
    await page.fill('[data-testid="phone-input"]', '1234567890');
    await page.click('[data-testid="send-otp-button"]');
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp-button"]');
  });

  test('Create Escrow Deal', async ({ page }) => {
    // Navigate to create deal
    await page.click('[data-testid="create-deal-button"]');
    
    // Fill deal details
    await page.fill('[data-testid="deal-title"]', 'Test Property Sale');
    await page.fill('[data-testid="deal-description"]', 'Test property description');
    await page.fill('[data-testid="deal-amount"]', '100000');
    await page.selectOption('[data-testid="deal-currency"]', 'USDC');
    await page.fill('[data-testid="seller-address"]', '0x1234567890123456789012345678901234567890');
    
    // Submit deal
    await page.click('[data-testid="submit-deal-button"]');
    
    // Verify deal created
    await expect(page.locator('[data-testid="deal-created-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="deal-id"]')).toBeVisible();
  });

  test('Fund Escrow Deal', async ({ page }) => {
    // Create deal first
    await page.click('[data-testid="create-deal-button"]');
    await page.fill('[data-testid="deal-title"]', 'Test Deal');
    await page.fill('[data-testid="deal-amount"]', '1000');
    await page.fill('[data-testid="seller-address"]', '0x1234567890123456789012345678901234567890');
    await page.click('[data-testid="submit-deal-button"]');
    
    // Get deal ID
    const dealId = await page.locator('[data-testid="deal-id"]').textContent();
    
    // Navigate to fund
    await page.click('[data-testid="fund-deal-button"]');
    
    // Mock wallet transaction
    await page.evaluate(() => {
      window.ethereum = {
        request: async () => '0x1234567890123456789012345678901234567890',
        on: () => {},
        removeListener: () => {}
      };
    });
    
    await page.click('[data-testid="confirm-funding-button"]');
    
    // Verify funding successful
    await expect(page.locator('[data-testid="funding-success"]')).toBeVisible();
  });

  test('Approve and Release Funds', async ({ page }) => {
    // Setup: Create and fund deal
    await page.click('[data-testid="create-deal-button"]');
    await page.fill('[data-testid="deal-title"]', 'Test Deal');
    await page.fill('[data-testid="deal-amount"]', '1000');
    await page.fill('[data-testid="seller-address"]', '0x1234567890123456789012345678901234567890');
    await page.click('[data-testid="submit-deal-button"]');
    await page.click('[data-testid="fund-deal-button"]');
    await page.click('[data-testid="confirm-funding-button"]');
    
    // Switch to seller account
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Login as seller
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="phone-login-tab"]');
    await page.fill('[data-testid="phone-input"]', '0987654321');
    await page.click('[data-testid="send-otp-button"]');
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp-button"]');
    
    // Approve deal
    await page.click('[data-testid="approve-deal-button"]');
    await page.click('[data-testid="confirm-approval-button"]');
    
    // Verify approval
    await expect(page.locator('[data-testid="approval-success"]')).toBeVisible();
    
    // Release funds
    await page.click('[data-testid="release-funds-button"]');
    await page.click('[data-testid="confirm-release-button"]');
    
    // Verify release
    await expect(page.locator('[data-testid="release-success"]')).toBeVisible();
  });

  test('Dispute Resolution Flow', async ({ page }) => {
    // Setup: Create funded deal
    await page.click('[data-testid="create-deal-button"]');
    await page.fill('[data-testid="deal-title"]', 'Test Deal');
    await page.fill('[data-testid="deal-amount"]', '1000');
    await page.fill('[data-testid="seller-address"]', '0x1234567890123456789012345678901234567890');
    await page.click('[data-testid="submit-deal-button"]');
    await page.click('[data-testid="fund-deal-button"]');
    await page.click('[data-testid="confirm-funding-button"]');
    
    // Create dispute
    await page.click('[data-testid="create-dispute-button"]');
    await page.fill('[data-testid="dispute-reason"]', 'Item not as described');
    await page.fill('[data-testid="dispute-evidence"]', 'Photos and documentation');
    await page.click('[data-testid="submit-dispute-button"]');
    
    // Verify dispute created
    await expect(page.locator('[data-testid="dispute-created"]')).toBeVisible();
    
    // Vote on dispute (as arbitrator)
    await page.click('[data-testid="vote-button"]');
    await page.selectOption('[data-testid="vote-option"]', 'buyer');
    await page.fill('[data-testid="vote-reason"]', 'Evidence supports buyer claim');
    await page.click('[data-testid="submit-vote-button"]');
    
    // Verify vote recorded
    await expect(page.locator('[data-testid="vote-recorded"]')).toBeVisible();
  });

  test('Admin Override Functions', async ({ page }) => {
    // Login as admin
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="phone-login-tab"]');
    await page.fill('[data-testid="phone-input"]', '1111111111');
    await page.click('[data-testid="send-otp-button"]');
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp-button"]');
    
    // Navigate to admin panel
    await page.click('[data-testid="admin-panel-button"]');
    
    // Test emergency pause
    await page.click('[data-testid="emergency-pause-button"]');
    await page.click('[data-testid="confirm-pause-button"]');
    await expect(page.locator('[data-testid="system-paused"]')).toBeVisible();
    
    // Test force transfer
    await page.click('[data-testid="force-transfer-button"]');
    await page.fill('[data-testid="transfer-amount"]', '500');
    await page.fill('[data-testid="recipient-address"]', '0x1234567890123456789012345678901234567890');
    await page.click('[data-testid="confirm-transfer-button"]');
    await expect(page.locator('[data-testid="transfer-success"]')).toBeVisible();
  });
}); 