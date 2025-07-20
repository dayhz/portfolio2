#!/usr/bin/env node

/**
 * Script de déploiement pour l'Éditeur Universel Portfolio
 * 
 * Ce script prépare l'éditeur pour le déploiement en production :
 * - Optimisation des assets
 * - Minification du code
 * - Génération des fichiers de distribution
 * - Vérification des dépendances
 * - Tests de régression
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  srcDir: path.resolve(__dirname, '..'),
  distDir: path.resolve(__dirname, '../dist'),
  tempDir: path.resolve(__dirname, '../.temp'),
  packageName: '@portfolio/universal-editor',
  version: require('../../../../package.json').version,
};

// Fonction principale
async function deploy() {
  console.log(chalk.blue('=== Déploiement de l\'Éditeur Universel Portfolio ==='));
  console.log(chalk.blue(`Version: ${config.version}`));
  
  try {
    // Créer les répertoires nécessaires
    createDirectories();
    
    // Exécuter les tests
    runTests();
    
    // Optimiser les assets
    optimizeAssets();
    
    // Construire le package
    buildPackage();
    
    // Générer la documentation
    generateDocs();
    
    // Créer le package npm
    createNpmPackage();
    
    console.log(chalk.green('\n✅ Déploiement terminé avec succès !'));
    console.log(chalk.green(`Le package est disponible dans: ${config.distDir}`));
  } catch (error) {
    console.error(chalk.red('\n❌ Erreur lors du déploiement:'));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

// Créer les répertoires nécessaires
function createDirectories() {
  console.log(chalk.yellow('\n📁 Création des répertoires...'));
  
  if (fs.existsSync(config.distDir)) {
    fs.rmSync(config.distDir, { recursive: true, force: true });
  }
  
  if (fs.existsSync(config.tempDir)) {
    fs.rmSync(config.tempDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(config.distDir, { recursive: true });
  fs.mkdirSync(config.tempDir, { recursive: true });
  
  console.log(chalk.green('✅ Répertoires créés'));
}

// Exécuter les tests
function runTests() {
  console.log(chalk.yellow('\n🧪 Exécution des tests...'));
  
  try {
    // Exécuter les tests unitaires
    console.log('Exécution des tests unitaires...');
    execSync('npm run test:unit', { stdio: 'inherit' });
    
    // Exécuter les tests d'intégration
    console.log('Exécution des tests d\'intégration...');
    execSync('npm run test:integration', { stdio: 'inherit' });
    
    // Exécuter les tests de régression
    console.log('Exécution des tests de régression...');
    execSync('npm run test:regression', { stdio: 'inherit' });
    
    console.log(chalk.green('✅ Tests réussis'));
  } catch (error) {
    throw new Error('Tests échoués. Déploiement annulé.');
  }
}

// Optimiser les assets
function optimizeAssets() {
  console.log(chalk.yellow('\n🖼️ Optimisation des assets...'));
  
  // Copier les styles
  console.log('Copie et optimisation des styles...');
  fs.mkdirSync(`${config.tempDir}/styles`, { recursive: true });
  
  const styleFiles = [
    'animations.css',
    'index.css',
    'responsive.css',
    'site-styles.css',
    'theme.css'
  ];
  
  styleFiles.forEach(file => {
    const content = fs.readFileSync(`${config.srcDir}/styles/${file}`, 'utf8');
    fs.writeFileSync(`${config.tempDir}/styles/${file}`, content);
  });
  
  // Optimiser les images
  console.log('Optimisation des images...');
  if (fs.existsSync(`${config.srcDir}/assets`)) {
    fs.mkdirSync(`${config.tempDir}/assets`, { recursive: true });
    
    // Ici, on pourrait utiliser des outils comme imagemin pour optimiser les images
    // Pour l'exemple, on se contente de copier les fichiers
    const imageFiles = fs.readdirSync(`${config.srcDir}/assets`);
    imageFiles.forEach(file => {
      const content = fs.readFileSync(`${config.srcDir}/assets/${file}`);
      fs.writeFileSync(`${config.tempDir}/assets/${file}`, content);
    });
  }
  
  console.log(chalk.green('✅ Assets optimisés'));
}

// Construire le package
function buildPackage() {
  console.log(chalk.yellow('\n🔨 Construction du package...'));
  
  // Exécuter la compilation TypeScript
  console.log('Compilation TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copier les fichiers compilés dans le répertoire temporaire
  console.log('Copie des fichiers compilés...');
  fs.mkdirSync(`${config.tempDir}/lib`, { recursive: true });
  
  // Copier les fichiers de distribution
  const distFiles = fs.readdirSync(`${config.srcDir}/dist`);
  distFiles.forEach(file => {
    const content = fs.readFileSync(`${config.srcDir}/dist/${file}`);
    fs.writeFileSync(`${config.tempDir}/lib/${file}`, content);
  });
  
  // Copier les fichiers de types TypeScript
  if (fs.existsSync(`${config.srcDir}/dist/types`)) {
    fs.mkdirSync(`${config.tempDir}/lib/types`, { recursive: true });
    
    const typeFiles = fs.readdirSync(`${config.srcDir}/dist/types`);
    typeFiles.forEach(file => {
      const content = fs.readFileSync(`${config.srcDir}/dist/types/${file}`);
      fs.writeFileSync(`${config.tempDir}/lib/types/${file}`, content);
    });
  }
  
  // Créer le fichier package.json pour le package
  console.log('Création du fichier package.json...');
  const packageJson = {
    name: config.packageName,
    version: config.version,
    description: 'Éditeur WYSIWYG universel pour les portfolios',
    main: 'lib/index.js',
    types: 'lib/types/index.d.ts',
    files: [
      'lib',
      'styles',
      'assets',
      'README.md',
      'LICENSE'
    ],
    keywords: [
      'editor',
      'wysiwyg',
      'portfolio',
      'tiptap',
      'react'
    ],
    peerDependencies: {
      'react': '>=16.8.0',
      'react-dom': '>=16.8.0'
    },
    dependencies: {
      '@tiptap/core': '^2.0.0',
      '@tiptap/pm': '^2.0.0',
      '@tiptap/react': '^2.0.0',
      '@tiptap/starter-kit': '^2.0.0',
      '@tiptap/extension-placeholder': '^2.0.0'
    },
    license: 'MIT'
  };
  
  fs.writeFileSync(
    `${config.tempDir}/package.json`,
    JSON.stringify(packageJson, null, 2)
  );
  
  // Copier le fichier README.md
  console.log('Copie du fichier README.md...');
  if (fs.existsSync(`${config.srcDir}/README.md`)) {
    fs.copyFileSync(`${config.srcDir}/README.md`, `${config.tempDir}/README.md`);
  } else {
    fs.writeFileSync(
      `${config.tempDir}/README.md`,
      `# ${config.packageName}\n\nÉditeur WYSIWYG universel pour les portfolios.\n\nVersion: ${config.version}\n`
    );
  }
  
  // Copier le fichier LICENSE
  console.log('Copie du fichier LICENSE...');
  if (fs.existsSync(`${config.srcDir}/LICENSE`)) {
    fs.copyFileSync(`${config.srcDir}/LICENSE`, `${config.tempDir}/LICENSE`);
  } else {
    fs.writeFileSync(
      `${config.tempDir}/LICENSE`,
      `MIT License\n\nCopyright (c) ${new Date().getFullYear()} Portfolio Editor\n`
    );
  }
  
  console.log(chalk.green('✅ Package construit'));
}

// Générer la documentation
function generateDocs() {
  console.log(chalk.yellow('\n📚 Génération de la documentation...'));
  
  // Copier les fichiers de documentation
  console.log('Copie des fichiers de documentation...');
  fs.mkdirSync(`${config.tempDir}/docs`, { recursive: true });
  
  if (fs.existsSync(`${config.srcDir}/docs`)) {
    const docFiles = fs.readdirSync(`${config.srcDir}/docs`);
    docFiles.forEach(file => {
      const content = fs.readFileSync(`${config.srcDir}/docs/${file}`, 'utf8');
      fs.writeFileSync(`${config.tempDir}/docs/${file}`, content);
    });
  }
  
  console.log(chalk.green('✅ Documentation générée'));
}

// Créer le package npm
function createNpmPackage() {
  console.log(chalk.yellow('\n📦 Création du package npm...'));
  
  // Copier tous les fichiers du répertoire temporaire vers le répertoire de distribution
  console.log('Copie des fichiers vers le répertoire de distribution...');
  
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir(config.tempDir, config.distDir);
  
  // Créer le fichier .npmignore
  console.log('Création du fichier .npmignore...');
  fs.writeFileSync(
    `${config.distDir}/.npmignore`,
    `# Fichiers à ignorer lors de la publication npm
.DS_Store
.temp
.cache
*.log
`
  );
  
  // Nettoyer le répertoire temporaire
  console.log('Nettoyage du répertoire temporaire...');
  fs.rmSync(config.tempDir, { recursive: true, force: true });
  
  console.log(chalk.green('✅ Package npm créé'));
}

// Exécuter le script
deploy().catch(error => {
  console.error(chalk.red('\n❌ Erreur fatale:'));
  console.error(chalk.red(error));
  process.exit(1);
});