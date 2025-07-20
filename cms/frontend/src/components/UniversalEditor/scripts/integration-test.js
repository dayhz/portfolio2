#!/usr/bin/env node

/**
 * Script de test d'intégration avec le site portfolio
 * 
 * Ce script vérifie que l'éditeur s'intègre correctement avec le site portfolio
 * en testant l'export et l'affichage du contenu.
 */

const { chromium } = require('playwright');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const config = {
  editorUrl: 'http://localhost:3000/editor-test',
  portfolioUrl: 'http://localhost:3001',
  testContentFile: path.resolve(__dirname, '../test-data/test-content.html'),
  exportDir: path.resolve(__dirname, '../test-results/exports'),
  screenshotsDir: path.resolve(__dirname, '../test-results/screenshots'),
  reportDir: path.resolve(__dirname, '../test-results/reports'),
  templates: ['poesial', 'zesty', 'nobe', 'ordine']
};

// Fonction principale
async function runIntegrationTests() {
  console.log(chalk.blue('=== Tests d\'intégration avec le site portfolio ==='));
  
  try {
    // Créer les répertoires nécessaires
    createDirectories();
    
    // Générer le contenu de test si nécessaire
    ensureTestContent();
    
    // Lancer le navigateur
    const browser = await chromium.launch();
    
    try {
      // Tester chaque template
      for (const template of config.templates) {
        await testTemplateIntegration(browser, template);
      }
    } finally {
      await browser.close();
    }
    
    // Générer le rapport
    generateReport();
    
    console.log(chalk.green('\n✅ Tests d\'intégration terminés avec succès !'));
    console.log(chalk.green(`Les résultats sont disponibles dans: ${config.reportDir}`));
  } catch (error) {
    console.error(chalk.red('\n❌ Erreur lors des tests d\'intégration:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Créer les répertoires nécessaires
function createDirectories() {
  console.log(chalk.yellow('\n📁 Création des répertoires de résultats...'));
  
  if (!fs.existsSync(config.exportDir)) {
    fs.mkdirSync(config.exportDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.screenshotsDir)) {
    fs.mkdirSync(config.screenshotsDir, { recursive: true });
  }
  
  if (!fs.existsSync(config.reportDir)) {
    fs.mkdirSync(config.reportDir, { recursive: true });
  }
  
  // Créer le répertoire pour le contenu de test
  const testDataDir = path.dirname(config.testContentFile);
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  console.log(chalk.green('✅ Répertoires créés'));
}

// S'assurer que le contenu de test existe
function ensureTestContent() {
  console.log(chalk.yellow('\n📄 Vérification du contenu de test...'));
  
  if (!fs.existsSync(config.testContentFile)) {
    console.log('Génération du contenu de test...');
    
    // Générer un contenu de test avec tous les types de blocs
    const testContent = `
<h1 class="universal-heading" data-level="1">Contenu de test pour l'intégration</h1>

<section class="section">
  <div class="u-container">
    <div class="temp-rich u-color-dark w-richtext">
      <p>Ceci est un paragraphe de test pour vérifier l'intégration de l'éditeur avec le site portfolio. Il contient du texte <strong>en gras</strong> et du texte <em>en italique</em>.</p>
      <p>Voici un deuxième paragraphe pour tester le formatage et l'espacement.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="u-container">
    <div class="temp-img_container">
      <div class="temp-img">
        <div class="img-wrp">
          <img src="https://picsum.photos/800/600?random=1" alt="Image de test" class="comp-img" />
        </div>
      </div>
    </div>
  </div>
</section>

<h2 class="universal-heading" data-level="2">Section avec témoignage</h2>

<section class="section">
  <div class="u-container">
    <div class="temp-comp-testimony">
      <div class="testimony">Ceci est un témoignage de test pour vérifier l'intégration de l'éditeur avec le site portfolio.</div>
      <div class="author">Auteur Test</div>
      <div class="role">Rôle Test</div>
    </div>
  </div>
</section>

<h2 class="universal-heading" data-level="2">Section avec grille d'images</h2>

<section class="section">
  <div class="u-container">
    <div class="temp-comp-img_grid" style="grid-template-columns: repeat(2, 1fr); gap: 2rem;">
      <div class="img_grid-container">
        <div class="img-wrp">
          <img src="https://picsum.photos/800/600?random=2" alt="Image grille 1" class="comp-img" />
        </div>
      </div>
      <div class="img_grid-container">
        <div class="img-wrp">
          <img src="https://picsum.photos/800/600?random=3" alt="Image grille 2" class="comp-img" />
        </div>
      </div>
    </div>
  </div>
</section>

<h3 class="universal-heading" data-level="3">Section avec vidéo</h3>

<section class="section">
  <div class="u-container">
    <div class="temp-video_container">
      <div class="temp-video">
        <div class="video-wrp">
          <video controls>
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      </div>
    </div>
  </div>
</section>
    `;
    
    fs.writeFileSync(config.testContentFile, testContent);
    console.log(chalk.green('✅ Contenu de test généré'));
  } else {
    console.log(chalk.green('✅ Contenu de test existant'));
  }
}

// Tester l'intégration avec un template spécifique
async function testTemplateIntegration(browser, template) {
  console.log(chalk.yellow(`\n🔄 Test d'intégration avec le template ${template}...`));
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Étape 1: Charger l'éditeur avec le contenu de test
    console.log(`Chargement de l'éditeur avec le template ${template}...`);
    await page.goto(`${config.editorUrl}?template=${template}`);
    
    // Attendre que l'éditeur soit chargé
    await page.waitForSelector('.universal-editor', { timeout: 10000 });
    
    // Charger le contenu de test
    const testContent = fs.readFileSync(config.testContentFile, 'utf8');
    await page.evaluate((content) => {
      // Supposons qu'il y a une fonction pour définir le contenu de l'éditeur
      window.setEditorContent(content);
    }, testContent);
    
    // Attendre que le contenu soit chargé
    await page.waitForTimeout(1000);
    
    // Prendre une capture d'écran de l'éditeur
    await page.screenshot({
      path: `${config.screenshotsDir}/editor-${template}.png`,
      fullPage: true
    });
    
    // Étape 2: Exporter le contenu
    console.log(`Export du contenu avec le template ${template}...`);
    
    // Cliquer sur le bouton d'export
    await page.click('.editor-toolbar-button[title="Exporter"]');
    
    // Attendre que l'export soit terminé
    await page.waitForTimeout(1000);
    
    // Récupérer le contenu exporté
    const exportedContent = await page.evaluate(() => {
      // Supposons qu'il y a une fonction pour récupérer le contenu exporté
      return window.getExportedContent();
    });
    
    // Enregistrer le contenu exporté
    fs.writeFileSync(`${config.exportDir}/${template}.html`, exportedContent);
    
    // Étape 3: Vérifier l'intégration avec le site portfolio
    console.log(`Vérification de l'intégration avec le site portfolio (template ${template})...`);
    
    // Accéder au site portfolio avec le template spécifié
    await page.goto(`${config.portfolioUrl}/${template}.html`);
    
    // Attendre que la page soit chargée
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Injecter le contenu exporté dans la page
    await page.evaluate((content) => {
      // Supposons qu'il y a un conteneur pour le contenu
      const contentContainer = document.querySelector('#content-container');
      if (contentContainer) {
        contentContainer.innerHTML = content;
      }
    }, exportedContent);
    
    // Attendre que le contenu soit rendu
    await page.waitForTimeout(1000);
    
    // Prendre une capture d'écran du site
    await page.screenshot({
      path: `${config.screenshotsDir}/site-${template}.png`,
      fullPage: true
    });
    
    // Vérifier que les éléments sont correctement rendus
    const results = await checkRendering(page);
    
    // Enregistrer les résultats
    saveTestResults(template, results);
    
    console.log(chalk.green(`✅ Test d'intégration avec ${template} terminé`));
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors du test d'intégration avec ${template}:`));
    console.error(chalk.red(error.message));
    
    // Enregistrer l'erreur
    saveTestResults(template, {
      success: false,
      error: error.message
    });
  } finally {
    await context.close();
  }
}

// Vérifier le rendu des éléments
async function checkRendering(page) {
  const results = {
    success: true,
    elements: {}
  };
  
  // Vérifier les titres
  try {
    results.elements.headings = await page.$$eval('h1, h2, h3', (elements) => elements.length > 0);
  } catch (error) {
    results.elements.headings = false;
    results.success = false;
  }
  
  // Vérifier les paragraphes
  try {
    results.elements.paragraphs = await page.$$eval('p', (elements) => elements.length > 0);
  } catch (error) {
    results.elements.paragraphs = false;
    results.success = false;
  }
  
  // Vérifier les images
  try {
    results.elements.images = await page.$$eval('img', (elements) => elements.length > 0);
  } catch (error) {
    results.elements.images = false;
    results.success = false;
  }
  
  // Vérifier les témoignages
  try {
    results.elements.testimonies = await page.$$eval('.testimony', (elements) => elements.length > 0);
  } catch (error) {
    results.elements.testimonies = false;
    results.success = false;
  }
  
  // Vérifier les grilles d'images
  try {
    results.elements.imageGrids = await page.$$eval('.temp-comp-img_grid', (elements) => elements.length > 0);
  } catch (error) {
    results.elements.imageGrids = false;
    results.success = false;
  }
  
  // Vérifier les vidéos
  try {
    results.elements.videos = await page.$$eval('video', (elements) => elements.length > 0);
  } catch (error) {
    results.elements.videos = false;
    results.success = false;
  }
  
  return results;
}

// Enregistrer les résultats des tests
function saveTestResults(template, results) {
  const resultsFile = `${config.reportDir}/integration-${template}.json`;
  
  fs.writeFileSync(
    resultsFile,
    JSON.stringify({
      template,
      timestamp: new Date().toISOString(),
      ...results
    }, null, 2)
  );
}

// Générer le rapport
function generateReport() {
  console.log(chalk.yellow('\n📊 Génération du rapport d\'intégration...'));
  
  const reportFiles = fs.readdirSync(config.reportDir).filter(file => file.startsWith('integration-') && file.endsWith('.json'));
  const results = [];
  
  for (const file of reportFiles) {
    const content = fs.readFileSync(`${config.reportDir}/${file}`, 'utf8');
    results.push(JSON.parse(content));
  }
  
  // Calculer les statistiques
  const stats = {
    total: results.length,
    success: results.filter(r => r.success).length,
    failure: results.filter(r => !r.success).length
  };
  
  // Générer le rapport HTML
  const reportHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport d'intégration - Éditeur Universel Portfolio</title>
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
    .comparison {
      display: flex;
      gap: 20px;
      margin-top: 20px;
    }
    .comparison-item {
      flex: 1;
    }
  </style>
</head>
<body>
  <h1>Rapport d'intégration - Éditeur Universel Portfolio</h1>
  <p>Date du test: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Résumé</h2>
    <div class="stats">
      <div class="stat-card">
        <h3>Total</h3>
        <p>Templates testés: ${stats.total}</p>
        <p class="success">Succès: ${stats.success}</p>
        <p class="failure">Échecs: ${stats.failure}</p>
      </div>
    </div>
  </div>
  
  <h2>Résultats détaillés</h2>
  <table>
    <thead>
      <tr>
        <th>Template</th>
        <th>Statut</th>
        <th>Éléments rendus</th>
      </tr>
    </thead>
    <tbody>
      ${results.map(result => `
        <tr>
          <td>${result.template}</td>
          <td class="${result.success ? 'success' : 'failure'}">${result.success ? 'Succès' : 'Échec'}</td>
          <td>
            ${result.elements ? Object.entries(result.elements).map(([element, rendered]) => `
              <div>${element}: ${rendered ? '✅' : '❌'}</div>
            `).join('') : ''}
            ${result.error ? `<div class="failure">Erreur: ${result.error}</div>` : ''}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Comparaisons visuelles</h2>
  ${results.map(result => `
    <h3>Template: ${result.template}</h3>
    <div class="comparison">
      <div class="comparison-item">
        <h4>Éditeur</h4>
        <img src="../screenshots/editor-${result.template}.png" alt="Éditeur ${result.template}" class="screenshot">
      </div>
      <div class="comparison-item">
        <h4>Site</h4>
        <img src="../screenshots/site-${result.template}.png" alt="Site ${result.template}" class="screenshot">
      </div>
    </div>
  `).join('')}
</body>
</html>
  `;
  
  fs.writeFileSync(`${config.reportDir}/integration.html`, reportHtml);
  
  console.log(chalk.green('✅ Rapport d\'intégration généré'));
}

// Exécuter le script
runIntegrationTests().catch(error => {
  console.error(chalk.red('\n❌ Erreur fatale:'));
  console.error(chalk.red(error));
  process.exit(1);
});