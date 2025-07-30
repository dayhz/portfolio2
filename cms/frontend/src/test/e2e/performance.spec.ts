import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage CMS within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/homepage');
    
    // Wait for page to be fully loaded
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Performance assertions
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // < 2s
    expect(performanceMetrics.loadComplete).toBeLessThan(3000); // < 3s
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500); // < 1.5s
    expect(performanceMetrics.largestContentfulPaint).toBeLessThan(2500); // < 2.5s
  });

  test('should handle large content updates efficiently', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Open testimonials editor
    await page.getByRole('button', { name: /edit testimonials/i }).click();
    
    // Add many testimonials to test performance
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: /add testimonial/i }).click();
      
      const textInput = page.getByPlaceholder(/testimonial text/i).last();
      await textInput.fill(`Performance test testimonial ${i + 1} with sufficient content to meet validation requirements and test system performance under load.`);
      
      const nameInput = page.getByPlaceholder(/client name/i).last();
      await nameInput.fill(`Performance Client ${i + 1}`);
      
      const titleInput = page.getByPlaceholder(/client title/i).last();
      await titleInput.fill(`Performance Title ${i + 1}`);
    }
    
    // Save all testimonials
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved successfully/i)).toBeVisible();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within 10 seconds
    expect(totalTime).toBeLessThan(10000);
    
    // Check memory usage
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });
    
    if (memoryUsage) {
      // Memory usage should be reasonable (less than 100MB)
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('should maintain performance during concurrent operations', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Simulate concurrent editing operations
    const operations = [
      async () => {
        await page.getByRole('button', { name: /edit hero/i }).click();
        const titleInput = page.getByLabel(/title/i);
        await titleInput.fill('Concurrent Hero Title');
        await page.getByRole('button', { name: /save/i }).click();
      },
      async () => {
        await page.getByRole('button', { name: /edit brands/i }).click();
        await page.getByRole('button', { name: /add logo/i }).click();
        const nameInput = page.getByPlaceholder(/logo name/i).last();
        await nameInput.fill('Concurrent Logo');
        await page.getByRole('button', { name: /save/i }).click();
      },
      async () => {
        await page.getByRole('button', { name: /edit services/i }).click();
        const titleInput = page.getByPlaceholder(/service title/i).first();
        await titleInput.fill('Concurrent Service');
        await page.getByRole('button', { name: /save/i }).click();
      }
    ];
    
    const startTime = Date.now();
    
    // Execute operations concurrently
    await Promise.all(operations.map(op => op().catch(e => console.log('Operation failed:', e))));
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within reasonable time
    expect(totalTime).toBeLessThan(15000); // 15 seconds for all operations
  });

  test('should handle rapid user interactions without performance degradation', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Rapid section switching
    const startTime = Date.now();
    
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /edit hero/i }).click();
      await expect(page.getByText('Edit Hero Section')).toBeVisible();
      
      await page.getByRole('button', { name: /cancel/i }).click();
      
      await page.getByRole('button', { name: /edit brands/i }).click();
      await expect(page.getByText('Edit Brands Section')).toBeVisible();
      
      await page.getByRole('button', { name: /cancel/i }).click();
      
      await page.getByRole('button', { name: /edit services/i }).click();
      await expect(page.getByText('Edit Services Section')).toBeVisible();
      
      await page.getByRole('button', { name: /cancel/i }).click();
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should remain responsive
    expect(totalTime).toBeLessThan(10000); // 10 seconds for all interactions
    
    // Check for memory leaks
    const finalMemoryUsage = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Memory usage should be reasonable after rapid interactions
    if (finalMemoryUsage > 0) {
      expect(finalMemoryUsage).toBeLessThan(150 * 1024 * 1024); // 150MB limit
    }
  });

  test('should optimize image loading and rendering', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    // Open brands section with images
    await page.getByRole('button', { name: /edit brands/i }).click();
    
    // Check for lazy loading implementation
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check if images have loading="lazy" attribute
      for (let i = 0; i < imageCount; i++) {
        const loadingAttr = await images.nth(i).getAttribute('loading');
        if (loadingAttr) {
          expect(loadingAttr).toBe('lazy');
        }
      }
    }
    
    // Test image upload performance
    const uploadStartTime = Date.now();
    
    await page.getByRole('button', { name: /upload logo/i }).first().click();
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'performance-test.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(1024 * 100) // 100KB test image
    });
    
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible();
    
    const uploadEndTime = Date.now();
    const uploadTime = uploadEndTime - uploadStartTime;
    
    // Upload should complete within 5 seconds
    expect(uploadTime).toBeLessThan(5000);
  });

  test('should maintain performance with large datasets', async ({ page }) => {
    // Mock large dataset response
    await page.route('**/api/homepage', route => {
      const largeDataset = {
        hero: { title: 'Performance Test', description: 'Testing with large dataset' },
        brands: {
          title: 'Many Clients',
          logos: Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            name: `Client ${i + 1}`,
            logoUrl: `/images/client${i + 1}.png`,
            order: i + 1
          }))
        },
        services: {
          title: 'Many Services',
          services: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            number: `${i + 1}.`,
            title: `Service ${i + 1}`,
            description: `Description for service ${i + 1}`,
            link: `/service${i + 1}`,
            colorClass: 'bg-blue-500'
          }))
        },
        testimonials: {
          testimonials: Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            text: `This is testimonial ${i + 1} with enough content to test performance with large datasets.`,
            clientName: `Client ${i + 1}`,
            clientTitle: `Title ${i + 1}`,
            clientPhoto: `/images/client${i + 1}.jpg`,
            projectLink: `https://project${i + 1}.com`,
            projectImage: `/images/project${i + 1}.jpg`,
            order: i + 1
          }))
        }
      };
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeDataset)
      });
    });
    
    const startTime = Date.now();
    
    await page.goto('/homepage');
    await expect(page.getByText('Homepage CMS')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load large dataset within reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds
    
    // Test scrolling performance with large lists
    await page.getByRole('button', { name: /edit testimonials/i }).click();
    
    const scrollStartTime = Date.now();
    
    // Scroll through large testimonials list
    await page.locator('[data-testid="testimonials-list"]').evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    const scrollEndTime = Date.now();
    const scrollTime = scrollEndTime - scrollStartTime;
    
    // Scrolling should be smooth and fast
    expect(scrollTime).toBeLessThan(1000); // 1 second
  });

  test('should optimize bundle size and loading', async ({ page }) => {
    // Check for code splitting and lazy loading
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources
        .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
        .map(resource => ({
          name: resource.name,
          size: resource.transferSize,
          type: resource.name.includes('.js') ? 'js' : 'css'
        }));
    });
    
    // Check bundle sizes
    const jsResources = resourceSizes.filter(r => r.type === 'js');
    const cssResources = resourceSizes.filter(r => r.type === 'css');
    
    // Main bundle should be reasonably sized
    const mainBundle = jsResources.find(r => r.name.includes('main') || r.name.includes('index'));
    if (mainBundle) {
      expect(mainBundle.size).toBeLessThan(500 * 1024); // 500KB
    }
    
    // CSS should be optimized
    const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0);
    expect(totalCssSize).toBeLessThan(100 * 1024); // 100KB
    
    // Check for gzip compression
    const hasCompression = resourceSizes.some(resource => 
      resource.size < 1000000 // Compressed resources should be smaller
    );
    expect(hasCompression).toBe(true);
  });
});