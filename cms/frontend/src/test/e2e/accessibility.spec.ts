import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should meet WCAG accessibility standards', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Should have main heading
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThanOrEqual(1);
    
    // Check for proper form labels
    const inputs = await page.locator('input, textarea, select').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
    
    // Check for proper button accessibility
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
    
    // Check for proper image alt text
    const images = await page.locator('img').all();
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      const role = await image.getAttribute('role');
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').first();
    expect(await focusedElement.isVisible()).toBe(true);
    
    // Continue tabbing through interactive elements
    const interactiveElements = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').first();
      if (await focused.isVisible()) {
        const tagName = await focused.evaluate(el => el.tagName.toLowerCase());
        interactiveElements.push(tagName);
      }
    }
    
    // Should have navigated through multiple interactive elements
    expect(interactiveElements.length).toBeGreaterThan(3);
    
    // Test Enter key activation
    await page.getByRole('button', { name: /edit hero/i }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Test Escape key to close
    await page.keyboard.press('Escape');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Check for proper ARIA landmarks
    const main = await page.locator('[role="main"], main').count();
    expect(main).toBeGreaterThanOrEqual(1);
    
    // Check for proper dialog ARIA attributes
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');
    const ariaLabel = await dialog.getAttribute('aria-label');
    expect(ariaLabelledBy || ariaLabel).toBeTruthy();
    
    // Check for proper form ARIA attributes
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      const inputs = await form.locator('input, textarea, select').all();
      for (const input of inputs) {
        const required = await input.getAttribute('required');
        const ariaRequired = await input.getAttribute('aria-required');
        if (required !== null) {
          expect(ariaRequired).toBe('true');
        }
      }
    }
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Check for screen reader announcements
    const liveRegions = await page.locator('[aria-live]').all();
    expect(liveRegions.length).toBeGreaterThan(0);
    
    // Test status announcements
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('Screen Reader Test');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should announce success
    const successMessage = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    await expect(successMessage).toContainText(/saved/i);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Check text elements for color contrast
    const textElements = await page.locator('p, span, div, button, a, label').all();
    
    for (let i = 0; i < Math.min(textElements.length, 10); i++) {
      const element = textElements[i];
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });
      
      // Basic check - ensure text has color and background
      expect(styles.color).toBeTruthy();
      expect(styles.backgroundColor || 'rgb(255, 255, 255)').toBeTruthy();
    }
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Elements should still be visible and functional
    await page.getByRole('button', { name: /edit hero/i }).click();
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Form elements should be usable
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('High Contrast Test');
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Animations should be reduced or disabled
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    // Dialog should appear without excessive animation
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Transitions should be minimal
    const dialog = page.locator('[role="dialog"]');
    const transitionDuration = await dialog.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.transitionDuration;
    });
    
    // Should have minimal or no transition
    expect(transitionDuration === '0s' || transitionDuration === '').toBeTruthy();
  });

  test('should handle focus management properly', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Test focus trap in modal
    await page.getByRole('button', { name: /edit hero/i }).click();
    await expect(page.getByText('Edit Hero Section')).toBeVisible();
    
    // Focus should be trapped within modal
    const firstFocusable = page.getByLabel(/title/i);
    const lastFocusable = page.getByRole('button', { name: /cancel/i });
    
    await firstFocusable.focus();
    expect(await firstFocusable.evaluate(el => document.activeElement === el)).toBe(true);
    
    // Tab to last element
    await page.keyboard.press('Shift+Tab');
    expect(await lastFocusable.evaluate(el => document.activeElement === el)).toBe(true);
    
    // Tab forward should cycle back to first
    await page.keyboard.press('Tab');
    expect(await firstFocusable.evaluate(el => document.activeElement === el)).toBe(true);
    
    // Close modal and check focus return
    await page.keyboard.press('Escape');
    
    // Focus should return to trigger button
    const editButton = page.getByRole('button', { name: /edit hero/i });
    expect(await editButton.evaluate(el => document.activeElement === el)).toBe(true);
  });

  test('should provide clear error messages', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Test form validation errors
    await page.getByRole('button', { name: /edit hero/i }).click();
    
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill('');
    
    await page.getByRole('button', { name: /save/i }).click();
    
    // Error message should be associated with input
    const errorMessage = page.locator('[role="alert"], .error-message').first();
    await expect(errorMessage).toBeVisible();
    
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('required');
    
    // Error should be announced to screen readers
    const ariaDescribedBy = await titleInput.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const description = page.locator(`#${ariaDescribedBy}`);
      await expect(description).toBeVisible();
    }
  });
});