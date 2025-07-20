#!/usr/bin/env node

/**
 * Script de test de compatibilité navigateur pour l'Éditeur Universel Portfolio
 * 
 * Ce script lance des tests de compatibilité sur différents navigateurs
 * en utilisant Playwright.
 */

const { chromium, firefox, webkit } = require('playwright');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  testUrl: 'http://localhost:3000/editor-test',
  screenshotsDir: path.resolve(__dirname, '../test-results/screenshots'),
  reportDir: path.resolve(__dirname, '../test-results/reports'),
  browsers: ['chromium', 'firefox', 'webkit'],
  viewports: [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ]
};

// Fonction principale
async function runBrowserTests() {
  console.log(chalk.blue('=== Tests de compatibilité navigateur ==='));
  
  try {
    // Créer les répertoires nécessaires
    createDirectories();
    
    // Exécuter les tests sur chaque navigateur
    for (const browserType of config.browsers) {
      await testBrowser(browserType);
    }
    
    // Générer le rapport
    generateReport();
    
    console.log(chalk.green('\n✅ Tests de compatibilité terminés avec succès !'));
    console.log(chalk.green(`Les résultats sont disponibles dans: ${config.reportDir}`));
  } catch (error) {
    console.error(chalk.red('\n❌ Erreur lors des tests de compatibilité:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Créer les répertoires nécessaires
function createDirectories() {
  console.log(chalk.yellow('\n📁 Création des répertoires de résultats...'));
  
  if (!fs.existsSync(config.screenshotsDir)) {
    fs.mkdirSync(config.screenshotsDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.reportDir)) {
    fs.mkdirSync(config.reportDir, { recursive: true });
  }
  
  console.log(chalk.green('✅ Répertoires créés'));
}

// Tester un navigateur spécifique
async function testBrowser(browserType) {
  console.log(chalk.yellow(`\n🌐 Test sur ${browserType}...`));
  
  let browser;
  
  try {
    // Lancer le navigateur
    switch (browserType) {
      case 'chromium':
        browser = await chromium.launch();
        break;
      case 'firefox':
        browser = await firefox.launch();
        break;
      case 'webkit':
        browser = await webkit.launch();
        break;
      default:
        throw new Error(`Type de navigateur non supporté: ${browserType}`);
    }
    
    // Tester chaque viewport
    for (const viewport of config.viewports) {
      await testViewport(browser, browserType, viewport);
    }
    
    console.log(chalk.green(`✅ Tests sur ${browserType} terminés`));
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors des tests sur ${browserType}:`));
    console.error(chalk.red(error.message));
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Tester un viewport spécifique
async function testViewport(browser, browserType, viewport) {
  console.log(chalk.cyan(`Testing ${viewport.name} (${viewport.width}x${viewport.height})...`));
  
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height }
  });
  
  const page = await context.newPage();
  
  try {
    // Accéder à la page de test
    await page.goto(config.testUrl);
    
    // Attendre que l'éditeur soit chargé
    await page.waitForSelector('.universal-editor', { timeout: 10000 });
    
    // Prendre une capture d'écran
    await page.screenshot({
      path: `${config.screenshotsDir}/${browserType}-${viewport.name}.png`,
      fullPage: true
    });
    
    // Exécuter les tests de base
    const results = await runBasicTests(page);
    
    // Enregistrer les résultats
    saveTestResults(browserType, viewport.name, results);
    
    console.log(chalk.green(`✅ Tests sur ${viewport.name} terminés`));
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors des tests sur ${viewport.name}:`));
    console.error(chalk.red(error.message));
    
    // Enregistrer l'erreur
    saveTestResults(browserType, viewport.name, {
      success: false,
      error: error.message
    });
  } finally {
    await context.close();
  }
}

// Exécuter les tests de base
async function runBasicTests(page) {
  const results = {
    success: true,
    tests: {}
  };
  
  // Test 1: Vérifier que l'éditeur est visible
  try {
    results.tests.editorVisible = await page.isVisible('.universal-editor');
  } catch (error) {
    results.tests.editorVisible = false;
    results.success = false;
  }
  
  // Test 2: Vérifier que l'éditeur est éditable
  try {
    await page.click('.universal-editor [contenteditable=true]');
    await page.keyboard.type('Test text');
    const content = await page.textContent('.universal-editor [contenteditable=true]');
    results.tests.editorEditable = content.includes('Test text');
  } catch (error) {
    results.tests.editorEditable = false;
    results.success = false;
  }
  
  // Test 3: Vérifier que le menu de blocs fonctionne
  try {
    await page.click('.universal-editor [contenteditable=true]');
    await page.keyboard.press('/');
    results.tests.blockMenuWorks = await page.isVisible('.block-menu');
  } catch (error) {
    results.tests.blockMenuWorks = false;
    results.success = false;
  }
  
  // Test 4: Vérifier que les boutons de la barre d'outils sont visibles
  try {
    results.tests.toolbarButtonsVisible = await page.isVisible('.editor-toolbar-button');
  } catch (error) {
    results.tests.toolbarButtonsVisible = false;
    results.success = false;
  }
  
  return results;
}

// Enregistrer les résultats des tests
function saveTestResults(browserType, viewportName, results) {
  const resultsFile = `${config.reportDir}/${browserType}-${viewportName}.json`;
  
  fs.writeFileSync(
    resultsFile,
    JSON.stringify({
      browser: browserType,
      viewport: viewportName,
      timestamp: new Date().toISOString(),
      ...results
    }, null, 2)
  );
}

// Générer le rapport
function generateReport() {
  console.log(chalk.yellow('\n📊 Génération du rapport...'));
  
  const reportFiles = fs.readdirSync(config.reportDir).filter(file => file.endsWith('.json'));
  const results = [];
  
  for (const file of reportFiles) {
    const content = fs.readFileSync(`${config.reportDir}/${file}`, 'utf8');
    results.push(JSON.parse(content));
  }
  
  // Calculer les statistiques
  const stats = {
    total: results.length,
    success: results.filter(r => r.success).length,
    failure: results.filter(r => !r.success).length,
    browsers: {}
  };
  
  for (const browserType of config.browsers) {
    const browserResults = results.filter(r => r.browser === browserType);
    stats.browsers[browserType] = {
      total: browserResults.length,
      success: browserResults.filter(r => r.success).length,
      failure: browserResults.filter(r => !r.success).length
    };
  }
  
  // Générer le rapport HTML
  const reportHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de compatibilité navigateur - Éditeur Universel Portfolio</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .stat-card {
      background-color: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      flex: 1;
      min-width: 200px;
    }
    .success {
      color: #2ecc71;
    }
    .failure {
      color: #e74c3c;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .screenshot {
      max-width: 300px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <h1>Rapport de compatibilité navigateur - Éditeur Universel Portfolio</h1>
  <p>Date du test: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Résumé</h2>
    <div class="stats">
      <div class="stat-card">
        <h3>Total</h3>
        <p>Tests: ${stats.total}</p>
        <p class="success">Succès: ${stats.success}</p>
        <p class="failure">Échecs: ${stats.failure}</p>
      </div>
      
      ${Object.entries(stats.browsers).map(([browser, data]) => `
        <div class="stat-card">
          <h3>${browser}</h3>
          <p>Tests: ${data.total}</p>
          <p class="success">Succès: ${data.success}</p>
          <p class="failure">Échecs: ${data.failure}</p>
        </div>
      `).join('')}
    </div>
  </div>
  
  <h2>Résultats détaillés</h2>
  <table>
    <thead>
      <tr>
        <th>Navigateur</th>
        <th>Viewport</th>
        <th>Statut</th>
        <th>Tests</th>
        <th>Capture d'écran</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(result => `
        <tr>
          <td>${result.browser}</td>
          <td>${result.viewport}</td>
          <td class="${result.success ? 'success' : 'failure'}">${result.success ? 'Succès' : 'Échec'}</td>
          <td>
            ${result.tests ? Object.entries(result.tests).map(([test, passed]) => `
              <div>${test}: ${passed ? '✅' : '❌'}</div>
            `).join('') : ''}
            ${result.error ? `<div class="failure">Erreur: ${result.error}</div>` : ''}
          </td>
          <td>
            <a href="../screenshots/${result.browser}-${result.viewport}.png" target="_blank">
              <img src="../screenshots/${result.browser}-${result.viewport}.png" alt="Capture ${result.browser} ${result.viewport}" class="screenshot">
            </a>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
  
  fs.writeFileSync(`${config.reportDir}/index.html`, reportHtml);
  
  console.log(chalk.green('✅ Rapport généré'));
}

// Exécuter le script
runBrowserTests().catch(error => {
  console.error(chalk.red('\n❌ Erreur fatale:'));
  console.error(chalk.red(error));
  process.exit(1);
});