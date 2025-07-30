import { test, expect } from '@playwright/test';

test.describe('Homepage CMS Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage CMS
    await page.goto('/homepage');
    
    // Wait for page to load
    await expect(page.getByText('Homepage CMS')).toBeVisible();
  });

  test('should complete full CMS workflow from edit to publish', async ({ page }) => {
    // Step 1: Edit Hero Section
    await page.getByRole('button', { name: /edit hero/i }).click();
    await expect(page.getByText('Edit Hero Section')).toBeVisible();

    // Modify hero content
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Updated Hero Title');
    
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.fill('This is an updated hero description with enough content to pass validation');

    // Save hero changes
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();

    // Step 2: Edit Brands Section
    await page.getByRole('button', { name: /edit brands/i }).click();
    await expect(page.getByText('Edit Brands Section')).toBeVisible();

    // Add a new logo
    await page.getByRole('button', { name: /add logo/i }).click();
    
    const logoNameInput = page.getByPlaceholder(/logo name/i).last();
    await logoNameInput.fill('New Client');
    
    const logoUrlInput = page.getByPlaceholder(/logo url/i).last();
    await logoUrlInput.fill('/images/new-client.png');

    // Save brands changes
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();

    // Step 3: Edit Services Section
    await page.getByRole('button', { name: /edit services/i }).click();
    await expect(page.getByText('Edit Services Section')).toBeVisible();

    // Modify existing service
    const serviceTitle = page.getByPlaceholder(/service title/i).first();
    await serviceTitle.fill('Updated Service Title');

    // Save services changes
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();

    // Step 4: Preview Changes
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Updated Hero Title')).toBeVisible();
    
    // Close preview
    await page.getByRole('button', { name: /close/i }).click();

    // Step 5: Save All Changes
    await page.getByRole('button', { name: /save all/i }).click();
    await expect(page.getByText(/all changes saved/i)).toBeVisible();

    // Step 6: Publish Changes
    await page.getByRole('button', { name: /publish/i }).click();
    
    // Confirm publish
    await expect(page.getByText(/confirm publish/i)).toBeVisible();
    await page.getByRole('button', { name: /confirm/i }).click();
    
    await expect(page.getByText(/published successfully/i)).toBeVisible();
  });

  test('should handle version management workflow', async ({ page }) => {
    // Create a new version
    await page.getByRole('button', { name: /versions/i }).click();
    await expect(page.getByText('Version History')).toBeVisible();

    await page.getByRole('button', { name: /create version/i }).click();
    
    const versionNameInput = page.getByPlaceholder(/version name/i);
    await versionNameInput.fill('Test Version');
    
    await page.getByRole('button', { name: /save version/i }).click();
    await expect(page.getByText(/version created/i)).toBeVisible();

    // Make some changes
    await page.getByRole('button', { name: /edit hero/i }).click();
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Version Test Title');
    await page.getByRole('button', { name: /save/i }).click();

    // Create another version
    await page.getByRole('button', { name: /versions/i }).click();
    await page.getByRole('button', { name: /create version/i }).click();
    
    const versionNameInput2 = page.getByPlaceholder(/version name/i);
    await versionNameInput2.fill('Second Version');
    await page.getByRole('button', { name: /save version/i }).click();

    // Restore previous version
    await page.getByText('Test Version').click();
    await page.getByRole('button', { name: /restore/i }).click();
    
    await expect(page.getByText(/version restored/i)).toBeVisible();
  });

  test('should validate form inputs and show errors', async ({ page }) => {
    // Test hero section validation
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    // Clear required fields
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('');
    
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.fill('Short');

    // Try to save with invalid data
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/description must be at least/i)).toBeVisible();

    // Fix validation errors
    await titleInput.fill('Valid Title');
    await descriptionInput.fill('This is a valid description with enough content');
    
    // Should be able to save now
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
  });

  test('should handle drag and drop reordering', async ({ page }) => {
    // Test services reordering
    await page.getByRole('button', { name: /edit services/i }).click();
    
    // Wait for services to load
    await expect(page.getByText('Edit Services Section')).toBeVisible();
    
    // Get service items
    const firstService = page.locator('[data-testid="service-item"]').first();
    const secondService = page.locator('[data-testid="service-item"]').nth(1);
    
    // Perform drag and drop
    await firstService.dragTo(secondService);
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
  });

  test('should handle media upload', async ({ page }) => {
    // Test logo upload in brands section
    await page.getByRole('button', { name: /edit brands/i }).click();
    
    // Click upload button
    await page.getByRole('button', { name: /upload logo/i }).first().click();
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    });
    
    // Should show upload progress
    await expect(page.getByText(/uploading/i)).toBeVisible();
    
    // Should complete upload
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible();
  });

  test('should handle unsaved changes warning', async ({ page }) => {
    // Make changes without saving
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Unsaved Changes Test');
    
    // Try to navigate away
    await page.getByRole('button', { name: /edit brands/i }).click();
    
    // Should show unsaved changes warning
    await expect(page.getByText(/unsaved changes/i)).toBeVisible();
    await expect(page.getByText(/discard changes/i)).toBeVisible();
    
    // Cancel navigation
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Should stay on hero editor
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Now should be able to navigate
    await page.getByRole('button', { name: /edit brands/i }).click();
    await expect(page.getByText('Edit Brands Section')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/homepage/hero', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Try to save hero section
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Error Test Title');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show error message
    await expect(page.getByText(/error saving/i)).toBeVisible();
    await expect(page.getByText(/server error/i)).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should adapt layout for mobile
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    
    // Mobile navigation should work
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Edit functionality should work on mobile
    await page.getByRole('button', { name: /edit hero/i }).click();
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Form should be usable on mobile
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Mobile Test Title');
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
  });

  test('should handle large content updates efficiently', async ({ page }) => {
    // Test with large testimonials section
    await page.getByRole('button', { name: /edit testimonials/i }).click();
    
    // Add multiple testimonials
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /add testimonial/i }).click();
      
      const textInput = page.getByPlaceholder(/testimonial text/i).last();
      await textInput.fill(`This is testimonial number ${i + 1} with enough content to pass validation requirements and test performance.`);
      
      const nameInput = page.getByPlaceholder(/client name/i).last();
      await nameInput.fill(`Client ${i + 1}`);
      
      const titleInput = page.getByPlaceholder(/client title/i).last();
      await titleInput.fill(`Title ${i + 1}`);
    }
    
    // Save should complete within reasonable time
    const startTime = Date.now();
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
    const endTime = Date.now();
    
    // Should complete within 5 seconds
    expect(endTime - startTime).toBeLessThan(5000);
  });

  test('should verify content updates reflect on portfolio site', async ({ page, context }) => {
    // Make changes to hero section
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    const uniqueTitle = `Portfolio Test ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
    
    // Publish changes
    await page.getByRole('button', { name: /publish/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/published successfully/i)).toBeVisible();
    
    // Open portfolio site in new tab
    const portfolioPage = await context.newPage();
    await portfolioPage.goto('http://localhost:3000'); // Portfolio site URL
    
    // Verify changes are reflected
    await expect(portfolioPage.getByText(uniqueTitle)).toBeVisible();
    
    await portfolioPage.close();
  });
});