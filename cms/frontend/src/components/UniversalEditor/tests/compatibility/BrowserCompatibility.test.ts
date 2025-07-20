/**
 * Tests de compatibilité navigateur pour l'Éditeur Universel Portfolio
 * 
 * Ces tests vérifient que l'éditeur fonctionne correctement sur différents navigateurs.
 * Note: Ces tests sont conçus pour être exécutés avec Playwright ou une solution similaire
 * qui permet de tester sur différents navigateurs.
 */

import { test, expect } from '@playwright/test';
import { generateLargeContent } from '../performance/performanceTestUtils';

// URL de test
const TEST_URL = 'http://localhost:3000/editor-test';

// Tests de compatibilité de base
test.describe('Browser Compatibility Tests', () => {
  test('Editor loads correctly on Chrome', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    const editorExists = await page.isVisible('.universal-editor');
    expect(editorExists).toBe(true);
    
    await context.close();
  });
  
  test('Editor loads correctly on Firefox', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    });
    const page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    const editorExists = await page.isVisible('.universal-editor');
    expect(editorExists).toBe(true);
    
    await context.close();
  });
  
  test('Editor loads correctly on Safari', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    });
    const page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    const editorExists = await page.isVisible('.universal-editor');
    expect(editorExists).toBe(true);
    
    await context.close();
  });
  
  test('Editor loads correctly on Edge', async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
    });
    const page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    const editorExists = await page.isVisible('.universal-editor');
    expect(editorExists).toBe(true);
    
    await context.close();
  });
});

// Tests de fonctionnalités sur différents navigateurs
test.describe('Feature Compatibility Tests', () => {
  test('Text editing works on all browsers', async ({ browser }) => {
    // Test sur Chrome
    let context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    let page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Taper du texte
    await page.click('.universal-editor [contenteditable=true]');
    await page.keyboard.type('Test text on Chrome');
    
    // Vérifier que le texte a été saisi
    const chromeContent = await page.textContent('.universal-editor [contenteditable=true]');
    expect(chromeContent).toContain('Test text on Chrome');
    
    await context.close();
    
    // Test sur Firefox
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    });
    page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Taper du texte
    await page.click('.universal-editor [contenteditable=true]');
    await page.keyboard.type('Test text on Firefox');
    
    // Vérifier que le texte a été saisi
    const firefoxContent = await page.textContent('.universal-editor [contenteditable=true]');
    expect(firefoxContent).toContain('Test text on Firefox');
    
    await context.close();
  });
  
  test('Block menu works on all browsers', async ({ browser }) => {
    // Test sur Chrome
    let context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    let page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Ouvrir le menu de blocs
    await page.click('.universal-editor [contenteditable=true]');
    await page.keyboard.press('/');
    
    // Vérifier que le menu s'ouvre
    const chromeMenuVisible = await page.isVisible('.block-menu');
    expect(chromeMenuVisible).toBe(true);
    
    await context.close();
    
    // Test sur Firefox
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    });
    page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Ouvrir le menu de blocs
    await page.click('.universal-editor [contenteditable=true]');
    await page.keyboard.press('/');
    
    // Vérifier que le menu s'ouvre
    const firefoxMenuVisible = await page.isVisible('.block-menu');
    expect(firefoxMenuVisible).toBe(true);
    
    await context.close();
  });
});

// Tests de responsive design
test.describe('Responsive Design Tests', () => {
  test('Editor adapts to mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone 8 dimensions
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Vérifier que l'éditeur est visible
    const editorVisible = await page.isVisible('.universal-editor');
    expect(editorVisible).toBe(true);
    
    // Vérifier que les contrôles tactiles sont présents
    const touchControlsVisible = await page.isVisible('.touch-controls');
    expect(touchControlsVisible).toBe(true);
    
    await context.close();
  });
  
  test('Editor adapts to tablet viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }, // iPad dimensions
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();
    
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Vérifier que l'éditeur est visible
    const editorVisible = await page.isVisible('.universal-editor');
    expect(editorVisible).toBe(true);
    
    await context.close();
  });
});

// Tests d'accessibilité
test.describe('Accessibility Tests', () => {
  test('Editor is keyboard navigable', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Mettre le focus sur l'éditeur
    await page.focus('.universal-editor [contenteditable=true]');
    
    // Taper du texte
    await page.keyboard.type('Test keyboard navigation');
    
    // Vérifier que le texte a été saisi
    const content = await page.textContent('.universal-editor [contenteditable=true]');
    expect(content).toContain('Test keyboard navigation');
    
    // Tester la navigation avec Tab
    await page.keyboard.press('Tab');
    
    // Vérifier que le focus a changé
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).not.toBe('BODY');
  });
  
  test('Editor has proper ARIA attributes', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForSelector('.universal-editor');
    
    // Vérifier les attributs ARIA
    const hasRole = await page.getAttribute('.universal-editor [contenteditable=true]', 'role');
    expect(hasRole).toBe('textbox');
    
    const hasLabel = await page.getAttribute('.universal-editor [contenteditable=true]', 'aria-label');
    expect(hasLabel).toBeTruthy();
  });
});

// Configuration pour exécuter les tests sur différents navigateurs
test.describe.configure({ browsers: ['chromium', 'firefox', 'webkit'] });