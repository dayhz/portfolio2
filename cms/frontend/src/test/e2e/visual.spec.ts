import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('should match homepage CMS dashboard screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Wait for all content to load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-dashboard.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('should match hero editor modal screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit hero/i }).click();
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Wait for modal animation to complete
    await page.waitForTimeout(500);
    
    // Screenshot the modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveScreenshot('hero-editor-modal.png', {
      threshold: 0.2
    });
  });

  test('should match brands editor with logos screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit brands/i }).click();
    await expect(page.getByText('Edit Brands Section')).toBeVisible();
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveScreenshot('brands-editor-modal.png', {
      threshold: 0.2
    });
  });

  test('should match services editor screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit services/i }).click();
    await expect(page.getByText('Edit Services Section')).toBeVisible();
    
    await page.waitForLoadState('networkidle');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveScreenshot('services-editor-modal.png', {
      threshold: 0.2
    });
  });

  test('should match testimonials editor screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit testimonials/i }).click();
    await expect(page.getByText('Edit Testimonials Section')).toBeVisible();
    
    await page.waitForLoadState('networkidle');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveScreenshot('testimonials-editor-modal.png', {
      threshold: 0.2
    });
  });

  test('should match preview modal screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.waitForLoadState('networkidle');
    
    const previewModal = page.locator('[role="dialog"]');
    await expect(previewModal).toHaveScreenshot('preview-modal.png', {
      threshold: 0.2
    });
  });

  test('should match version history modal screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /versions/i }).click();
    await expect(page.getByText('Version History')).toBeVisible();
    
    await page.waitForLoadState('networkidle');
    
    const versionModal = page.locator('[role="dialog"]');
    await expect(versionModal).toHaveScreenshot('version-history-modal.png', {
      threshold: 0.2
    });
  });

  test('should match mobile layout screenshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('should match tablet layout screenshot', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('should match dark mode screenshot', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('should match error state screenshot', async ({ page }) => {
    // Mock API error
    await page.route('**/api/homepage', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/homepage');
    
    // Wait for error state to appear
    await expect(page.getByText(/error/i)).toBeVisible();
    
    await expect(page).toHaveScreenshot('homepage-error-state.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('should match loading state screenshot', async ({ page }) => {
    // Delay API response to capture loading state
    await page.route('**/api/homepage', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.continue();
    });
    
    await page.goto('/homepage');
    
    // Capture loading state
    await expect(page.getByText(/loading/i)).toBeVisible();
    
    await expect(page).toHaveScreenshot('homepage-loading-state.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('should match form validation errors screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit hero/i }).click();
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Clear required fields to trigger validation
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('');
    
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.fill('Short');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Wait for validation errors to appear
    await expect(page.getByText(/title is required/i)).toBeVisible();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveScreenshot('form-validation-errors.png', {
      threshold: 0.2
    });
  });

  test('should match success notification screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Success Test Title');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Wait for success notification
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
    
    // Screenshot the notification area
    const notification = page.locator('[role="status"], .toast, .notification').first();
    await expect(notification).toHaveScreenshot('success-notification.png', {
      threshold: 0.2
    });
  });

  test('should match drag and drop state screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit services/i }).click();
    await expect(page.getByText('Edit Services Section')).toBeVisible();
    
    // Simulate drag state
    const firstService = page.locator('[data-testid="service-item"]').first();
    await firstService.hover();
    
    // Add drag styling
    await firstService.evaluate(el => {
      el.classList.add('dragging');
    });
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveScreenshot('drag-drop-state.png', {
      threshold: 0.2
    });
  });

  test('should match unsaved changes warning screenshot', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Unsaved Changes Test');
    
    // Try to navigate away
    await page.getByRole('button', { name: /edit brands/i }).click();
    
    // Wait for warning dialog
    await expect(page.getByText(/unsaved changes/i)).toBeVisible();
    
    const warningDialog = page.locator('[role="dialog"]').last();
    await expect(warningDialog).toHaveScreenshot('unsaved-changes-warning.png', {
      threshold: 0.2
    });
  });
});