#!/usr/bin/env node

/**
 * Test de diagnostic - ApproachEditor
 * Identifie les erreurs après l'autofix de Kiro IDE
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic ApproachEditor - Post Autofix');
console.log('============================================');

console.log('1️⃣ Vérification de la syntaxe des fichiers...');

const files = [
  'frontend/src/components/services/ApproachEditor.tsx',
  'frontend/src/pages/ServicesPage.tsx',
  'frontend/src/test/components/ApproachEditor.test.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`\n📄 ${file}:`);
    
    // Vérifications de base
    const checks = [
      {
        name: 'Parenthèses équilibrées',
        test: (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length
      },
      {
        name: 'Accolades équilibrées',
        test: (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length
      },
      {
        name: 'Crochets équilibrés',
        test: (content.match(/\[/g) || []).length === (content.match(/\]/g) || []).length
      },
      {
        name: 'Imports React',
        test: /import React/.test(content)
      },
      {
        name: 'Export présent',
        test: /export/.test(content)
      }
    ];
    
    checks.forEach(({ name, test }) => {
      console.log(`   ${test ? '✅' : '❌'} ${name}`);
    });
    
    // Recherche d'erreurs communes
    const errors = [];
    
    if (content.includes('undefined')) {
      errors.push('Références undefined détectées');
    }
    
    if (content.includes('null.')) {
      errors.push('Accès à propriété sur null');
    }
    
    if (/\w+\s*\(\s*\)/.test(content) && content.includes('is not a function')) {
      errors.push('Appel de fonction sur non-fonction');
    }
    
    if (errors.length > 0) {
      console.log('   ⚠️  Erreurs potentielles:');
      errors.forEach(error => console.log(`      - ${error}`));
    }
    
  } else {
    console.log(`❌ ${file}: Fichier non trouvé`);
  }
});

console.log('\n2️⃣ Vérification des imports/exports...');

// Vérifier ApproachEditor
const approachPath = path.join(__dirname, 'frontend/src/components/services/ApproachEditor.tsx');
if (fs.existsSync(approachPath)) {
  const content = fs.readFileSync(approachPath, 'utf8');
  
  const hasDefaultExport = /export default function ApproachEditor/.test(content);
  const hasHandleSave = /const handleSave = async/.test(content);
  const hasOnSave = /onSave\?/.test(content);
  
  console.log(`✅ Export par défaut: ${hasDefaultExport ? 'OK' : 'MANQUANT'}`);
  console.log(`✅ Fonction handleSave: ${hasHandleSave ? 'OK' : 'MANQUANTE'}`);
  console.log(`✅ Vérification onSave: ${hasOnSave ? 'OK' : 'MANQUANTE'}`);
}

// Vérifier ServicesPage
const servicesPath = path.join(__dirname, 'frontend/src/pages/ServicesPage.tsx');
if (fs.existsSync(servicesPath)) {
  const content = fs.readFileSync(servicesPath, 'utf8');
  
  const hasCorrectImport = /import ApproachEditor from/.test(content);
  const hasApproachUsage = /<ApproachEditor/.test(content);
  const hasOnSaveProp = /onSave=/.test(content);
  
  console.log(`✅ Import correct: ${hasCorrectImport ? 'OK' : 'INCORRECT'}`);
  console.log(`✅ Utilisation composant: ${hasApproachUsage ? 'OK' : 'MANQUANTE'}`);
  console.log(`✅ Prop onSave: ${hasOnSaveProp ? 'OK' : 'MANQUANTE'}`);
}

console.log('\n3️⃣ Test de l\'API...');

// Test rapide de l'API
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/services');
    if (response.ok) {
      console.log('✅ API accessible');
      const data = await response.json();
      if (data.approach) {
        console.log('✅ Données approach disponibles');
      } else {
        console.log('❌ Données approach manquantes');
      }
    } else {
      console.log(`❌ API erreur: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ API inaccessible: ${error.message}`);
  }
};

// Exécuter le test API si fetch est disponible
if (typeof fetch !== 'undefined') {
  testAPI();
} else {
  console.log('⚠️  Test API ignoré (fetch non disponible)');
}

console.log('\n4️⃣ Recommandations de correction...');

console.log('🔧 Actions à effectuer:');
console.log('   1. Redémarrer le serveur de développement');
console.log('   2. Vider le cache du navigateur (Ctrl+Shift+R)');
console.log('   3. Vérifier la console du navigateur pour les erreurs exactes');
console.log('   4. Tester le bouton sauvegarder étape par étape');

console.log('\n📋 Si le bouton sauvegarder ne répond pas:');
console.log('   - Vérifier que onSave est bien passé en prop');
console.log('   - Vérifier que hasUnsavedChanges devient true lors des modifications');
console.log('   - Vérifier qu\'il n\'y a pas d\'erreur JavaScript bloquante');
console.log('   - Tester avec les outils de développement ouverts');

console.log('\n🎯 Diagnostic terminé !');
console.log('======================');